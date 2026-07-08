import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { CompanySettings } from '../../generated/prisma/client';

// The table only ever holds one row (a singleton settings record).
const DEFAULT_SETTINGS = {
  name: 'My Company',
  currency: 'EGP',
  address: '',
};

@Injectable()
export class CompanySettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFirst(): Promise<CompanySettings | null> {
    return this.prisma.companySettings.findFirst();
  }

  /** Gets the singleton row, creating it with defaults on first access. */
  async findOrCreate(): Promise<CompanySettings> {
    const existing = await this.findFirst();
    if (existing) return existing;

    return this.prisma.companySettings.create({ data: DEFAULT_SETTINGS });
  }

  async update(
    id: string,
    data: Partial<Omit<CompanySettings, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<CompanySettings> {
    return this.prisma.companySettings.update({ where: { id }, data });
  }
}
