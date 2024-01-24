import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Collection } from 'src/collections/entities/collection.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,
  ) {}

  async create(
    createItemDto: CreateItemDto,
    userId: number,
    isAdmin?: boolean,
  ): Promise<Item> {
    const collection = await this.collectionRepository.findOne({
      where: { id: createItemDto.collectionId },
    });

    if (!collection) {
      throw new NotFoundException(
        `Collection with ID ${createItemDto.collectionId} not found.`,
      );
    }

    if (!isAdmin && userId !== collection.userId) {
      throw new UnauthorizedException(
        'You do not have permission to add items to this collection.',
      );
    }

    const newItem = this.itemRepository.create(createItemDto);
    newItem.collection = collection;
    newItem.searchText = this.createSearchText(newItem);
    await this.itemRepository.save(newItem);
    return newItem;
  }

  async search(query: string, userId?: number): Promise<any[]> {
    if (!query.trim()) {
      throw new NotFoundException('The search query cannot be empty.');
    }

    const items = await this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.likes', 'likes')
      .leftJoinAndSelect('item.collection', 'collection')
      .leftJoinAndSelect('collection.user', 'user')
      .where(
        `to_tsvector(item.name || ' ' || item.description || ' ' || item.tags) @@ plainto_tsquery(:query)`,
        { query },
      )
      .getMany();

    return items.map((item) => {
      const { likes, collection, ...itemData } = item;
      const likeCount = likes.filter((like) => like.isLike).length;
      const userLike = userId
        ? likes.find((like) => like.userId === userId)
        : undefined;

      return {
        ...itemData,
        collection: {
          user: {
            id: collection.user.id,
            email: collection.user.email,
            username: collection.user.username,
          },
        },
        likeCount: likeCount,
        likeStatus: userLike ? userLike.isLike : null,
      };
    });
  }

  async findAllItemsWithLikeStatus(userId?: number): Promise<any[]> {
    const items = await this.itemRepository.find({
      relations: ['collection', 'collection.user', 'likes'],
      order: {
        id: 'DESC',
      },
    });

    return items.map((item) => {
      const {
        likes,
        collection: {
          user: { id, email, username },
        },
        ...itemData
      } = item;
      const likeCount = likes.filter((like) => like.isLike).length;
      const userLike = userId
        ? likes.find((like) => like.userId === userId)
        : undefined;

      return {
        ...itemData,
        collection: {
          user: { id, email, username },
        },
        likeCount: likeCount,
        likeStatus: userLike ? userLike.isLike : null,
      };
    });
  }

  async findAll(collectionId: number, userId?: number): Promise<any[]> {
    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId },
    });
    if (!collection) {
      throw new NotFoundException(
        `Collection with ID ${collectionId} not found.`,
      );
    }

    const items = await this.itemRepository.find({
      where: { collection: { id: collectionId } },
      relations: ['likes', 'collection', 'collection.user'],
      order: {
        id: 'DESC',
      },
    });

    return items.map((item) => {
      const { likes, collection, ...itemData } = item;
      const likeCount = likes.filter((like) => like.isLike).length;
      const userLike = userId
        ? likes.find((like) => like.userId === userId)
        : undefined;

      return {
        ...itemData,
        collection: {
          user: {
            id: collection.user.id,
            email: collection.user.email,
            username: collection.user.username,
          },
        },
        likeCount: likeCount,
        likeStatus: userLike ? userLike.isLike : null,
      };
    });
  }

  async findAllTags(): Promise<string[]> {
    const items = await this.itemRepository.find({ order: { id: 'DESC' } });
    const allTags = items.map((item) => item.tags).flat();
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags;
  }

  async findOne(id: number, userId?: number): Promise<any> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['likes', 'collection', 'collection.user'],
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found.`);
    }

    const likeCount = item.likes.filter((like) => like.isLike).length;
    const userLike = userId
      ? item.likes.find((like) => like.userId === userId)
      : undefined;

    const { likes, ...itemData } = item;

    return {
      ...itemData,
      collection: {
        user: {
          id: item.collection.user.id,
          email: item.collection.user.email,
          username: item.collection.user.username,
        },
      },
      likeCount: likeCount,
      likeStatus: userLike ? userLike.isLike : null,
    };
  }

  async update(
    id: number,
    updateItemDto: UpdateItemDto,
    userId: number,
    isAdmin?: boolean,
  ): Promise<Item> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['collection'],
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found.`);
    }

    if (!isAdmin && userId !== item.collection.userId) {
      throw new UnauthorizedException(
        'You do not have permission to update this item.',
      );
    }

    Object.assign(item, updateItemDto);
    item.searchText = this.createSearchText(item);
    await this.itemRepository.save(item);
    return item;
  }

  private createSearchText(item: Item): string {
    const searchText = `${item.name} ${item.description} ${item.tags.join(
      ' ',
    )}`;
    return searchText;
  }

  async remove(id: number, userId: number, isAdmin?: boolean): Promise<void> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['collection'],
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found.`);
    }

    if (!isAdmin && userId !== item.collection.userId) {
      throw new UnauthorizedException(
        'You do not have permission to delete this item.',
      );
    }

    await this.itemRepository.delete(id);
  }
}
