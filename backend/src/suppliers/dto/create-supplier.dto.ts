import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { Sanitize } from '../../common/utils/sanitize.util';

export class CreateSupplierDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @Sanitize()
  address?: string;
}
