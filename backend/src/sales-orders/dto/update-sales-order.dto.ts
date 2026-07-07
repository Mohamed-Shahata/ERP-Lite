import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { SalesOrderItemDto } from './sales-order-item.dto';

/**
 * Editing a sales order is only allowed by the service while it is
 * still DRAFT (enforced in SalesOrdersService.update, not here).
 */
export class UpdateSalesOrderDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SalesOrderItemDto)
  @ArrayMinSize(1)
  items?: SalesOrderItemDto[];
}
