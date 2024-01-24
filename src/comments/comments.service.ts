import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { Item } from 'src/items/entities/item.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
  ) {}

  async createComment(
    userId: number,
    itemId: number,
    text: string,
  ): Promise<Comment> {
    if (!text) {
      throw new BadRequestException('Comment text cannot be empty.');
    }

    const item = await this.itemRepository.findOneBy({ id: itemId });
    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found.`);
    }

    const newComment = this.commentsRepository.create({ userId, itemId, text });
    return this.commentsRepository.save(newComment);
  }

  async getCommentsByItem(itemId: number): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { itemId },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async deleteComment(
    commentId: number,
    userId: number,
    isAdmin: boolean,
  ): Promise<void> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('Comment not found.');

    if (comment.userId !== userId && !isAdmin) {
      throw new UnauthorizedException('You cannot delete this comment.');
    }

    await this.commentsRepository.remove(comment);
  }
}
