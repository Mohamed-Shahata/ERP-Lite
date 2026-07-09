import { Injectable } from '@nestjs/common';
import { InvoicesService } from '../invoices/invoices.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import {
  PaymentsRepository,
  PaymentWithRecordedBy,
} from './payments.repository';
import { CacheService } from '../common/cache/cache.service';
import { CACHE_PREFIX } from '../common/cache/cache-keys.constants';
import { AuditLogService } from '../common/audit-log/audit-log.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly invoicesService: InvoicesService,
    private readonly cache: CacheService,
    private readonly auditLog: AuditLogService,
  ) {}

  async findAllForInvoice(invoiceId: string): Promise<PaymentWithRecordedBy[]> {
    await this.invoicesService.findOne(invoiceId); // throws 404 if missing
    return this.paymentsRepository.findAllForInvoice(invoiceId);
  }

  async create(
    invoiceId: string,
    dto: CreatePaymentDto,
    recordedById: string,
  ): Promise<PaymentWithRecordedBy> {
    await this.invoicesService.findOne(invoiceId); // throws 404 if missing

    const payment = await this.paymentsRepository.create({
      invoiceId,
      amount: dto.amount,
      method: dto.method,
      recordedById,
    });
    void this.auditLog.log({
      action: 'PAYMENT_RECORDED',
      entityType: 'Invoice',
      entityId: invoiceId,
      userId: recordedById,
      metadata: { amount: dto.amount, method: dto.method },
    });
    this.cache.invalidatePrefix(CACHE_PREFIX.DASHBOARD_OVERVIEW);
    this.cache.invalidate(CACHE_PREFIX.REPORTS_PAYMENTS);
    return payment;
  }
}
