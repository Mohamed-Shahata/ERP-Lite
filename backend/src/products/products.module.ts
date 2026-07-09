import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module';
import { AuditLogModule } from '../common/audit-log/audit-log.module';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { ProductsService } from './products.service';

@Module({
  imports: [CategoriesModule, AuditLogModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService],
})
export class ProductsModule {}
