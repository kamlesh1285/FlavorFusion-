import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Inventory } from './entities/inventory.entity';
import { Food } from '../foods/entities/food.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, Food])],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
