import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { PaymentMethod } from '../../../generated/prisma/enums';

export class PaymentQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  invoiceId?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;
}
