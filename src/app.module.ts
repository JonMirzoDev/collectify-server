import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ItemsModule } from './items/items.module';
import { AuthModule } from './auth/auth.module';
import { CollectionsModule } from './collections/collections.module';
import { dataSourceOptions } from './data-source';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    UsersModule,
    ItemsModule,
    AuthModule,
    CollectionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
