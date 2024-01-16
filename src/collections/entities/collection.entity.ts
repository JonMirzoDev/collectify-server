import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class Collection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  topic: string;

  @Column({ nullable: true })
  image: string;

  @ManyToOne(() => User, (user) => user.collections, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @OneToMany(() => Item, (item) => item.collection, {
    cascade: true, // automatically handle insert/update/delete operations
    eager: false, // set to true if you always want to load items with collections
  })
  items: Item[]; // Define the items property
}
