import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_FILTER } from '@nestjs/core';
import { UnprocessableEntityFilter } from './exception-filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,

    AuthModule,
    UserModule,
    BookmarkModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: UnprocessableEntityFilter,
    },
  ],
})
export class AppModule {}
