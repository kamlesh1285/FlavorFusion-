import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import {
  Inventory,
  InventoryType,
} from './entities/inventory.entity';
import { Food } from '../foods/entities/food.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,

    @InjectRepository(Food)
    private readonly foodsRepository: Repository<Food>,
  ) {}

  async create(createInventoryDto: CreateInventoryDto) {
    const food = await this.foodsRepository.findOne({
      where: { id: createInventoryDto.foodId },
    });

    if (!food) {
      throw new NotFoundException('Food not found');
    }

    if (createInventoryDto.quantity <= 0) {
      throw new BadRequestException(
        'Quantity must be greater than 0',
      );
    }

    if (createInventoryDto.type === InventoryType.STOCK_IN) {
      food.stockQuantity += createInventoryDto.quantity;
    }

    if (createInventoryDto.type === InventoryType.STOCK_OUT) {
      if (food.stockQuantity < createInventoryDto.quantity) {
        throw new BadRequestException('Insufficient stock');
      }

      food.stockQuantity -= createInventoryDto.quantity;
    }

    await this.foodsRepository.save(food);

    const inventory = this.inventoryRepository.create({
      ...createInventoryDto,
      food,
    });

    return this.inventoryRepository.save(inventory);
  }

  findAll() {
    return this.inventoryRepository.find({
      relations: {
        food: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
      relations: {
        food: true,
      },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory record not found');
    }

    return inventory;
  }
}
