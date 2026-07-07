import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { SalesOrderQueryDto } from './dto/sales-order-query.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { SalesOrdersService } from './sales-orders.service';

// Unlike purchasing, selling is everyday front-line work: any authenticated
// user (ADMIN, MANAGER, EMPLOYEE) can build and confirm a sales order.
@Controller('sales-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Get()
  findAll(@Query() query: SalesOrderQueryDto) {
    return this.salesOrdersService.findAllPaginated(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesOrdersService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateSalesOrderDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.salesOrdersService.create(dto, user.id);
  }

  // Only while status is still DRAFT (enforced in the service).
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSalesOrderDto) {
    return this.salesOrdersService.update(id, dto);
  }

  // Only while status is still DRAFT (enforced in the service).
  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.salesOrdersService.cancel(id);
  }

  // Permanently deleting an order is restricted to ADMIN/MANAGER.
  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@Param('id') id: string) {
    return this.salesOrdersService.remove(id);
  }

  // "Confirm Order": checks stock availability, decrements it, writes an
  // OUT StockMovement per item, and flips status DRAFT -> CONFIRMED.
  @Post(':id/confirm')
  confirm(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.salesOrdersService.confirm(id, user.id);
  }
}
