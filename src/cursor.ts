import { CursorPaginationMeta } from ".";
import { resetSelection } from "./helpers";
import { CursorPaginationOptions, PrismaModel, PrismaQuery } from "./types";

interface PaginateWithCursorOptions<R, C>
  extends CursorPaginationOptions<R, C> {
  getCursor: NonNullable<CursorPaginationOptions<R, C>["getCursor"]>;
  parseCursor: NonNullable<CursorPaginationOptions<R, C>["parseCursor"]>;
}

export const paginateWithCursor = async <R, C>(
  model: PrismaModel,
  query: PrismaQuery,
  {
    after,
    before,
    getCursor,
    parseCursor,
    limit,
  }: PaginateWithCursorOptions<R, C>,
): Promise<[unknown, CursorPaginationMeta]> => {
  let results;
  let hasPreviousPage = false;
  let hasNextPage = false;

  if (typeof before === "string") {
    const cursor = parseCursor(before);

    let nextResult;
    [results, nextResult] = await Promise.all([
      model.findMany({
        ...query,
        cursor,
        skip: 1,
        take: limit === null ? undefined : -limit - 1,
      }),
      model.findMany({
        ...query,
        ...resetSelection,
        cursor,
        take: 1,
      }),
    ]);

    if (limit !== null && results.length > limit) {
      hasPreviousPage = Boolean(results.shift());
    }
    hasNextPage = Boolean(nextResult.length);
  } else if (typeof after === "string") {
    const cursor = parseCursor(after);

    let previousResult;
    [results, previousResult] = await Promise.all([
      model.findMany({
        ...query,
        cursor,
        skip: 1,
        take: limit === null ? undefined : limit + 1,
      }),
      model.findMany({
        ...query,
        ...resetSelection,
        cursor,
        take: -1,
      }),
    ]);

    hasPreviousPage = Boolean(previousResult.length);
    if (limit !== null && results.length > limit) {
      hasNextPage = Boolean(results.pop());
    }
  } else {
    results = await model.findMany({
      ...query,
      take: limit === null ? undefined : limit + 1,
    });

    hasPreviousPage = false;
    if (limit !== null && results.length > limit) {
      hasNextPage = Boolean(results.pop());
    }
  }

  const startCursor = results.length ? getCursor(results[0]) : null;
  const endCursor = results.length
    ? getCursor(results[results.length - 1])
    : null;

  return [
    results,
    {
      hasNextPage,
      hasPreviousPage,
      startCursor,
      endCursor,
    },
  ];
};
