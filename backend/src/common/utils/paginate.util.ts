import { PaginatedResult } from '../interfaces/paginated-result.interface';

interface PaginateArgs<T> {
  page?: number;
  limit?: number;
  /** Runs the actual DB query, receiving the computed skip/take. */
  findMany: (args: { skip: number; take: number }) => Promise<T[]>;
  /** Runs the matching count query (same filters, no skip/take). */
  count: () => Promise<number>;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

/**
 * Single, reusable pagination helper.
 *
 * Every module (products, categories, ...) calls this same function
 * from its repository instead of re-implementing skip/take/meta math.
 *
 * Usage:
 *   return paginate({
 *     page: query.page,
 *     limit: query.limit,
 *     findMany: (args) => this.prisma.product.findMany({ ...args, where, include, orderBy }),
 *     count: () => this.prisma.product.count({ where }),
 *   });
 */
export async function paginate<T>({
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
  findMany,
  count,
}: PaginateArgs<T>): Promise<PaginatedResult<T>> {
  const safePage = page > 0 ? page : DEFAULT_PAGE;
  const safeLimit = limit > 0 ? limit : DEFAULT_LIMIT;
  const skip = (safePage - 1) * safeLimit;

  const [data, total] = await Promise.all([
    findMany({ skip, take: safeLimit }),
    count(),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / safeLimit);

  return {
    data,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  };
}
