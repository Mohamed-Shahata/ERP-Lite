import { Module } from '@nestjs/common';
import { AuditLogModule } from '../common/audit-log/audit-log.module';
import { CompanySettingsController } from './company-settings.controller';
import { CompanySettingsRepository } from './company-settings.repository';
import { CompanySettingsService } from './company-settings.service';

@Module({
  imports: [AuditLogModule],
  controllers: [CompanySettingsController],
  providers: [CompanySettingsService, CompanySettingsRepository],
  exports: [CompanySettingsService],
})
export class CompanySettingsModule {}
