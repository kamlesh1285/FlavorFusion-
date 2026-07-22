import { IsString } from 'class-validator';

export class CheckoutDto {
  @IsString()
  deliveryAddress!: string;

  @IsString()
  paymentMethod!: string;
}