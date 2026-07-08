import { Injectable, Logger } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { CompanySettings } from '../../generated/prisma/client';
import { CompanySettingsRepository } from './company-settings.repository';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';

@Injectable()
export class CompanySettingsService {
  private readonly logger = new Logger(CompanySettingsService.name);

  constructor(private readonly repository: CompanySettingsRepository) {}

  async findOne(): Promise<CompanySettings> {
    return this.repository.findOrCreate();
  }

  async update(
    dto: UpdateCompanySettingsDto,
    logoFile?: Express.Multer.File,
  ): Promise<CompanySettings> {
    const current = await this.repository.findOrCreate();

    const previousLogoUrl = current.logoUrl;
    const logoUrl = logoFile ? `/uploads/logos/${logoFile.filename}` : current.logoUrl;

    const updated = await this.repository.update(current.id, {
      name: dto.name,
      currency: dto.currency,
      address: dto.address,
      taxNumber: dto.taxNumber ?? null,
      invoicePrefix: dto.invoicePrefix ?? null,
      invoiceFooterNote: dto.invoiceFooterNote ?? null,
      paymentTerms: dto.paymentTerms ?? null,
      logoUrl,
    });

    // Best-effort cleanup of the replaced logo file; never fail the
    // request over a stray file on disk.
    if (logoFile && previousLogoUrl && previousLogoUrl !== logoUrl) {
      const previousPath = join(
        process.cwd(),
        'uploads',
        'logos',
        previousLogoUrl.split('/').pop() ?? '',
      );
      unlink(previousPath).catch((error) =>
        this.logger.warn(`Could not remove old logo: ${error.message}`),
      );
    }

    return updated;
  }
}
