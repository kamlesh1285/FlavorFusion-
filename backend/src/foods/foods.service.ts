import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { CreateFoodDto } from './dto/create-food.dto';
import { Food } from './entities/food.entity';
import { Category } from '../categories/entities/category.entity';
import { UpdateFoodDto } from './dto/update-food.dto';


@Injectable()
export class FoodsService {
  constructor(
    @InjectRepository(Food)
    private readonly foodsRepository: Repository<Food>,

    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(createFoodDto: CreateFoodDto) {
    const category = await this.categoriesRepository.findOne({
      where: { id: createFoodDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const food = this.foodsRepository.create({
      ...createFoodDto,
      category,
    });

    return this.foodsRepository.save(food);
  }

  findAll() {
  return this.foodsRepository.find({
    relations: {
      category: true,
    },
    order: {
      name: 'ASC',
    },
  });
}

async findOne(id: string) {
  const food = await this.foodsRepository.findOne({
    where: { id },
    relations: {
      category: true,
    },
  });

  if (!food) {
    throw new NotFoundException('Food not found');
  }

  return food;
}

async update(id: string, dto: UpdateFoodDto) {
  const food = await this.findOne(id);

  Object.assign(food, dto);

  return this.foodsRepository.save(food);
}

async remove(id: string) {
  await this.findOne(id);

  await this.foodsRepository.delete(id);

  return {
    message: 'Food deleted successfully',
  };
}
}
