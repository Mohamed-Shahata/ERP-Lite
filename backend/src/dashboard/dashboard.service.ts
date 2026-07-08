import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import {
  InvoiceStatus,
  PurchaseOrderStatus,
  Role,
  SalesOrderStatus,
} from '../../generated/prisma/enums';
import type { CurrentUserPayload } from '../common/interfaces/current-user.interface';
import { CacheService } from '../common/cache/cache.service';
import { CACHE_PREFIX, CACHE_TTL } from '../common/cache/cache-keys.constants';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async getDashboard(user: CurrentUserPayload) {
    // Employee dashboards are per-user (their own orders/payments today),
    // so the cache key includes the user id for that role; admin/manager
    // dashboards are the same for everyone with that role.
    const scope = user.role === Role.EMPLOYEE ? user.id : 'all';
    const cacheKey = `${CACHE_PREFIX.DASHBOARD_OVERVIEW}${user.role}:${scope}`;

    return this.cache.getOrSet(cacheKey, CACHE_TTL.DASHBOARD, () =>
      this.buildDashboard(user),
    );
  }

  private async buildDashboard(user: CurrentUserPayload) {
    const lowStockCount = await this.getLowStockCount();

    if (user.role === Role.EMPLOYEE) {
      return this.getEmployeeDashboard(user.id, lowStockCount);
    }

    return this.getManagementDashboard(user.role, lowStockCount);
  }

  /**
   * Prisma can't compare two columns of the same row in a `where` filter,
   * so low-stock (quantityInStock <= reorderLevel) is computed in memory.
   * Fine at this project's scale (an ERP "Lite" product catalog).
   */
  private async getLowStockCount(): Promise<number> {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      select: { quantityInStock: true, reorderLevel: true },
    });

    return products.filter((p) => p.quantityInStock <= p.reorderLevel).length;
  }

  /** Admin sees everything; Manager sees the same minus user-management data. */
  private async getManagementDashboard(role: Role, lowStockCount: number) {
    const [salesAgg, purchaseAgg, unpaidInvoicesCount, recentSalesOrders] =
      await Promise.all([
        this.prisma.salesOrder.aggregate({
          where: { status: SalesOrderStatus.CONFIRMED },
          _sum: { totalAmount: true },
        }),
        this.prisma.purchaseOrder.aggregate({
          where: { status: PurchaseOrderStatus.RECEIVED },
          _sum: { totalAmount: true },
        }),
        this.prisma.invoice.count({
          where: { status: { not: InvoiceStatus.PAID } },
        }),
        this.prisma.salesOrder.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
            customer: { select: { name: true } },
          },
        }),
      ]);

    const totalSales = Number(salesAgg._sum.totalAmount ?? 0);
    const totalPurchases = Number(purchaseAgg._sum.totalAmount ?? 0);

    const base = {
      totalSales,
      totalPurchases,
      profit: totalSales - totalPurchases,
      lowStockCount,
      unpaidInvoicesCount,
      recentActivity: recentSalesOrders,
    };

    if (role !== Role.ADMIN) {
      return base;
    }

    const userCount = await this.prisma.user.count({
      where: { isActive: true },
    });

    return { ...base, userCount };
  }

  /** Employee dashboard: only their own day-to-day activity, no financials. */
  private async getEmployeeDashboard(userId: string, lowStockCount: number) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [salesOrdersCreatedToday, paymentsRecordedToday, recentSalesOrders] =
      await Promise.all([
        this.prisma.salesOrder.count({
          where: { createdById: userId, createdAt: { gte: startOfToday } },
        }),
        this.prisma.payment.count({
          where: { recordedById: userId, paidAt: { gte: startOfToday } },
        }),
        this.prisma.salesOrder.findMany({
          where: { createdById: userId },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
            customer: { select: { name: true } },
          },
        }),
      ]);

    return {
      salesOrdersCreatedToday,
      paymentsRecordedToday,
      lowStockCount,
      recentActivity: recentSalesOrders,
    };
  }
}
