import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from '../../generated/prisma/enums';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ReportsService } from './reports.service';

// Financial/operational reports are ADMIN-only.
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  getSummary() {
    return this.reportsService.getSummary();
  }

  @Get('sales')
  getSales() {
    return this.reportsService.getSales();
  }

  @Get('purchases')
  getPurchases() {
    return this.reportsService.getPurchases();
  }

  @Get('inventory')
  getInventory() {
    return this.reportsService.getInventory();
  }

  @Get('payments')
  getPayments() {
    return this.reportsService.getPayments();
  }
}
