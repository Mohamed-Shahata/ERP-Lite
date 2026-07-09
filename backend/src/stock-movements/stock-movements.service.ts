import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { StockMovementQueryDto } from './dto/stock-movement-query.dto';
import {
  StockMovementDetail,
  StockMovementsRepository,
} from './stock-movements.repository';

@Injectable()
export class StockMovementsService {
  constructor(private readonly repository: StockMovementsRepository) {}

  findAllPaginated(
    query: StockMovementQueryDto,
  ): Promise<PaginatedResult<StockMovementDetail>> {
    return this.repository.findAllPaginated(query);
  }

  createAdjustment(
    dto: CreateAdjustmentDto,
    createdById: string,
  ): Promise<StockMovementDetail> {
    return this.repository.createAdjustment(dto, createdById);
  }
}
