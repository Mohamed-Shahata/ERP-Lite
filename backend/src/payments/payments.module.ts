import { Module } from '@nestjs/common';
import { InvoicesModule } from '../invoices/invoices.module';
import { AuditLogModule } from '../common/audit-log/audit-log.module';
import { PaymentsController } from './payments.controller';
import { PaymentsRepository } from './payments.repository';
import { PaymentsService } from './payments.service';

@Module({
  imports: [InvoicesModule, AuditLogModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsRepository],
})
export class PaymentsModule {}
