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
  TWithCounters extends boolean | undefined = false,
> = TWithCounters extends true
  ? PageNumberPagination & PageNumberCounters
  : PageNumberPagination;

export type CursorPaginationOptions<Result, Condition> = {
  limit: number;
  after?: string;
  before?: string;
  getCursor?: (result: Result) => string;
  parseCursor?: (cursor: string) => Condition;
};

export type CursorPaginationMeta = {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
};
