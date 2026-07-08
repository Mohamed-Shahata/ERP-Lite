import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
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
}
