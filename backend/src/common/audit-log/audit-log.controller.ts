import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '../../../generated/prisma/enums';
import { Roles } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { AuditLogRepository } from './audit-log.repository';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';

// Read-only, admin-only: who did what to which record, and when.
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AuditLogController {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  @Get()
  findAll(@Query() query: AuditLogQueryDto) {
    return this.auditLogRepository.findAllPaginated(query);
  }
}
