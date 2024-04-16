import { PageNumberPaginationMeta } from "../src";

import { prisma } from "./helpers/prisma";
import { USERS_PER_PAGE, POSTS_COUNT } from "./helpers/constants";
import { PrismaClient } from "@prisma/client";

import pagination from "../src";

describe("paginate with pages", () => {
  test("accepts default options", async () => {
    const page = 5;
    const limit = USERS_PER_PAGE;

    const prismaX = new PrismaClient().$extends(
      pagination({
        pages: {
          limit,
          includePageCount: true,
        },
      }),
    );

    const [results, meta] = await prismaX.user.paginate().withPages({
      page,
    });

    const expectedResults = await prisma.user.findMany({
      take: -limit,
    });

    expect(results).toStrictEqual(expectedResults);

    const expectedMeta = {
      currentPage: 5,
      isFirstPage: false,
      isLastPage: true,
      previousPage: 4,
      nextPage: null,
      pageCount: 5,
      totalCount: 20,
    } satisfies PageNumberPaginationMeta<true>;

    expect(meta).toStrictEqual(expectedMeta);
  });

  test("override default options", async () => {
    const page = 5;
    const limit = USERS_PER_PAGE;

    const prismaX = new PrismaClient().$extends(
      pagination({
        pages: {
          limit,
          includePageCount: true,
        },
      }),
    );

    const [results, meta] = await prismaX.user.paginate().withPages({
      page,
      includePageCount: false,
    });

    const expectedResults = await prisma.user.findMany({
      take: -limit,
    });

    expect(results).toStrictEqual(expectedResults);

    const expectedMeta = {
      currentPage: 5,
      isFirstPage: false,
      isLastPage: true,
      previousPage: 4,
      nextPage: null,
    } satisfies PageNumberPaginationMeta<false>;

    expect(meta).toStrictEqual(expectedMeta);
  });

  test("load first page", async () => {
    const limit = USERS_PER_PAGE;
    const [results, meta] = await prisma.user.paginate().withPages({
      limit,
    });

    const expectedResults = await prisma.user.findMany({
      take: limit,
    });

    expect(results).toStrictEqual(expectedResults);
    expect(meta).toStrictEqual({
      currentPage: 1,
      isFirstPage: true,
      isLastPage: false,
      previousPage: null,
      nextPage: 2,
    } satisfies PageNumberPaginationMeta);
  });

  test("load second page", async () => {
    const page = 2;
    const limit = USERS_PER_PAGE;

    const [results, meta] = await prisma.user.paginate().withPages({
      page,
      limit,
    });

    const expectedResults = await prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });

    expect(results).toStrictEqual(expectedResults);
    expect(meta).toStrictEqual({
      currentPage: 2,
      isFirstPage: false,
      isLastPage: false,
      previousPage: 1,
      nextPage: 3,
    } satisfies PageNumberPaginationMeta);
  });

  test("load last page", async () => {
    const page = 5;
    const limit = USERS_PER_PAGE;

    const query = prisma.user.paginate();

    const [results, meta] = await query.withPages({
      page,
      limit,
    });

    const [resultsWithPageCount, metaWithPageCount] = await query.withPages({
      page,
      limit,
      includePageCount: true,
    });

    const expectedResults = await prisma.user.findMany({
      take: -limit,
    });

    expect(results).toStrictEqual(expectedResults);
    expect(resultsWithPageCount).toStrictEqual(expectedResults);

    const expectedMeta = {
      currentPage: 5,
      isFirstPage: false,
      isLastPage: true,
      previousPage: 4,
      nextPage: null,
    } satisfies PageNumberPaginationMeta;

    expect(meta).toStrictEqual(expectedMeta);
    expect(metaWithPageCount).toStrictEqual({
      ...expectedMeta,
      pageCount: 5,
      totalCount: 20,
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
      totalCount: 20,
    } satisfies PageNumberPaginationMeta<true>);
  });

  test("throw error if options are invalid", async () => {
    await expect(
      prisma.user.paginate().withPages({
        limit: 0,
      }),
    ).rejects.toThrow(Error);

    await expect(
      prisma.user.paginate().withPages({
        limit: 1,
        page: -1,
      }),
    ).rejects.toThrow(Error);

    await expect(
      // @ts-expect-error to test
      prisma.user.paginate().withPages(),
    ).rejects.toThrow(Error);
  });

  test("limit: null should return all results", async () => {
    const [results, meta] = await prisma.user.paginate().withPages({
      limit: null,
      includePageCount: true,
    });

    const expectedResults = await prisma.user.findMany();

    expect(results).toStrictEqual(expectedResults);
    expect(meta).toStrictEqual({
      currentPage: 1,
      isFirstPage: true,
      isLastPage: true,
      previousPage: null,
      nextPage: null,
      pageCount: 1,
      totalCount: 20,
    } satisfies PageNumberPaginationMeta<true>);
  });

  test("regression: `page: undefined` should be the same as `page: 1`", async () => {
    function getResults(page?: number) {
      return prisma.user.paginate().withPages({
        limit: null,
        includePageCount: true,
        page,
      });
    }

    expect(
      // this would crash before as `page` is `undefined`
      await getResults(),
    ).toStrictEqual(await getResults(1));
  });
});
