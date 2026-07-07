import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { SalesOrderStatus } from '../../../generated/prisma/enums';

export class SalesOrderQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(SalesOrderStatus)
  status?: SalesOrderStatus;
}
