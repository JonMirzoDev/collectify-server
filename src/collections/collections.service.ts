import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { Collection } from './entities/collection.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,
  ) {}

  async create(
    createCollectionDto: CreateCollectionDto,
    userId: number,
  ): Promise<Collection> {
    const newCollection = this.collectionRepository.create({
      ...createCollectionDto,
      userId: userId,
    });
    return this.collectionRepository.save(newCollection);
  }

  async findAll(): Promise<Collection[]> {
    return this.collectionRepository.find({
      order: {
        id: 'DESC',
      },
    });
  }

  async findAllByUserId(userId: number): Promise<Collection[]> {
    return this.collectionRepository.find({
      where: { userId: userId },
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Collection> {
    const collection = await this.collectionRepository.findOne({
      where: { id },
    });
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }
    return collection;
  }

  async update(
    id: number,
    userId: number,
    updateCollectionDto: UpdateCollectionDto,
  ): Promise<Collection> {
    const collection = await this.collectionRepository.findOne({
      where: { id },
    });

    if (!collection) {
      throw new EntityNotFoundError(Collection, id);
    }

    if (collection.userId !== userId) {
      // Handle unauthorized update attempt, e.g., throw an error
      throw new UnauthorizedException(
        'You do not have permission to update this collection.',
      );
    }

    await this.collectionRepository.update(id, updateCollectionDto);
    return this.collectionRepository.findOneOrFail({ where: { id } });
  }

  async remove(id: number, userId: number): Promise<void> {
    const collection = await this.collectionRepository.findOne({
      where: { id },
    });

    if (!collection) {
      throw new EntityNotFoundError(Collection, id);
    }

    if (collection.userId !== userId) {
      // Handle unauthorized delete attempt, e.g., throw an error
      throw new UnauthorizedException(
        'You do not have permission to delete this collection.',
      );
    }

    await this.collectionRepository.delete(id);
  }
}
