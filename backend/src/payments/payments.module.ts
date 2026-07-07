import { Module } from '@nestjs/common';
import { InvoicesModule } from '../invoices/invoices.module';
import {
  InvoicePaymentsController,
  PaymentsController,
} from './payments.controller';
import { PaymentsRepository } from './payments.repository';
import { PaymentsService } from './payments.service';

@Module({
  imports: [InvoicesModule],
  controllers: [PaymentsController, InvoicePaymentsController],
  providers: [PaymentsService, PaymentsRepository],
  exports: [PaymentsService],
})
export class PaymentsModule {}
