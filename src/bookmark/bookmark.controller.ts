import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator/user.decorator';
import { JWTGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { BookmarkDto } from './dto';

@UseGuards(JWTGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  @Get()
  getList(@GetUser('id') userId: number) {
    return this.bookmarkService.getList(userId);
  }

  @Get(':id')
  getById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bookmarkService.getById(userId, id);
  }

  @Post()
  create(@GetUser('id') userId: number, @Body() dto: BookmarkDto) {
    return this.bookmarkService.create(userId, dto);
  }

  @Put(':id')
  update(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BookmarkDto,
  ) {
    return this.bookmarkService.update(userId, id, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  delete(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.bookmarkService.delete(userId, id);
  }
}
