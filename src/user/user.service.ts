import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private db: PrismaService) {}

  async updateUser(id: number, dto: UpdateUserDto) {
    const user = await this.db.user.update({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
      where: { id },
    });
    delete user.password;
    return user;
  }
}
