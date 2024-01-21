import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

interface AuthenticatedUser {
  id: number;
}

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createCollectionDto: CreateCollectionDto,
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;
    return this.collectionsService.create(createCollectionDto, user.id);
  }

  @Get()
  findAll() {
    return this.collectionsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user')
  findUserCollections(@Req() req: RequestWithUser) {
    const user = req.user;
    return this.collectionsService.findAllByUserId(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectionsService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id; // Extract userId from the AuthenticatedUser
    return this.collectionsService.update(+id, updateCollectionDto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    // Extract user from request
    const user = req.user;
    return this.collectionsService.remove(+id, user.id);
  }
}
