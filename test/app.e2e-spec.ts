import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as pactum from 'pactum';

import { AppModule } from '../src/app.module';
import { ValidationPipe } from '../src/pipe';
import { PrismaService } from '../src/prisma/prisma.service';

import { AuthDto } from '../src/auth/dto';
import { UpdateUserDto } from '../src/user/dto';
import { BookmarkDto } from '../src/bookmark/dto';

describe('App (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    prisma = app.get(PrismaService);
    const port = 3333;
    await app.listen(port);
    await app.init();
    await prisma.clean();
    pactum.request.setBaseUrl(`http://localhost:${port}`);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const body: AuthDto = {
      email: 'jhon.doe@gmail.com',
      password: '123',
    };
    describe('SignUp', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: body.password,
          })
          .expectStatus(422)
          .expectJsonLike({ statusCode: 422, message: 'Unprocessable Entity' });
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: body.email,
          })
          .expectStatus(422)
          .expectJsonLike({ statusCode: 422, message: 'Unprocessable Entity' });
      });
      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(422)
          .expectJsonLike({ statusCode: 422, message: 'Unprocessable Entity' });
      });
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(body)
          .expectStatus(201);
      });
      it('should throw if email already taken', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(body)
          .expectStatus(422)
          .expectBodyContains('The email is already taken');
      });
    });
    describe('SignIn', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: body.password,
          })
          .expectStatus(422)
          .expectJsonLike({ statusCode: 422, message: 'Unprocessable Entity' });
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: body.email,
          })
          .expectStatus(422)
          .expectJsonLike({ statusCode: 422, message: 'Unprocessable Entity' });
      });
      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(422)
          .expectJsonLike({ statusCode: 422, message: 'Unprocessable Entity' });
      });
      it('should throw if email not found', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: 'foo@bar.com',
            password: body.password,
          })
          .expectStatus(422)
          .expectBodyContains('Invalid credentials');
      });
      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(body)
          .expectStatus(200)
          .stores('accessToken', 'accessToken');
      });
    });
  });
  describe('User', () => {
    describe('Get me', () => {
      it('should throw if no token', () => {
        return pactum.spec().get('/users/me').expectStatus(401);
      });
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200)
          .expectJsonLike({ email: 'jhon.doe@gmail.com' });
      });
    });
    describe('Edit user', () => {
      it('should throw if body is empty', () => {
        return pactum
          .spec()
          .put('/users/me')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(422)
          .expectJsonLike({ statusCode: 422, message: 'Unprocessable Entity' });
      });
      it('should update user', () => {
        const body: UpdateUserDto = {
          email: 'jhon.doe@gmail.com',
          firstName: 'jhon',
          lastName: 'doe',
        };
        return pactum
          .spec()
          .put('/users/me')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .withBody(body)
          .expectStatus(200)
          .expectJsonLike(body);
      });
    });
  });
  describe('Bookmark', () => {
    describe('Get empty bookmarks', () => {
      it('should get my bookmarks is empty', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200)
          .expectBody([]);
      });
    });
    describe('Create bookmark', () => {
      const dto: BookmarkDto = {
        title: 'First Bookmark',
        description: 'My first bookmark',
        link: 'https://google.com',
      };
      it('should throw if empty body', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(422)
          .expectJsonLike({ statusCode: 422, message: 'Unprocessable Entity' });
      });
      it('should create a bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
      it('should visible my bookmark after created', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200)
          .expectJsonLength(1)
          .expectBodyContains('$S{bookmarkId}');
      });
    });
    describe('Get bookmark by id', () => {
      it('should get my bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });
    describe('Edit bookmark by id', () => {
      const dto: BookmarkDto = {
        title: 'First Bookmark Edited',
        description: 'My first bookmark',
        link: 'https://google.com',
      };
      it('should throw if empty body', () => {
        return pactum
          .spec()
          .put('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(422)
          .expectJsonLike({ statusCode: 422, message: 'Unprocessable Entity' });
      });
      it('should update bookmark by id', () => {
        return pactum
          .spec()
          .put('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}')
          .expectBodyContains(dto.title);
      });
    });
    describe('Delete bookmark by id', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(204)
          .expectBody('');
      });
      it('should not visible bookmark after deleted', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200)
          .expectBody([]);
      });
    });
  });
});
