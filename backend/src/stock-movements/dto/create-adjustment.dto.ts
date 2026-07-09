import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  NotEquals,
} from 'class-validator';

export class CreateAdjustmentDto {
  @IsUUID()
  productId!: string;

  // Signed delta applied to quantityInStock: positive to increase stock,
  // negative to decrease it. Zero is rejected — it wouldn't be a movement.
  @IsInt()
  @NotEquals(0)
  quantity!: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  note?: string;
}
