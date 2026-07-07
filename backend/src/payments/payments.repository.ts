import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { Prisma, Payment } from '../../generated/prisma/client';
import { InvoiceStatus, PaymentMethod } from '../../generated/prisma/enums';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { paginate } from '../common/utils/paginate.util';
import { PaymentQueryDto } from './dto/payment-query.dto';

const detailInclude = {
  invoice: {
    select: {
      id: true,
      invoiceNumber: true,
      amount: true,
      amountPaid: true,
      status: true,
    },
  },
  recordedBy: { select: { id: true, name: true, email: true } },
} as const;

export type PaymentDetail = Prisma.PaymentGetPayload<{
  include: typeof detailInclude;
}>;

export interface CreatePaymentData {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  recordedById: string;
}

/** Round to 2 decimal places to keep currency math stable. */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllPaginated(
    query: PaymentQueryDto,
  ): Promise<PaginatedResult<PaymentDetail>> {
    const where: Prisma.PaymentWhereInput = {
      ...(query.invoiceId ? { invoiceId: query.invoiceId } : {}),
      ...(query.method ? { method: query.method } : {}),
    };

    return paginate<PaymentDetail>({
      page: query.page,
      limit: query.limit,
      findMany: (args) =>
        this.prisma.payment.findMany({
          ...args,
          where,
          include: detailInclude,
          orderBy: { paidAt: 'desc' },
        }),
      count: () => this.prisma.payment.count({ where }),
    });
  }

  findById(id: string): Promise<PaymentDetail | null> {
    return this.prisma.payment.findUnique({
      where: { id },
      include: detailInclude,
    });
  }

  findByInvoiceId(invoiceId: string): Promise<PaymentDetail[]> {
    return this.prisma.payment.findMany({
      where: { invoiceId },
      include: detailInclude,
      orderBy: { paidAt: 'asc' },
    });
  }

  /**
   * Records a payment and updates the parent invoice's amountPaid/status
   * in a single DB transaction, so the two can never drift out of sync.
   * The invoice is re-read inside the transaction (not trusted from the
   * caller) to avoid a race where two concurrent payments both pass an
   * overpayment check based on stale data.
   */
  async create(data: CreatePaymentData): Promise<PaymentDetail> {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: data.invoiceId },
      });

      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }

      const total = Number(invoice.amount);
      const currentPaid = Number(invoice.amountPaid);
      const newPaid = round2(currentPaid + data.amount);

      if (newPaid > total) {
        const remaining = round2(total - currentPaid);
        throw new ConflictException(
          `Payment exceeds remaining balance. Remaining balance is ${remaining}`,
        );
      }

      const payment = await tx.payment.create({
        data: {
          invoiceId: data.invoiceId,
          amount: data.amount,
          method: data.method,
          recordedById: data.recordedById,
        },
        include: detailInclude,
      });

      const status =
        newPaid >= total
          ? InvoiceStatus.PAID
          : newPaid > 0
            ? InvoiceStatus.PARTIALLY_PAID
            : InvoiceStatus.UNPAID;

      await tx.invoice.update({
        where: { id: data.invoiceId },
        data: { amountPaid: newPaid, status },
      });

      return payment;
    });
  }

  /**
   * Deletes a payment and reverses its effect on the parent invoice
   * (amountPaid/status), all inside one transaction.
   */
  async delete(id: string): Promise<Payment> {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id } });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      const invoice = await tx.invoice.findUniqueOrThrow({
        where: { id: payment.invoiceId },
      });

      const total = Number(invoice.amount);
      const currentPaid = Number(invoice.amountPaid);
      const newPaid = Math.max(0, round2(currentPaid - Number(payment.amount)));

      const status =
        newPaid >= total && total > 0
          ? InvoiceStatus.PAID
          : newPaid > 0
            ? InvoiceStatus.PARTIALLY_PAID
            : InvoiceStatus.UNPAID;

      await tx.invoice.update({
        where: { id: payment.invoiceId },
        data: { amountPaid: newPaid, status },
      });

      return tx.payment.delete({ where: { id } });
    });
  }
}
