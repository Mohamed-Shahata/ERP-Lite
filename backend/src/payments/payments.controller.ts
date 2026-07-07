import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../generated/prisma/enums';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { CurrentUserPayload } from '../common/interfaces/current-user.interface';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { PaymentsService } from './payments.service';

// Recording a payment is front-line cashier work: any authenticated user
// (ADMIN, MANAGER, EMPLOYEE) can do it. Listing/deleting payments is a
// financial-reporting concern and is locked down per-route below.
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Full payments ledger: ADMIN/MANAGER only, not the cashier.
  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll(@Query() query: PaymentQueryDto) {
    return this.paymentsService.findAllPaginated(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.paymentsService.create(dto, user.id);
  }

  // Deleting a payment is a financial reversal; ADMIN only.
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}

// Nested under /invoices so the route reads as "this invoice's payments".
// Left open to any authenticated user, same as InvoicesController, since
// viewing an invoice's payment history is part of viewing the invoice.
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicePaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get(':invoiceId/payments')
  findByInvoice(@Param('invoiceId') invoiceId: string) {
    return this.paymentsService.findByInvoiceId(invoiceId);
  }
}
