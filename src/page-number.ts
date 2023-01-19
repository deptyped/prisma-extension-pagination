import { resetSelection } from "./helpers";
import {
  PageNumberPaginationMeta,
  PageNumberPaginationOptions,
  PrismaModel,
  PrismaQuery,
} from "./types";

type PaginateWithPagesOptions = Required<PageNumberPaginationOptions>;

export const paginateWithPages = async (
  model: PrismaModel,
  query: PrismaQuery,
  { page, limit, includePageCount }: PaginateWithPagesOptions
): Promise<[unknown, PageNumberPaginationMeta]> => {
  const previousPage = page > 1 ? page - 1 : null;

  let results;
  let nextPage;
  let pageCount = null;
  if (includePageCount) {
    let totalCount;
    [results, totalCount] = await Promise.all([
      model.findMany({
        ...query,
        ...{
          skip: (page - 1) * limit,
          take: limit,
        },
      }),
      model.count({
        ...query,
        ...resetSelection,
      }),
    ]);

    pageCount = Math.ceil(totalCount / limit);
    nextPage = page < pageCount ? page + 1 : null;
  } else {
    results = await model.findMany({
      ...query,
      ...{
        skip: (page - 1) * limit,
        take: limit + 1,
      },
    });

    nextPage = results.length > limit ? page + 1 : null;
    if (nextPage) {
      results.pop();
    }
  }

  return [
    results,
    {
      isFirstPage: previousPage === null,
      isLastPage: nextPage === null,
      currentPage: page,
      previousPage,
      nextPage,
      pageCount,
    },
  ];
};
