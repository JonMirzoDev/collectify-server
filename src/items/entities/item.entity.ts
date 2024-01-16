import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Collection } from '../../collections/entities/collection.entity';

@Entity({ name: 'items' })
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('simple-array')
  tags: string[];

  @ManyToOne(() => Collection, (collection) => collection.items, {
    onDelete: 'CASCADE', // optional: to delete items when the collection is deleted
  })
  @JoinColumn({ name: 'collectionId' }) // This will create a foreign key column named 'collectionId'
  collection: Collection;

  // If you have collectionId as a separate field
  @Column()
  collectionId: number;
}
