import { IsDateString, IsOptional } from 'class-validator';

/**
 * Every report accepts an optional from/to date range over its own
 * relevant date column (createdAt for sales/purchases, paidAt for
 * payments). Extend this instead of redeclaring from/to on each DTO.
 */
export class ReportDateRangeQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
