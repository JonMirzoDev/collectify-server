import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

interface AuthenticatedUser {
  id: number;
}

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createItemDto: CreateItemDto, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.itemsService.create(createItemDto, userId);
  }

  @Get('/all')
  findAllItems() {
    return this.itemsService.findAllItems();
  }

  @Get('/tags')
  findAllTags() {
    return this.itemsService.findAllTags();
  }

  @Get()
  findAll(@Query('collectionId') collectionId: string) {
    return this.itemsService.findAll(+collectionId);
  }

  @Get('/search')
  search(@Query('query') query: string) {
    return this.itemsService.search(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemsService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.itemsService.update(+id, updateItemDto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.itemsService.remove(+id, userId);
  }
}
