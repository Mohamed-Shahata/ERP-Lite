import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { InvoiceStatus, PaymentMethod } from '../../generated/prisma/enums';

const listInclude = {
  recordedBy: { select: { id: true, name: true, email: true } },
} as const;

export type PaymentWithRecordedBy = Prisma.PaymentGetPayload<{
  include: typeof listInclude;
}>;

export interface CreatePaymentData {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  recordedById: string;
}

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllForInvoice(invoiceId: string): Promise<PaymentWithRecordedBy[]> {
    return this.prisma.payment.findMany({
      where: { invoiceId },
      include: listInclude,
      orderBy: { paidAt: 'desc' },
    });
  }

  /**
   * Records a payment and keeps the parent invoice's amountPaid/status in
   * sync in the same DB transaction, so a payment can never be written
   * without the invoice reflecting it (or vice versa).
   */
  async create(data: CreatePaymentData): Promise<PaymentWithRecordedBy> {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUniqueOrThrow({
        where: { id: data.invoiceId },
      });

      if (invoice.status === InvoiceStatus.PAID) {
        throw new ConflictException('Invoice is already fully paid');
      }

      const remaining = Number(invoice.amount) - Number(invoice.amountPaid);

      if (data.amount > remaining) {
        throw new ConflictException(
          `Payment of ${data.amount.toFixed(2)} exceeds the remaining balance of ${remaining.toFixed(2)}`,
        );
      }

      const newAmountPaid = Number(invoice.amountPaid) + data.amount;
      const status =
        newAmountPaid >= Number(invoice.amount)
          ? InvoiceStatus.PAID
          : InvoiceStatus.PARTIALLY_PAID;

      await tx.invoice.update({
        where: { id: data.invoiceId },
        data: { amountPaid: newAmountPaid, status },
      });

      return tx.payment.create({
        data: {
          invoiceId: data.invoiceId,
          amount: data.amount,
          method: data.method,
          recordedById: data.recordedById,
        },
        include: listInclude,
      });
    });
  }
}
