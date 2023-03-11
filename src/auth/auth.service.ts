import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';

import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private db: PrismaService,
    private jwt: JwtService,
  ) {}

  async signIn(dto: AuthDto) {
    const user = await this.db.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnprocessableEntityException({
        email: ['Invalid credentials'],
      });
    }
    const valid = await argon.verify(user.password, dto.password);
    if (!valid) {
      throw new UnprocessableEntityException({
        email: ['Invalid credentials'],
      });
    }
    return this.signToken(user.id, user.email);
  }

  async signUp(dto: AuthDto) {
    const res = await this.db.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });
    if (res) {
      throw new UnprocessableEntityException({
        email: ['The email is already taken'],
      });
    }
    const hash = await argon.hash(dto.password);
    const user = await this.db.user.create({
      data: { email: dto.email, password: hash },
    });
    return this.signToken(user.id, user.email);
  }

  async signToken(id: number, email: string) {
    const payload = {
      sub: id,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    console.log('secret', secret);
    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret,
    });
    return { accessToken };
  }
}
