import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import {
  InvoiceStatus,
  PaymentMethod,
  PurchaseOrderStatus,
  SalesOrderStatus,
} from '../../generated/prisma/enums';
import { InventoryReportQueryDto } from './dto/inventory-report-query.dto';
import { PaymentsReportQueryDto } from './dto/payments-report-query.dto';
import { PurchasesReportQueryDto } from './dto/purchases-report-query.dto';
import { ReportDateRangeQueryDto } from './dto/report-date-range-query.dto';
import { SalesReportQueryDto } from './dto/sales-report-query.dto';

function dateRangeFilter(from?: string, to?: string) {
  if (!from && !to) return undefined;
  return {
    ...(from ? { gte: new Date(from) } : {}),
    ...(to ? { lte: new Date(to) } : {}),
  };
}

/** Groups rows by calendar day (YYYY-MM-DD) and sums an amount field. */
function groupByDay(
  rows: Array<{ date: Date; amount: number }>,
): Array<{ date: string; total: number; count: number }> {
  const buckets = new Map<string, { total: number; count: number }>();

  for (const row of rows) {
    const key = row.date.toISOString().slice(0, 10);
    const bucket = buckets.get(key) ?? { total: 0, count: 0 };
    bucket.total += row.amount;
    bucket.count += 1;
    buckets.set(key, bucket);
  }

  return [...buckets.entries()]
    .map(([date, bucket]) => ({ date, ...bucket }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

@Injectable()
export class ReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [
      totalProducts,
      totalCategories,
      totalCustomers,
      totalSuppliers,
      products,
      pendingPurchaseOrders,
      draftSalesOrders,
      confirmedSalesAggregate,
      receivedPurchasesAggregate,
      outstandingInvoicesAggregate,
      totalCollectedAggregate,
    ] = await Promise.all([
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.category.count(),
      this.prisma.customer.count(),
      this.prisma.supplier.count(),
      this.prisma.product.findMany({
        where: { isActive: true },
        select: { quantityInStock: true, reorderLevel: true, costPrice: true },
      }),
      this.prisma.purchaseOrder.count({
        where: { status: PurchaseOrderStatus.PENDING },
      }),
      this.prisma.salesOrder.count({
        where: { status: SalesOrderStatus.DRAFT },
      }),
      this.prisma.salesOrder.aggregate({
        where: { status: SalesOrderStatus.CONFIRMED },
        _sum: { totalAmount: true },
        _count: true,
      }),
      this.prisma.purchaseOrder.aggregate({
        where: { status: PurchaseOrderStatus.RECEIVED },
        _sum: { totalAmount: true },
        _count: true,
      }),
      this.prisma.invoice.aggregate({
        where: {
          status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID] },
        },
        _sum: { amount: true, amountPaid: true },
        _count: true,
      }),
      this.prisma.payment.aggregate({ _sum: { amount: true } }),
    ]);

    const lowStockCount = products.filter(
      (product) => product.quantityInStock <= product.reorderLevel,
    ).length;
    const inventoryValue = products.reduce(
      (sum, product) =>
        sum + product.quantityInStock * Number(product.costPrice),
      0,
    );

    const outstandingAmount =
      Number(outstandingInvoicesAggregate._sum.amount ?? 0) -
      Number(outstandingInvoicesAggregate._sum.amountPaid ?? 0);

    return {
      products: { total: totalProducts, lowStock: lowStockCount },
      inventoryValue,
      categories: totalCategories,
      customers: totalCustomers,
      suppliers: totalSuppliers,
      purchaseOrders: {
        pending: pendingPurchaseOrders,
        receivedCount: receivedPurchasesAggregate._count,
        receivedTotal: Number(receivedPurchasesAggregate._sum.totalAmount ?? 0),
      },
      salesOrders: {
        draft: draftSalesOrders,
        confirmedCount: confirmedSalesAggregate._count,
        confirmedTotal: Number(confirmedSalesAggregate._sum.totalAmount ?? 0),
      },
      invoices: {
        outstandingCount: outstandingInvoicesAggregate._count,
        outstandingAmount,
      },
      payments: {
        totalCollected: Number(totalCollectedAggregate._sum.amount ?? 0),
      },
    };
  }

  async getSalesReport(query: SalesReportQueryDto) {
    const where: Prisma.SalesOrderWhereInput = {
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(dateRangeFilter(query.from, query.to)
        ? { createdAt: dateRangeFilter(query.from, query.to) }
        : {}),
      ...(query.productId
        ? { items: { some: { productId: query.productId } } }
        : {}),
    };

    const orders = await this.prisma.salesOrder.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true } },
        items: {
          where: query.productId ? { productId: query.productId } : undefined,
          include: { product: { select: { id: true, name: true, sku: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const summary = orders.reduce(
      (acc, order) => {
        const orderQuantity = order.items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        return {
          totalOrders: acc.totalOrders + 1,
          totalRevenue: acc.totalRevenue + Number(order.totalAmount),
          totalQuantitySold: acc.totalQuantitySold + orderQuantity,
        };
      },
      { totalOrders: 0, totalRevenue: 0, totalQuantitySold: 0 },
    );

    return {
      summary,
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        customer: order.customer,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt,
        confirmedAt: order.confirmedAt,
        items: order.items.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          lineTotal: item.quantity * Number(item.unitPrice),
        })),
      })),
    };
  }

  async getPurchasesReport(query: PurchasesReportQueryDto) {
    const where: Prisma.PurchaseOrderWhereInput = {
      ...(query.supplierId ? { supplierId: query.supplierId } : {}),
      ...(dateRangeFilter(query.from, query.to)
        ? { createdAt: dateRangeFilter(query.from, query.to) }
        : {}),
    };

    const orders = await this.prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: { select: { id: true, name: true } },
        items: {
          include: { product: { select: { id: true, name: true, sku: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const summary = orders.reduce(
      (acc, order) => {
        const orderQuantity = order.items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        return {
          totalOrders: acc.totalOrders + 1,
          totalSpent: acc.totalSpent + Number(order.totalAmount),
          totalQuantityOrdered: acc.totalQuantityOrdered + orderQuantity,
        };
      },
      { totalOrders: 0, totalSpent: 0, totalQuantityOrdered: 0 },
    );

    return {
      summary,
      orders: orders.map((order) => ({
        id: order.id,
        poNumber: order.poNumber,
        status: order.status,
        supplier: order.supplier,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt,
        receivedAt: order.receivedAt,
        items: order.items.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
          unitCost: Number(item.unitCost),
          lineTotal: item.quantity * Number(item.unitCost),
        })),
      })),
    };
  }

  async getInventoryReport(query: InventoryReportQueryDto) {
    const products = await this.prisma.product.findMany({
      where: {
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      },
      include: { category: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    });

    const rows = products
      .map((product) => ({
        id: product.id,
        sku: product.sku,
        name: product.name,
        category: product.category,
        quantityInStock: product.quantityInStock,
        reorderLevel: product.reorderLevel,
        isLowStock: product.quantityInStock <= product.reorderLevel,
        isActive: product.isActive,
        costPrice: Number(product.costPrice),
        sellPrice: Number(product.sellPrice),
        stockValue: product.quantityInStock * Number(product.costPrice),
      }))
      .filter((product) => (query.lowStock ? product.isLowStock : true));

    const summary = rows.reduce(
      (acc, row) => ({
        totalProducts: acc.totalProducts + 1,
        totalStockValue: acc.totalStockValue + row.stockValue,
        lowStockCount: acc.lowStockCount + (row.isLowStock ? 1 : 0),
      }),
      { totalProducts: 0, totalStockValue: 0, lowStockCount: 0 },
    );

    return { summary, products: rows };
  }

  async getPaymentsReport(query: PaymentsReportQueryDto) {
    const where: Prisma.PaymentWhereInput = {
      ...(query.method ? { method: query.method } : {}),
      ...(dateRangeFilter(query.from, query.to)
        ? { paidAt: dateRangeFilter(query.from, query.to) }
        : {}),
      ...(query.status ? { invoice: { status: query.status } } : {}),
    };

    const payments = await this.prisma.payment.findMany({
      where,
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            salesOrder: {
              select: {
                orderNumber: true,
                customer: { select: { id: true, name: true } },
              },
            },
          },
        },
        recordedBy: { select: { id: true, name: true } },
      },
      orderBy: { paidAt: 'desc' },
    });

    const byMethod = Object.values(PaymentMethod).reduce<
      Record<string, number>
    >((acc, method) => ({ ...acc, [method]: 0 }), {});

    let totalCollected = 0;
    for (const payment of payments) {
      const amount = Number(payment.amount);
      totalCollected += amount;
      byMethod[payment.method] += amount;
    }

    return {
      summary: {
        totalPayments: payments.length,
        totalCollected,
        byMethod,
      },
      payments: payments.map((payment) => ({
        id: payment.id,
        amount: Number(payment.amount),
        method: payment.method,
        paidAt: payment.paidAt,
        recordedBy: payment.recordedBy,
        invoice: {
          id: payment.invoice.id,
          invoiceNumber: payment.invoice.invoiceNumber,
          status: payment.invoice.status,
          orderNumber: payment.invoice.salesOrder.orderNumber,
          customer: payment.invoice.salesOrder.customer,
        },
      })),
    };
  }

  async getSalesChart(query: ReportDateRangeQueryDto) {
    const orders = await this.prisma.salesOrder.findMany({
      where: {
        status: SalesOrderStatus.CONFIRMED,
        ...(dateRangeFilter(query.from, query.to)
          ? { createdAt: dateRangeFilter(query.from, query.to) }
          : {}),
      },
      select: { createdAt: true, totalAmount: true },
    });

    return groupByDay(
      orders.map((order) => ({
        date: order.createdAt,
        amount: Number(order.totalAmount),
      })),
    );
  }

  async getPurchasesChart(query: ReportDateRangeQueryDto) {
    const orders = await this.prisma.purchaseOrder.findMany({
      where: {
        status: PurchaseOrderStatus.RECEIVED,
        ...(dateRangeFilter(query.from, query.to)
          ? { createdAt: dateRangeFilter(query.from, query.to) }
          : {}),
      },
      select: { createdAt: true, totalAmount: true },
    });

    return groupByDay(
      orders.map((order) => ({
        date: order.createdAt,
        amount: Number(order.totalAmount),
      })),
    );
  }

  async getRecentActivity() {
    const [recentSalesOrders, recentPurchaseOrders, lowStockProducts] =
      await Promise.all([
        this.prisma.salesOrder.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { customer: { select: { id: true, name: true } } },
        }),
        this.prisma.purchaseOrder.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { supplier: { select: { id: true, name: true } } },
        }),
        this.prisma.product.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            sku: true,
            quantityInStock: true,
            reorderLevel: true,
          },
        }),
      ]);

    return {
      recentSalesOrders: recentSalesOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        customer: order.customer,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt,
      })),
      recentPurchaseOrders: recentPurchaseOrders.map((order) => ({
        id: order.id,
        poNumber: order.poNumber,
        status: order.status,
        supplier: order.supplier,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt,
      })),
      lowStockProducts: lowStockProducts
        .filter((product) => product.quantityInStock <= product.reorderLevel)
        .slice(0, 5),
    };
  }
}
