import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { CurrentUserPayload } from '../common/interfaces/current-user.interface';
import { DashboardService } from './dashboard.service';

// No @Roles(...): every authenticated role gets a dashboard, but the
// *content* differs per role (enforced in the service, not the route).
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  getDashboard(@CurrentUser() user: CurrentUserPayload) {
    return this.dashboardService.getDashboard(user);
  }
}
