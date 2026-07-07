import { IsEnum, IsNumber, IsUUID, Min } from 'class-validator';
import { PaymentMethod } from '../../../generated/prisma/enums';

export class CreatePaymentDto {
  @IsUUID()
  invoiceId!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;
}
