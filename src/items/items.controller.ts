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
import { OptionalAuthGuard } from 'src/guards/optionalAuth.guard';

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

  @UseGuards(OptionalAuthGuard)
  @Get('/all')
  findAllItems(@Req() req: RequestWithUser) {
    const userId = req.user ? req.user.id : undefined;
    return this.itemsService.findAllItemsWithLikeStatus(userId);
  }

  @Get('/tags')
  findAllTags() {
    return this.itemsService.findAllTags();
  }

  @UseGuards(OptionalAuthGuard)
  @Get()
  findAll(
    @Query('collectionId') collectionId: string,
    @Req() req?: RequestWithUser,
  ) {
    const userId = req?.user ? req.user.id : undefined;
    return this.itemsService.findAll(+collectionId, userId);
  }

  @UseGuards(OptionalAuthGuard)
  @Get('/search')
  search(@Query('query') query: string, @Req() req: RequestWithUser) {
    const userId = req.user ? req.user.id : undefined;
    return this.itemsService.search(query, userId);
  }

  @UseGuards(OptionalAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req?: RequestWithUser) {
    const userId = req?.user ? req.user.id : undefined;
    return this.itemsService.findOne(+id, userId);
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
