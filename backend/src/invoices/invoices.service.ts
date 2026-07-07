import { Injectable, NotFoundException } from '@nestjs/common';
import { Invoice, InvoiceStatus } from '../../generated/prisma/client';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import {
  InvoiceDetail,
  InvoiceListItem,
  InvoicesRepository,
} from './invoices.repository';

@Injectable()
export class InvoicesService {
  constructor(private readonly invoicesRepository: InvoicesRepository) {}

  async findAllPaginated(
    query: InvoiceQueryDto,
  ): Promise<PaginatedResult<InvoiceListItem>> {
    return this.invoicesRepository.findAllPaginated(query);
  }

  async findOne(id: string): Promise<InvoiceDetail> {
    const invoice = await this.invoicesRepository.findById(id);

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async findByNumber(invoiceNumber: string): Promise<InvoiceDetail> {
    const invoice = await this.invoicesRepository.findByNumber(invoiceNumber);

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async findBySalesOrder(salesOrderId: string): Promise<InvoiceDetail> {
    const invoice =
      await this.invoicesRepository.findBySalesOrderId(salesOrderId);

    if (!invoice) {
      throw new NotFoundException('No invoice found for this sales order');
    }

    return invoice;
  }

  async updateStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    await this.findOne(id);
    return this.invoicesRepository.update(id, { status });
  }
}
