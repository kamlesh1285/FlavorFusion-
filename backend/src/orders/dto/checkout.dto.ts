import { IsEnum, IsString } from 'class-validator';
import { PaymentMethod } from '../../payments/payment.enums';

export class CheckoutDto {
  @IsString()
  deliveryAddress!: string;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;
}