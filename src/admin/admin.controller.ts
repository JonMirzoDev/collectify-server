import {
  Controller,
  Put,
  Delete,
  Param,
  UseGuards,
  Post,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';
import { CreateCollectionDto } from '../collections/dto/create-collection.dto';
import { UpdateCollectionDto } from '../collections/dto/update-collection.dto';
import { CreateItemDto } from '../items/dto/create-item.dto';
import { UpdateItemDto } from '../items/dto/update-item.dto';
import { CollectionsService } from 'src/collections/collections.service';
import { ItemsService } from 'src/items/items.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AdminController {
  constructor(
    private collectionsService: CollectionsService,
    private itemsService: ItemsService,
  ) {}

  @Post('collections')
  createCollection(
    @Body() createCollectionDto: CreateCollectionDto,
    @Req() req: any,
  ) {
    const adminUserId = req.user.id;
    return this.collectionsService.create(createCollectionDto, adminUserId);
  }

  @Put('collections/:id')
  updateCollection(
    @Param('id') id: number,
    @Body() updateCollectionDto: UpdateCollectionDto,
    @Req() req: any,
  ) {
    const adminUserId = req.user?.id;
    const isAdmin = req.user?.isAdmin;
    if (typeof adminUserId === 'undefined' || typeof isAdmin === 'undefined') {
      throw new UnauthorizedException();
    }
    return this.collectionsService.update(
      id,
      updateCollectionDto,
      adminUserId,
      isAdmin,
    );
  }

  @Delete('collections/:id')
  deleteCollection(@Param('id') id: number, @Req() req: any) {
    const adminUserId = req.user?.id;
    const isAdmin = req.user?.isAdmin;
    if (typeof adminUserId === 'undefined' || typeof isAdmin === 'undefined') {
      throw new UnauthorizedException();
    }
    return this.collectionsService.remove(id, adminUserId, isAdmin);
  }

  @Post('items')
  createItem(@Body() createItemDto: CreateItemDto, @Req() req: any) {
    const adminUserId = req.user?.id;
    const isAdmin = req.user?.isAdmin;
    if (typeof adminUserId === 'undefined' || typeof isAdmin === 'undefined') {
      throw new UnauthorizedException();
    }
    return this.itemsService.create(createItemDto, adminUserId, isAdmin);
  }

  @Put('items/:id')
  updateItem(
    @Param('id') id: number,
    @Body() updateItemDto: UpdateItemDto,
    @Req() req: any,
  ) {
    const adminUserId = req.user?.id;
    const isAdmin = req.user?.isAdmin;
    if (typeof adminUserId === 'undefined' || typeof isAdmin === 'undefined') {
      throw new UnauthorizedException();
    }
    return this.itemsService.update(id, updateItemDto, adminUserId, isAdmin);
  }

  @Delete('items/:id')
  deleteItem(@Param('id') id: number, @Req() req: any) {
    const adminUserId = req.user?.id;
    const isAdmin = req.user?.isAdmin;
    if (typeof adminUserId === 'undefined' || typeof isAdmin === 'undefined') {
      throw new UnauthorizedException();
    }
    return this.itemsService.remove(id, adminUserId, isAdmin);
  }
}
