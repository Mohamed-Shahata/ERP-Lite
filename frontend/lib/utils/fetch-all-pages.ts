// Backend caps `limit` at 100 (see PaginationQueryDto), so any "give me
// everything" call has to walk every page at that max size instead of
// asking for one huge page in one shot.
export const MAX_PAGE_LIMIT = 100;

export async function fetchAllPages<T>(
  request: (params: {
    page: number;
    limit: number;
  }) => Promise<{ data: T[]; meta: { totalPages: number } }>,
): Promise<T[]> {
  const limit = MAX_PAGE_LIMIT;
  let page = 1;
  let all: T[] = [];
  let totalPages = 1;

  do {
    const res = await request({ page, limit });
    all = all.concat(res.data);
    totalPages = res.meta.totalPages;
    page++;
  } while (page <= totalPages);

  return all;
}
