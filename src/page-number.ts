import { resetOrdering, resetSelection } from "./helpers";
import {
  PageNumberPaginationMeta,
  PageNumberPaginationOptions,
  PrismaModel,
  PrismaQuery,
} from "./types";

export const paginateWithPages = async (
  model: PrismaModel,
  query: PrismaQuery,
  { page, limit, includePageCount }: Required<PageNumberPaginationOptions>,
): Promise<[unknown, PageNumberPaginationMeta<typeof includePageCount>]> => {
  const previousPage = page > 1 ? page - 1 : null;

  let results;
  let nextPage;
  let pageCount = null;
  let totalCount = null;
  if (includePageCount) {
    [results, totalCount] = await Promise.all([
      model.findMany({
        ...query,
        ...{
          skip: (page - 1) * (limit ?? 0),
          take: limit,
        },
      }),
      model.count({
        ...query,
        ...resetSelection,
        ...resetOrdering,
      }),
    ]);

    pageCount = limit === null ? 1 : Math.ceil(totalCount / limit);
    nextPage = page < pageCount ? page + 1 : null;
  } else {
    results = await model.findMany({
      ...query,
      ...{
        skip: (page - 1) * (limit ?? 0),
        take: limit === null ? undefined : limit + 1,
      },
    });

    nextPage = limit === null ? null : results.length > limit ? page + 1 : null;
    if (nextPage) {
      results.pop();
    }
  }

  return [
    results,
    {
      ...{
        isFirstPage: previousPage === null,
        isLastPage: nextPage === null,
        currentPage: page,
        previousPage,
        nextPage,
      },
      ...(includePageCount === true
        ? {
            pageCount,
            totalCount,
          }
        : {}),
    },
  ];
};
