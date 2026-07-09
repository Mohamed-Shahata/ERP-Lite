import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '../../generated/prisma/enums';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { CurrentUserPayload } from '../common/interfaces/current-user.interface';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { StockMovementQueryDto } from './dto/stock-movement-query.dto';
import { StockMovementsService } from './stock-movements.service';

// Inventory audit trail — same access level as purchase-orders/reports:
// admins and managers only.
@Controller('stock-movements')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Get()
  findAll(@Query() query: StockMovementQueryDto) {
    return this.stockMovementsService.findAllPaginated(query);
  }

  // Manual stock correction (stocktake, damage, shrinkage, etc). Writes an
  // ADJUSTMENT movement with referenceType MANUAL and applies the signed
  // quantity delta to the product's quantityInStock.
  @Post('adjustments')
  createAdjustment(
    @Body() dto: CreateAdjustmentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.stockMovementsService.createAdjustment(dto, user.id);
  }
}
