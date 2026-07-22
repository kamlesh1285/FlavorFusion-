import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { InventoryType } from '../entities/inventory.entity';

export class CreateInventoryDto {
  @IsUUID()
  foodId!: string;

  @IsEnum(InventoryType)
  type!: InventoryType;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  note?: string;
}
