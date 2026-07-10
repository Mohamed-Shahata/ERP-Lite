import { Module } from '@nestjs/common';
import { AuditLogModule } from '../common/audit-log/audit-log.module';
import { ContentPagesController } from './content-pages.controller';
import { ContentPagesRepository } from './content-pages.repository';
import { ContentPagesService } from './content-pages.service';

@Module({
  imports: [AuditLogModule],
  controllers: [ContentPagesController],
  providers: [ContentPagesService, ContentPagesRepository],
  exports: [ContentPagesService],
})
export class ContentPagesModule {}
