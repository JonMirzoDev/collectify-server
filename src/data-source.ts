import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Item } from './items/entities/item.entity';
import { Collection } from './collections/entities/collection.entity';
import { Like } from './likes/entities/like.entity';
import { Comment } from './comments/entities/comment.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: isProduction ? process.env.PROD_DB_HOST : process.env.DB_HOST,
  port: isProduction
    ? parseInt(process.env.PROD_DB_PORT, 10)
    : parseInt(process.env.DB_PORT, 10),
  username: isProduction
    ? process.env.PROD_DB_USERNAME
    : process.env.DB_USERNAME,
  password: isProduction
    ? process.env.PROD_DB_PASSWORD
    : process.env.DB_PASSWORD,
  database: isProduction
    ? process.env.PROD_DB_DATABASE
    : process.env.DB_DATABASE,
  entities: [User, Item, Collection, Like, Comment],
  synchronize: !isProduction,
  ssl: isProduction
    ? {
        rejectUnauthorized: false,
      }
    : null,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
