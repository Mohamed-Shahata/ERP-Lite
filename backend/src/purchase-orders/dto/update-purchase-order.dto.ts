import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { PurchaseOrderItemDto } from './purchase-order-item.dto';

/**
 * Editing a purchase order is only allowed by the service while it is
 * still PENDING (enforced in PurchaseOrdersService.update, not here).
 */
export class UpdatePurchaseOrderDto {
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  @ArrayMinSize(1)
  items?: PurchaseOrderItemDto[];
}
