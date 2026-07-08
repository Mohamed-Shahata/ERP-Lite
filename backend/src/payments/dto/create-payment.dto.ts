import { IsEnum, IsNumber, Min } from 'class-validator';
import { PaymentMethod } from '../../../generated/prisma/enums';

export class CreatePaymentDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;
}
