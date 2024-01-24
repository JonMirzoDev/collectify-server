import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CollectionsModule } from 'src/collections/collections.module';
import { ItemsModule } from 'src/items/items.module';

@Module({
  imports: [CollectionsModule, ItemsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
