import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { CustomersModule } from './customers/customers.module';
import { SalesOrdersModule } from './sales-orders/sales-orders.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { CompanySettingsModule } from './company-settings/company-settings.module';
import { ContentPagesModule } from './content-pages/content-pages.module';
import { CacheModule } from './common/cache/cache.module';
import { ReportsModule } from './reports/reports.module';
import { AuditLogModule } from './common/audit-log/audit-log.module';

@Module({
  imports: [
    // Default request budget for every route (login has its own, stricter
    // limit set with @Throttle on the controller).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    ConfigModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    SuppliersModule,
    PurchaseOrdersModule,
    CustomersModule,
    SalesOrdersModule,
    InvoicesModule,
    StockMovementsModule,
    PaymentsModule,
    DashboardModule,
    CompanySettingsModule,
    ContentPagesModule,
    CacheModule,
    ReportsModule,
    AuditLogModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
