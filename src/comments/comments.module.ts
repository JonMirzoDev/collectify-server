import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Item } from 'src/items/entities/item.entity';
import { ItemsModule } from 'src/items/items.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Item]), ItemsModule],
  providers: [CommentsService],
  controllers: [CommentsController],
  exports: [TypeOrmModule],
})
export class CommentsModule {}
