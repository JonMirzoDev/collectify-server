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

  async create(createItemDto: CreateItemDto, userId: number): Promise<Item> {
    const collection = await this.collectionRepository.findOne({
      where: { id: createItemDto.collectionId },
    });

    if (!collection || collection.userId !== userId) {
      throw new UnauthorizedException();
    }

    const newItem = this.itemRepository.create(createItemDto);
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
  ): Promise<Item> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['collection'],
    });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found.`);
    }

    if (item.collection.userId !== userId) {
      throw new UnauthorizedException();
    }

    Object.assign(item, updateItemDto);
    item.searchText = this.createSearchText(item);
    return this.itemRepository.save(item);
  }

  private createSearchText(item: Item): string {
    const searchText = `${item.name} ${item.description} ${item.tags.join(
      ' ',
    )}`;
    return searchText;
  }

  async remove(id: number, userId: number): Promise<void> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['collection'],
    });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found.`);
    }

    if (item.collection.userId !== userId) {
      throw new UnauthorizedException();
    }

    await this.itemRepository.delete(id);
  }
}
