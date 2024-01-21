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

  async search(query: string): Promise<Item[]> {
    if (!query.trim()) {
      throw new NotFoundException('The search query cannot be empty.');
    }

    return this.itemRepository
      .createQueryBuilder('item')
      .where(
        `to_tsvector(item.name || ' ' || item.description || ' ' || item.tags) @@ plainto_tsquery(:query)`,
        { query },
      )
      .getMany();
  }

  async findAll(collectionId: number): Promise<Item[]> {
    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId },
    });
    if (!collection) {
      throw new NotFoundException(
        `Collection with ID ${collectionId} not found.`,
      );
    }

    return this.itemRepository.find({
      where: { collection: { id: collectionId } },
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Item> {
    const item = await this.itemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found.`);
    }
    return item;
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
