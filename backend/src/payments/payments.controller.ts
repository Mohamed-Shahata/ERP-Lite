import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { CurrentUserPayload } from '../common/interfaces/current-user.interface';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';

// Nested under an invoice: a payment always belongs to exactly one invoice,
// and there's no standalone "browse all payments" use case in this app.
// No @Roles(...) here (same as InvoicesController): recording/collecting a
// customer payment is everyday front-line work, open to any authenticated user.
@Controller('invoices/:invoiceId/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  findAll(@Param('invoiceId') invoiceId: string) {
    return this.paymentsService.findAllForInvoice(invoiceId);
  }

  // Creates the Payment row and atomically updates the invoice's
  // amountPaid/status (PARTIALLY_PAID -> PAID) in one DB transaction.
  @Post()
  create(
    @Param('invoiceId') invoiceId: string,
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.paymentsService.create(invoiceId, dto, user.id);
  }
}
