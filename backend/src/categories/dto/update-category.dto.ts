import { IsOptional, IsString, MinLength } from 'class-validator';
import { Sanitize } from '../../common/utils/sanitize.util';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @Sanitize()
  description?: string;
}
