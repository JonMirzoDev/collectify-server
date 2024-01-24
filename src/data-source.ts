import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Item } from './items/entities/item.entity';
import { Collection } from './collections/entities/collection.entity';
import * as dotenv from 'dotenv';
import { Like } from './likes/entities/like.entity';
import { Comment } from './comments/entities/comment.entity';
dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, Item, Collection, Like, Comment],
  synchronize: true,
  ssl:
    process.env.NODE_ENV === 'production'
      ? {
          rejectUnauthorized: false,
        }
      : false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
