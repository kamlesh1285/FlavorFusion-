import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { FoodsService } from './foods.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('foods')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  // Public
  @Get()
  findAll() {
    return this.foodsService.findAll();
  }

  // Public
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.foodsService.findOne(id);
  }

  // Admin Only
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateFoodDto) {
    return this.foodsService.create(dto);
  }

  // Admin Only
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFoodDto,
  ) {
    return this.foodsService.update(id, dto);
  }

  // Admin Only
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.foodsService.remove(id);
  }
}
