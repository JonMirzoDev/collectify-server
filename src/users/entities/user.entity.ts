import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Collection } from 'src/collections/entities/collection.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @OneToMany(() => Collection, (collection) => collection.user)
  collections: Collection[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
