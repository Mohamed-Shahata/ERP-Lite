import { Type } from 'class-transformer';
import { ArrayMinSize, IsUUID, ValidateNested } from 'class-validator';
import { SalesOrderItemDto } from './sales-order-item.dto';

export class CreateSalesOrderDto {
  @IsUUID()
  customerId!: string;

  @ValidateNested({ each: true })
  @Type(() => SalesOrderItemDto)
  @ArrayMinSize(1)
  items!: SalesOrderItemDto[];
}
