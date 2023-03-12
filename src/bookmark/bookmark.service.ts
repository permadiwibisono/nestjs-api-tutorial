import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { BookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private db: PrismaService) {}

  async getList(userId: number) {
    const list = await this.db.bookmark.findMany({ where: { userId } });
    return list;
  }

  async getById(userId: number, id: number) {
    const bookmark = await this.db.bookmark.findFirst({
      where: { userId, id },
    });
    return bookmark;
  }

  async create(userId: number, dto: BookmarkDto) {
    const bookmark = await this.db.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });

    return bookmark;
  }

  async update(userId: number, id: number, dto: BookmarkDto) {
    const res = await this.db.bookmark.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!res || res.userId !== userId) {
      throw new NotFoundException('Resource not found');
    }

    const bookmark = await this.db.bookmark.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
    });
    return bookmark;
  }

  async delete(userId: number, id: number) {
    const res = await this.db.bookmark.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!res || res.userId !== userId) {
      throw new NotFoundException('Resource not found');
    }
    await this.db.bookmark.delete({ where: { id } });
  }
}
