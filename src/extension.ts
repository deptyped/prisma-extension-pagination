import { Prisma } from "@prisma/client";
import {
  PageNumberPaginationOptions,
  PageNumberPaginationMeta,
  CursorPaginationOptions,
  CursorPaginationMeta,
  PrismaModel,
  PrismaQuery,
} from "./types";
import { paginateWithPages } from "./page-number";
import { paginateWithCursor } from "./cursor";

export function paginate<T, A, TResult extends Prisma.Result<T, A, "findMany">>(
  this: T,
  args?: Prisma.Exact<
    A,
    Omit<Prisma.Args<T, "findMany">, "cursor" | "take" | "skip">
  >
) {
  return {
    withPages: async <TOptions extends PageNumberPaginationOptions>(
      options: TOptions
    ): Promise<
      [TResult, PageNumberPaginationMeta<TOptions["includePageCount"]>]
    > => {
      const { page, limit, includePageCount } = {
        page: 1,
        includePageCount: false,
        ...options,
      } satisfies PageNumberPaginationOptions;

      if (
        typeof page !== "number" ||
        page < 1 ||
        page > Number.MAX_SAFE_INTEGER
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

      return paginateWithPages(this as PrismaModel, query, {
        limit,
        page,
        includePageCount,
      }) as Promise<
        [TResult, PageNumberPaginationMeta<TOptions["includePageCount"]>]
      >;
    },

    withCursor: async (
      options: CursorPaginationOptions<
        TResult[number],
        NonNullable<Prisma.Args<T, "findMany">["cursor"]>
      >
    ): Promise<[TResult, CursorPaginationMeta]> => {
      const { limit, after, before, getCursor, parseCursor } = {
        getCursor({ id }) {
          if (typeof id !== "number") {
            throw new Error("Unable to serialize cursor");
          }

          return id.toString();
        },
        // @ts-expect-error unable to match the actual fields of the model
        parseCursor(cursor) {
          const id = parseInt(cursor, 10);

          if (Number.isNaN(id)) {
            throw new Error("Unable to parse cursor");
          }

          return {
            id,
          } as unknown;
        },
        ...options,
      } satisfies typeof options;

      if (
        typeof limit !== "number" ||
        limit < 1 ||
        limit > Number.MAX_SAFE_INTEGER
      ) {
        throw new Error("Invalid limit  value");
      }

      if (typeof after === "string" && typeof before === "string") {
        throw new Error(
          "Invalid cursor. Options after and before cannot be provided at the same time"
        );
      }

      const query = (args ?? {}) as PrismaQuery;

      return paginateWithCursor(this as PrismaModel, query, {
        limit,
        after,
        before,
        getCursor,
        parseCursor,
      }) as Promise<[TResult, CursorPaginationMeta]>;
    },
  };
}

export const extension = Prisma.defineExtension({
  name: "pagination",
  model: {
    $allModels: {
      paginate,
    },
  },
});
