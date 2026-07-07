import { Module } from '@nestjs/common';
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

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
