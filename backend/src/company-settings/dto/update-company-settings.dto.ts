import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// Sent as multipart/form-data (the logo file rides alongside it), so every
// field arrives as a string; the logo itself is handled separately via
// @UploadedFile() in the controller, not through this DTO.
export class UpdateCompanySettingsDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsOptional()
  @IsString()
  taxNumber?: string;

  @IsOptional()
  @IsString()
  invoicePrefix?: string;

  @IsOptional()
  @IsString()
  invoiceFooterNote?: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string;
}
