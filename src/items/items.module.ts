import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collection } from 'src/collections/entities/collection.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item, Collection])],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
