import { User } from "@prisma/client";
import { PageNumberPaginationMeta } from "../src";

import { prisma } from "./helpers/prisma";
import { USERS_PER_PAGE, POSTS_COUNT } from "./helpers/constants";
import { getResultsByPage } from "./helpers/utils";

let USERS: Array<Pick<User, "id">>;

beforeAll(async () => {
  USERS = await prisma.user.findMany({
    select: {
      id: true,
    },
  });
});

describe("$paginate with pages", () => {
  test("load first page", async () => {
    const limit = USERS_PER_PAGE;
    const query = prisma.user.paginate({
      select: {
        id: true,
      },
    });
    const [results, meta] = await query.withPages({
      limit,
    });
    const [resultsWithPageCount, metaWithPageCount] = await query.withPages({
      limit,
      includePageCount: true,
    });

    expect(results.length).toBe(USERS_PER_PAGE);
    expect(results).toStrictEqual(getResultsByPage(USERS, 1, limit));

    expect(resultsWithPageCount.length).toBe(USERS_PER_PAGE);
    expect(resultsWithPageCount).toStrictEqual(
      getResultsByPage(USERS, 1, limit)
    );

    const validMeta = {
      currentPage: 1,
      isFirstPage: true,
      isLastPage: false,
      previousPage: null,
      nextPage: 2,
      pageCount: null,
    } satisfies PageNumberPaginationMeta;

    expect(meta).toStrictEqual(validMeta);
    expect(metaWithPageCount).toStrictEqual({
      ...validMeta,
      pageCount: 5,
    } satisfies PageNumberPaginationMeta);
  });

  test("load second page", async () => {
    const page = 2;
    const limit = USERS_PER_PAGE;
    const query = prisma.user.paginate({
      select: {
        id: true,
      },
    });
    const [results, meta] = await query.withPages({
      page,
      limit,
    });
    const [resultsWithPageCount, metaWithPageCount] = await query.withPages({
      page,
      limit,
      includePageCount: true,
    });

    expect(results.length).toBe(USERS_PER_PAGE);
    expect(results).toStrictEqual(getResultsByPage(USERS, page, limit));

    expect(resultsWithPageCount.length).toBe(USERS_PER_PAGE);
    expect(resultsWithPageCount).toStrictEqual(
      getResultsByPage(USERS, page, limit)
    );

    const validMeta = {
      currentPage: 2,
      isFirstPage: false,
      isLastPage: false,
      previousPage: 1,
      nextPage: 3,
      pageCount: null,
    } satisfies PageNumberPaginationMeta;

    expect(meta).toStrictEqual(validMeta);
    expect(metaWithPageCount).toStrictEqual({
      ...validMeta,
      pageCount: 5,
    } satisfies PageNumberPaginationMeta);
  });

  test("load last page", async () => {
    const page = 5;
    const limit = USERS_PER_PAGE;
    const query = prisma.user.paginate({
      select: {
        id: true,
      },
    });

    const [results, meta] = await query.withPages({
      page,
      limit,
    });
    const [resultsWithPageCount, metaWithPageCount] = await query.withPages({
      page,
      limit,
      includePageCount: true,
    });

    expect(results.length).toBe(USERS_PER_PAGE);
    expect(results).toStrictEqual(getResultsByPage(USERS, page, limit));

    expect(resultsWithPageCount.length).toBe(USERS_PER_PAGE);
    expect(resultsWithPageCount).toStrictEqual(
      getResultsByPage(USERS, page, limit)
    );

    const validMeta = {
      currentPage: 5,
      isFirstPage: false,
      isLastPage: true,
      previousPage: 4,
      nextPage: null,
      pageCount: null,
    } satisfies PageNumberPaginationMeta;

    expect(meta).toStrictEqual(validMeta);
    expect(metaWithPageCount).toStrictEqual({
      ...validMeta,
      pageCount: 5,
    });
  });

  test("calculate page count with where condition", async () => {
    const [results, meta] = await prisma.post
      .paginate({
        where: {
          title: "Untitled",
        },
      })
      .withPages({
        limit: 2,
        page: 2,
        includePageCount: true,
      });

    expect(results.length).toBe(2);
    expect(meta).toStrictEqual({
      currentPage: 2,
      isFirstPage: false,
      isLastPage: false,
      previousPage: 1,
      nextPage: 3,
      pageCount: POSTS_COUNT / 2 / 2,
    } satisfies PageNumberPaginationMeta);
  });

  test("throw error if options are invalid", async () => {
    expect(
      async () =>
        await prisma.user.paginate().withPages({
          limit: 0,
        })
    ).rejects.toThrow(Error);

    expect(
      async () =>
        await prisma.user.paginate().withPages({
          limit: 1,
          page: -1,
        })
    ).rejects.toThrow(Error);

    expect(
      // @ts-expect-error to test
      async () => await prisma.user.paginate().withPages()
    ).rejects.toThrow(Error);
  });
});
