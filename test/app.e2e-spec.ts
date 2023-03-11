import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from '../src/auth/dto';
import { UpdateUserDto } from '../src/user/dto';

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
          .expectStatus(400)
          .expectJsonLike({ statusCode: 400, error: 'Bad Request' });
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: body.email,
          })
          .expectStatus(400)
          .expectJsonLike({ statusCode: 400, error: 'Bad Request' });
      });
      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400)
          .expectJsonLike({ statusCode: 400, error: 'Bad Request' });
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
          .expectJson({ email: ['The email is already taken'] });
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
          .expectStatus(400)
          .expectJsonLike({ statusCode: 400, error: 'Bad Request' });
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: body.email,
          })
          .expectStatus(400)
          .expectJsonLike({ statusCode: 400, error: 'Bad Request' });
      });
      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400)
          .expectJsonLike({ statusCode: 400, error: 'Bad Request' });
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
          .expectStatus(400)
          .expectJsonLike({ statusCode: 400, error: 'Bad Request' });
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
    describe('Get bookmarks', () => {
      it.todo('should pass');
    });
    describe('Get bookmark by id', () => {
      it.todo('should pass');
    });
    describe('Edit bookmark by id', () => {
      it.todo('should pass');
    });
    describe('Delet bookmark by id', () => {
      it.todo('should pass');
    });
  });
});
