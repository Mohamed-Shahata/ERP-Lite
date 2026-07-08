import { Module } from '@nestjs/common';
import { CompanySettingsController } from './company-settings.controller';
import { CompanySettingsRepository } from './company-settings.repository';
import { CompanySettingsService } from './company-settings.service';

@Module({
  controllers: [CompanySettingsController],
  providers: [CompanySettingsService, CompanySettingsRepository],
  exports: [CompanySettingsService],
})
export class CompanySettingsModule {}
