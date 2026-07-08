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
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { PurchaseOrderQueryDto } from './dto/purchase-order-query.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseOrdersService } from './purchase-orders.service';

// Purchasing decisions (create/edit/cancel/delete/receive) are admin/manager
// territory, but any authenticated user — including employees — can view
// purchase orders.
@Controller('purchase-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Get()
  findAll(@Query() query: PurchaseOrderQueryDto) {
    return this.purchaseOrdersService.findAllPaginated(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  create(
    @Body() dto: CreatePurchaseOrderDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.purchaseOrdersService.create(dto, user.id);
  }

  // Only while status is still PENDING (enforced in the service).
  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto) {
    return this.purchaseOrdersService.update(id, dto);
  }

  // Only while status is still PENDING (enforced in the service).
  @Patch(':id/cancel')
  @Roles(Role.ADMIN, Role.MANAGER)
  cancel(@Param('id') id: string) {
    return this.purchaseOrdersService.cancel(id);
  }

  // Only while status is still PENDING (enforced in the service).
  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@Param('id') id: string) {
    return this.purchaseOrdersService.remove(id);
  }

  // The one business operation that actually moves inventory:
  // status -> RECEIVED, stock incremented, StockMovement recorded.
  @Post(':id/receive')
  @Roles(Role.ADMIN, Role.MANAGER)
  receive(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.purchaseOrdersService.receive(id, user.id);
  }
}
