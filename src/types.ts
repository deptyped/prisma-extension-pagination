export type PrismaModel = {
  [k in 'findMany' | 'count']: CallableFunction;
}

export interface PrismaQuery {
  where: Record<string, unknown>
}

export interface PageNumberPaginationOptions {
  limit: number | null
  page?: number
  includePageCount?: boolean
}

export interface PageNumberPagination {
  isFirstPage: boolean
  isLastPage: boolean
  currentPage: number
  previousPage: number | null
  nextPage: number | null
}

export interface PageNumberCounters {
  pageCount: number
  totalCount: number
}

export type PageNumberPaginationMeta<
  TWithCounters extends boolean | undefined = false,
> = TWithCounters extends true
  ? PageNumberPagination & PageNumberCounters
  : PageNumberPagination

export type GetCursorFunction<R> = (result: R) => string

export type ParseCursorFunction<C> = (cursor: string) => C

export interface CursorPaginationOptions<Result, Condition> {
  limit: number | null
  after?: string
  before?: string
  getCursor?: GetCursorFunction<Result>
  parseCursor?: ParseCursorFunction<Condition>
}

export interface CursorPaginationMeta {
  hasPreviousPage: boolean
  hasNextPage: boolean
  startCursor: string | null
  endCursor: string | null
}
