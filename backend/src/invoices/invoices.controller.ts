import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findAll(@Query() query: InvoiceQueryDto) {
    return this.invoicesService.findAllPaginated(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Get('number/:invoiceNumber')
  findByNumber(@Param('invoiceNumber') invoiceNumber: string) {
    return this.invoicesService.findByNumber(invoiceNumber);
  }

  @Get('sales-order/:salesOrderId')
  findBySalesOrder(@Param('salesOrderId') salesOrderId: string) {
    return this.invoicesService.findBySalesOrder(salesOrderId);
  }
}
