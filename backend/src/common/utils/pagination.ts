export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

export type PaginateOptions = {
  page?: number | string;
  perPage?: number | string;
};

export const paginate = async <T, K>(
  model: any,
  args: any = { where: {} },
  options: PaginateOptions = { page: 1, perPage: 10 },
): Promise<PaginatedResult<T>> => {
  const page = Number(options.page || 1);
  const perPage = Number(options.perPage || 10);

  const skip = page > 0 ? perPage * (page - 1) : 0;
  const [total, data] = await Promise.all([
    model.count({ where: args.where }),
    model.findMany({
      ...args,
      take: perPage,
      skip,
    }),
  ]);

  const lastPage = Math.ceil(total / perPage);

  return {
    data,
    meta: {
      total,
      lastPage,
      currentPage: page,
      perPage,
      prev: page > 1 ? page - 1 : null,
      next: page < lastPage ? page + 1 : null,
    },
  };
};
