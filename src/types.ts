export type PageNumberPaginationOptions = {
  limit: number;
  page?: number;
  includePageCount?: boolean;
};

export type PageNumberPaginationMeta = {
  isFirstPage: boolean;
  isLastPage: boolean;
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  pageCount: number | null;
};
