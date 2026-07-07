import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Payment } from '../../generated/prisma/client';
import { InvoiceStatus } from '../../generated/prisma/enums';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { InvoicesService } from '../invoices/invoices.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { PaymentDetail, PaymentsRepository } from './payments.repository';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly invoicesService: InvoicesService,
  ) {}

  async findAllPaginated(
    query: PaymentQueryDto,
  ): Promise<PaginatedResult<PaymentDetail>> {
    return this.paymentsRepository.findAllPaginated(query);
  }

  async findOne(id: string): Promise<PaymentDetail> {
    const payment = await this.paymentsRepository.findById(id);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async findByInvoiceId(invoiceId: string): Promise<PaymentDetail[]> {
    // Ensures a 404 for an unknown invoice instead of silently returning [].
    await this.invoicesService.findOne(invoiceId);
    return this.paymentsRepository.findByInvoiceId(invoiceId);
  }

  /**
   * Records a payment against an invoice.
   * A quick status check happens here for a fast, friendly error; the
   * authoritative overpayment check happens inside the repository's
   * transaction (see PaymentsRepository.create) to stay race-safe.
   */
  async create(
    dto: CreatePaymentDto,
    recordedById: string,
  ): Promise<PaymentDetail> {
    const invoice = await this.invoicesService.findOne(dto.invoiceId);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new ConflictException('Invoice is already fully paid');
    }

    return this.paymentsRepository.create({
      invoiceId: dto.invoiceId,
      amount: dto.amount,
      method: dto.method,
      recordedById,
    });
  }

  /** Admin-only: deletes a payment and reverses it on the invoice. */
  async remove(id: string): Promise<Payment> {
    await this.findOne(id);
    return this.paymentsRepository.delete(id);
  }
}
