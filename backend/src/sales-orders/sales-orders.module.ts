import { Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { ProductsModule } from '../products/products.module';
import { SalesOrdersController } from './sales-orders.controller';
import { SalesOrdersRepository } from './sales-orders.repository';
import { SalesOrdersService } from './sales-orders.service';

@Module({
  imports: [CustomersModule, ProductsModule],
  controllers: [SalesOrdersController],
  providers: [SalesOrdersService, SalesOrdersRepository],
  exports: [SalesOrdersService],
})
export class SalesOrdersModule {}
