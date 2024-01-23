import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Collection } from '../../collections/entities/collection.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Comment } from 'src/comments/entities/comment.entity';

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

  @Column('tsvector', { select: false, nullable: true })
  @Index()
  searchText: string;

  @ManyToOne(() => Collection, (collection) => collection.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'collectionId' })
  collection: Collection;

  @OneToMany(() => Comment, (comment) => comment.item)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.item)
  likes: Like[];

  @Column()
  collectionId: number;
}
