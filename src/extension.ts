import { Prisma } from "@prisma/client";
import { PageNumberPaginationOptions, PageNumberPaginationMeta } from "./types";

type PrismaModel = {
  [k in "findMany" | "count"]: CallableFunction;
};

type PrismaQuery = {
  where: Record<string, unknown>;
};

const paginateWithPages = async (
  model: PrismaModel,
  query: PrismaQuery,
  limit: number,
  currentPage: number
): Promise<[unknown, PageNumberPaginationMeta]> => {
  const results = await model.findMany({
    ...query,
    ...{
      skip: (currentPage - 1) * limit,
      take: limit + 1,
    },
  });

  const previousPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = results.length > limit ? currentPage + 1 : null;
  if (nextPage) {
    results.pop();
  }

  return [
    results,
    {
      isFirstPage: previousPage === null,
      isLastPage: nextPage === null,
      currentPage,
      previousPage,
      nextPage,
      pageCount: null,
    },
  ];
};

const paginateWithPagesIncludePageCount = async (
  model: PrismaModel,
  query: PrismaQuery,
  limit: number,
  currentPage: number
): Promise<[unknown, PageNumberPaginationMeta]> => {
  const [results, totalCount] = await Promise.all([
    model.findMany({
      ...query,
      ...{
        skip: (currentPage - 1) * limit,
        take: limit,
      },
    }),
    model.count({ where: query?.where }),
  ]);

  const pageCount = Math.ceil(totalCount / limit);
  const previousPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < pageCount ? currentPage + 1 : null;

  return [
    results,
    {
      isFirstPage: previousPage === null,
      isLastPage: nextPage === null,
      currentPage,
      previousPage,
      nextPage,
      pageCount,
    },
  ];
};

export const extension = Prisma.defineExtension({
  name: "pagination",
  model: {
    $allModels: {
      paginate<T extends PrismaModel, A>(
        this: T,
        args?: Prisma.Exact<
          A,
          Omit<Prisma.Args<T, "findMany">, "cursor" | "take" | "skip">
        >
      ) {
        return {
          withPages: async (
            options: PageNumberPaginationOptions
          ): Promise<
            [Prisma.Result<T, A, "findMany">, PageNumberPaginationMeta]
          > => {
            const {
              page: currentPage,
              limit,
              includePageCount,
            } = {
              page: 1,
              includePageCount: false,
              ...options,
            } satisfies PageNumberPaginationOptions;

            if (
              typeof currentPage !== "number" ||
              currentPage < 1 ||
              currentPage > Number.MAX_SAFE_INTEGER
            ) {
              throw new Error("Invalid page option value");
            }

            if (
              typeof limit !== "number" ||
              limit < 1 ||
              limit > Number.MAX_SAFE_INTEGER
            ) {
              throw new Error("Invalid limit option value");
            }

            const query = (args ?? {}) as PrismaQuery;

            return (
              includePageCount
                ? paginateWithPagesIncludePageCount(
                    this,
                    query,
                    limit,
                    currentPage
                  )
                : paginateWithPages(this, query, limit, currentPage)
            ) as Promise<
              [Prisma.Result<T, A, "findMany">, PageNumberPaginationMeta]
            >;
          },
        };
      },
    },
  },
});
