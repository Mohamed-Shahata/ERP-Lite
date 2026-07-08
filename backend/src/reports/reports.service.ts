import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import {
  InvoiceStatus,
  PurchaseOrderStatus,
  SalesOrderStatus,
} from '../../generated/prisma/enums';
import { CacheService } from '../common/cache/cache.service';
import { CACHE_PREFIX, CACHE_TTL } from '../common/cache/cache-keys.constants';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  getSummary() {
    return this.cache.getOrSet(
      CACHE_PREFIX.REPORTS_SUMMARY,
      CACHE_TTL.REPORTS,
      () => this.buildSummary(),
    );
  }

  getSales() {
    return this.cache.getOrSet(
      CACHE_PREFIX.REPORTS_SALES,
      CACHE_TTL.REPORTS,
      () => this.buildSales(),
    );
  }

  getPurchases() {
    return this.cache.getOrSet(
      CACHE_PREFIX.REPORTS_PURCHASES,
      CACHE_TTL.REPORTS,
      () => this.buildPurchases(),
    );
  }

  getInventory() {
    return this.cache.getOrSet(
      CACHE_PREFIX.REPORTS_INVENTORY,
      CACHE_TTL.REPORTS,
      () => this.buildInventory(),
    );
  }

  getPayments() {
    return this.cache.getOrSet(
      CACHE_PREFIX.REPORTS_PAYMENTS,
      CACHE_TTL.REPORTS,
      () => this.buildPayments(),
    );
  }

  private async buildSummary() {
    const [sales, purchases, inventory, payments] = await Promise.all([
      this.buildSales(),
      this.buildPurchases(),
      this.buildInventory(),
      this.buildPayments(),
    ]);

    return {
      sales: sales.summary,
      purchases: purchases.summary,
      profit: sales.summary.total - purchases.summary.total,
      invoicesByStatus: payments.invoicesByStatus,
      unpaidInvoicesCount: payments.unpaidInvoicesCount,
      topSellingProducts: sales.topSellingProducts,
      lowStockProducts: inventory.lowStockProducts,
    };
  }

  private async buildSales() {
    const [salesAgg, topProducts] = await Promise.all([
      this.prisma.salesOrder.aggregate({
        where: { status: SalesOrderStatus.CONFIRMED },
        _sum: { totalAmount: true },
        _count: true,
      }),
      this.prisma.salesOrderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    const productNames = await this.prisma.product.findMany({
      where: { id: { in: topProducts.map((p) => p.productId) } },
      select: { id: true, name: true, sku: true },
    });

    return {
      summary: {
        total: Number(salesAgg._sum.totalAmount ?? 0),
        ordersCount: salesAgg._count,
      },
      topSellingProducts: topProducts.map((p) => ({
        product: productNames.find((n) => n.id === p.productId) ?? null,
        quantitySold: p._sum.quantity ?? 0,
      })),
    };
  }

  private async buildPurchases() {
    const purchaseAgg = await this.prisma.purchaseOrder.aggregate({
      where: { status: PurchaseOrderStatus.RECEIVED },
      _sum: { totalAmount: true },
      _count: true,
    });

    return {
      summary: {
        total: Number(purchaseAgg._sum.totalAmount ?? 0),
        ordersCount: purchaseAgg._count,
      },
    };
  }

  private async buildInventory() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        quantityInStock: true,
        reorderLevel: true,
        costPrice: true,
      },
    });

    const totalStockValue = products.reduce(
      (sum, p) => sum + p.quantityInStock * Number(p.costPrice),
      0,
    );

    return {
      totalProducts: products.length,
      totalStockValue,
      lowStockProducts: products.filter(
        (p) => p.quantityInStock <= p.reorderLevel,
      ),
    };
  }

  private async buildPayments() {
    const [paymentsByMethod, invoicesByStatus] = await Promise.all([
      this.prisma.payment.groupBy({
        by: ['method'],
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.invoice.groupBy({
        by: ['status'],
        _count: true,
        _sum: { amount: true, amountPaid: true },
      }),
    ]);

    const invoiceRows = invoicesByStatus.map((row) => ({
      status: row.status,
      count: row._count,
      amount: Number(row._sum.amount ?? 0),
      amountPaid: Number(row._sum.amountPaid ?? 0),
    }));

    return {
      totalCollected: paymentsByMethod.reduce(
        (sum, row) => sum + Number(row._sum.amount ?? 0),
        0,
      ),
      byMethod: paymentsByMethod.map((row) => ({
        method: row.method,
        total: Number(row._sum.amount ?? 0),
        count: row._count,
      })),
      invoicesByStatus: invoiceRows,
      unpaidInvoicesCount:
        invoiceRows.find((r) => r.status === InvoiceStatus.UNPAID)?.count ?? 0,
    };
  }
}
