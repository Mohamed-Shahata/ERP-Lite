import { IsEnum, IsOptional } from 'class-validator';
import { InvoiceStatus, PaymentMethod } from '../../../generated/prisma/enums';
import { ReportDateRangeQueryDto } from './report-date-range-query.dto';

export class PaymentsReportQueryDto extends ReportDateRangeQueryDto {
  // Filters by the related invoice's status (a Payment has no status of
  // its own — it's a record of money received against an invoice).
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;
}
