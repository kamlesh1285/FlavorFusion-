import { IsUUID, IsInt, Min } from 'class-validator';

export class AddCartItemDto {
  @IsUUID()
  foodId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}