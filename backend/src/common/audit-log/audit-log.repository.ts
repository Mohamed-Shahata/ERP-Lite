import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client';
import { PaginatedResult } from '../interfaces/paginated-result.interface';
import { paginate } from '../utils/paginate.util';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';

const listInclude = {
  user: { select: { id: true, name: true, email: true } },
} as const;

export type AuditLogWithUser = Prisma.AuditLogGetPayload<{
  include: typeof listInclude;
}>;

@Injectable()
export class AuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllPaginated(
    query: AuditLogQueryDto,
  ): Promise<PaginatedResult<AuditLogWithUser>> {
    const where: Prisma.AuditLogWhereInput = {
      ...(query.action ? { action: query.action } : {}),
      ...(query.entityType ? { entityType: query.entityType } : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    return paginate({
      page: query.page,
      limit: query.limit,
      findMany: (args) =>
        this.prisma.auditLog.findMany({
          ...args,
          where,
          include: listInclude,
          orderBy: { createdAt: 'desc' },
        }),
      count: () => this.prisma.auditLog.count({ where }),
    });
  }
}
