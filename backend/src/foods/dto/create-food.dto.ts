import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateFoodDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isVeg?: boolean;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsInt()
  @Min(0)
  stockQuantity!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  preparationTime?: number;

  @IsUUID()
  categoryId!: string;
}
