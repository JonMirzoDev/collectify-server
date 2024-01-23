import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    userId?: number,
  ): Promise<Collection> {
    const newCollection = this.collectionRepository.create({
      ...createCollectionDto,
      userId: userId ?? null, // Use null if userId is not provided
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
    return this.collectionRepository
      .createQueryBuilder('collection')
      .leftJoinAndSelect('collection.user', 'user')
      .select(['collection', 'user.username', 'user.email'])
      .where('user.id = :userId', { userId })
      .orderBy('collection.id', 'DESC')
      .getMany();
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
    updateCollectionDto: UpdateCollectionDto,
    userId: number,
    isAdmin?: boolean,
  ): Promise<Collection> {
    const collection = await this.collectionRepository.findOne({
      where: { id },
    });

    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    // Skip the permission check if the user is an admin
    if (!isAdmin && userId !== collection.userId) {
      throw new UnauthorizedException(
        'You do not have permission to update this collection.',
      );
    }

    await this.collectionRepository.update(id, updateCollectionDto);
    return this.collectionRepository.findOneOrFail({ where: { id } });
  }

  async remove(id: number, userId?: number, isAdmin?: boolean): Promise<void> {
    const collection = await this.collectionRepository.findOne({
      where: { id },
    });

    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    // Only check user permissions if userId is provided
    if (!isAdmin && userId !== collection.userId) {
      throw new UnauthorizedException(
        'You do not have permission to update this collection.',
      );
    }

    await this.collectionRepository.delete(id);
  }
}
