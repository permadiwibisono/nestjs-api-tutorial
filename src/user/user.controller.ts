import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';

import { GetUser } from '../auth/decorator/user.decorator';
import { JWTGuard } from '../auth/guard';

import { UserService } from './user.service';
import { UpdateUserDto } from './dto';

@UseGuards(JWTGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Get('me')
  getProfile(@GetUser() user: User) {
    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Put('me')
  updateProfile(@GetUser() user: User, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(user.id, dto);
  }
}
