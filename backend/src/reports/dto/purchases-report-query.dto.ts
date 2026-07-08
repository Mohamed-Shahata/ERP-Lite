import { IsOptional, IsUUID } from 'class-validator';
import { ReportDateRangeQueryDto } from './report-date-range-query.dto';

export class PurchasesReportQueryDto extends ReportDateRangeQueryDto {
  @IsOptional()
  @IsUUID()
  supplierId?: string;
}
