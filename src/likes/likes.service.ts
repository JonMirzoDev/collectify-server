import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { Item } from 'src/items/entities/item.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
  ) {}

  async likeItem(userId: number, itemId: number): Promise<Like> {
    const item = await this.itemRepository.findOneBy({ id: itemId });
    if (!item) throw new NotFoundException('Item not found');

    let like = await this.likesRepository.findOne({
      where: {
        userId: userId,
        itemId: itemId,
      },
    });

    if (like) {
      like.isLike = true;
    } else {
      like = this.likesRepository.create({
        userId,
        itemId,
        isLike: true,
      });
    }

    await this.likesRepository.save(like);
    return like;
  }

  async dislikeItem(userId: number, itemId: number): Promise<Like> {
    const item = await this.itemRepository.findOneBy({ id: itemId });
    if (!item) throw new NotFoundException('Item not found');

    let like = await this.likesRepository.findOne({
      where: {
        userId: userId,
        itemId: itemId,
      },
    });

    if (like) {
      like.isLike = false;
    } else {
      like = this.likesRepository.create({
        userId,
        itemId,
        isLike: false,
      });
    }

    await this.likesRepository.save(like);
    return like;
  }

  async getLikeStatus(userId: number, itemId: number): Promise<Like | null> {
    return await this.likesRepository.findOne({
      where: {
        userId: userId,
        itemId: itemId,
      },
    });
  }
}
