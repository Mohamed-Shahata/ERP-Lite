import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '../../generated/prisma/enums';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
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
}
