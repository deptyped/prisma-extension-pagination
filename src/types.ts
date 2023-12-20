export type PrismaModel = {
  [k in "findMany" | "count"]: CallableFunction;
};

export type PrismaQuery = {
  where: Record<string, unknown>;
};

export type PageNumberPaginationOptions = {
  limit: number;
  page?: number;
  includePageCount?: boolean;
};

export type PageNumberPagination = {
  isFirstPage: boolean;
  isLastPage: boolean;
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
};

export type PageNumberCounters = {
  pageCount: number;
  totalCount: number;
};

export type PageNumberPaginationMeta<
  TWithCounters extends boolean | undefined = false
> = TWithCounters extends true
  ? PageNumberPagination & PageNumberCounters
  : PageNumberPagination;

export type GetCursorFunction<R> = (result: R) => string | number;

export type ParseCursorFunction<C> = (cursor: string | number) => C;

export type CursorPaginationOptions<Result, Condition> = {
  limit: number;
  after?: string | number;
  before?: string | number;
  getCursor?: GetCursorFunction<Result>;
  parseCursor?: ParseCursorFunction<Condition>;
};

export type CursorPaginationMeta = {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor: string | number | null;
  endCursor: string | number | null;
};
