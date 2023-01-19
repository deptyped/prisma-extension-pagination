import { CursorPaginationMeta } from "../src";

import { prisma } from "./helpers/prisma";
import { USERS_PER_PAGE } from "./helpers/constants";

describe("$paginate with cursor", () => {
  test("load first page", async () => {
    const limit = USERS_PER_PAGE;
    const [results, meta] = await prisma.user.paginate().withCursor({
      limit,
    });

    const expectedResults = await prisma.user.findMany({
      take: limit,
    });

    expect(results).toStrictEqual(expectedResults);

    expect(meta).toStrictEqual({
      hasPreviousPage: false,
      hasNextPage: true,
      startCursor: expectedResults[0].id.toString(),
      endCursor: expectedResults[expectedResults.length - 1].id.toString(),
    } satisfies CursorPaginationMeta);
  });

  test("load next page", async () => {
    const limit = USERS_PER_PAGE;

    const { id: cursor } = await prisma.user.findFirstOrThrow({
      skip: limit - 1,
    });

    const [results, meta] = await prisma.user.paginate().withCursor({
      limit,
      after: cursor.toString(),
    });

    const expectedResults = await prisma.user.findMany({
      skip: limit,
      take: limit,
    });

    expect(results).toStrictEqual(expectedResults);

    expect(meta).toStrictEqual({
      hasPreviousPage: true,
      hasNextPage: true,
      startCursor: expectedResults[0].id.toString(),
      endCursor: expectedResults[expectedResults.length - 1].id.toString(),
    } satisfies CursorPaginationMeta);
  });

  test("load previous page", async () => {
    const limit = USERS_PER_PAGE;

    const { id: cursor } = await prisma.user.findFirstOrThrow({
      skip: limit * 2,
    });

    const [results, meta] = await prisma.user.paginate().withCursor({
      limit,
      before: cursor.toString(),
    });

    const expectedResults = await prisma.user.findMany({
      skip: limit,
      take: limit,
    });

    expect(results).toStrictEqual(expectedResults);

    expect(meta).toStrictEqual({
      hasPreviousPage: true,
      hasNextPage: true,
      startCursor: expectedResults[0].id.toString(),
      endCursor: expectedResults[expectedResults.length - 1].id.toString(),
    } satisfies CursorPaginationMeta);
  });

  test("load last page", async () => {
    const limit = USERS_PER_PAGE;

    const { id: cursor } = await prisma.user.findFirstOrThrow({
      skip: 1,
      take: -1,
    });

    const [results, meta] = await prisma.user.paginate().withCursor({
      limit,
      after: cursor.toString(),
    });

    const expectedResults = await prisma.user.findMany({
      take: -1,
    });

    expect(results).toStrictEqual(expectedResults);

    expect(meta).toStrictEqual({
      hasPreviousPage: true,
      hasNextPage: false,
      startCursor: expectedResults[0].id.toString(),
      endCursor: expectedResults[expectedResults.length - 1].id.toString(),
    } satisfies CursorPaginationMeta);
  });

  test("load next to last page", async () => {
    const limit = USERS_PER_PAGE;

    const { id: cursor } = await prisma.user.findFirstOrThrow({
      take: -1,
    });

    const [results, meta] = await prisma.user.paginate().withCursor({
      limit,
      after: cursor.toString(),
    });

    expect(results).toStrictEqual([]);

    expect(meta).toStrictEqual({
      hasPreviousPage: true,
      hasNextPage: false,
      startCursor: null,
      endCursor: null,
    } satisfies CursorPaginationMeta);
  });

  test("custom cursor", async () => {
    const limit = USERS_PER_PAGE;
    const getCursor = (postId: number, userId: number) =>
      [postId, userId].join(":");

    const { postId, userId } = await prisma.postOnUser.findFirstOrThrow({
      select: {
        postId: true,
        userId: true,
      },
      skip: 5,
    });

    const [results, meta] = await prisma.postOnUser
      .paginate({
        select: {
          postId: true,
          userId: true,
        },
      })
      .withCursor({
        limit,
        after: getCursor(postId, userId),
        getCursor({ postId, userId }) {
          return getCursor(postId, userId);
        },
        parseCursor(cursor) {
          const [postId, userId] = cursor.split(":");

          return {
            userId_postId: {
              postId: parseInt(postId),
              userId: parseInt(userId),
            },
          };
        },
      });

    const expectedResults = await prisma.postOnUser.findMany({
      select: {
        postId: true,
        userId: true,
      },
      skip: 6,
      take: limit,
    });

    expect(results).toStrictEqual(expectedResults);

    expect(meta).toStrictEqual({
      hasPreviousPage: true,
      hasNextPage: true,
      startCursor: getCursor(
        expectedResults[0].postId,
        expectedResults[0].userId
      ),
      endCursor: getCursor(
        expectedResults[expectedResults.length - 1].postId,
        expectedResults[expectedResults.length - 1].userId
      ),
    } satisfies CursorPaginationMeta);
  });

  test("throw error if options are invalid", async () => {
    await expect(
      prisma.user.paginate().withCursor({
        limit: 0,
      })
    ).rejects.toThrow(Error);

    await expect(
      prisma.user.paginate().withCursor({
        limit: 1,
        after: "1",
        before: "1",
      })
    ).rejects.toThrow(Error);

    await expect(
      prisma.user.paginate().withCursor({
        limit: 1,
        after: "invalid",
      })
    ).rejects.toThrow(Error);

    await expect(
      prisma.postOnUser.paginate().withCursor({
        limit: 1,
      })
    ).rejects.toThrow("Unable to serialize cursor");

    await expect(
      // @ts-expect-error to test
      prisma.user.paginate().withCursor()
    ).rejects.toThrow(Error);
  });
});
