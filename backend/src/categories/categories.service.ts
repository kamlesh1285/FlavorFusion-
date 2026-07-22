import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.categoriesRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException('Category already exists');
    }

    const category = this.categoriesRepository.create(createCategoryDto);
    return this.categoriesRepository.save(category);
  }

  findAll() {
    return this.categoriesRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }
  async update(id: string, dto: UpdateCategoryDto) {
  const category = await this.findOne(id);

  Object.assign(category, dto);

  return this.categoriesRepository.save(category);
}

async remove(id: string) {
  const category = await this.findOne(id);

  await this.categoriesRepository.remove(category);

  return {
    message: 'Category deleted successfully',
  };
}
}
