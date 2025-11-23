import type {
  CursorPaginationMeta,
  CursorPaginationOptions,
  GetCursorFunction,
  PageNumberPaginationMeta,
  PageNumberPaginationOptions,
  ParseCursorFunction,
  PrismaModel,
  PrismaQuery,
} from './types'
import { Prisma } from '@prisma/client/extension'
import { paginateWithCursor } from './cursor'
import { paginateWithPages } from './page-number'

type Paginator<O extends PaginatorOptions> = <T, A>(
  this: T,
  args?: Prisma.Exact<
    A,
    Omit<Prisma.Args<T, 'findMany'>, 'cursor' | 'take' | 'skip'>
  >,
) => {
  withPages: O['pages'] extends { limit: number } // if global limit provided
    ? <
        TOptions extends Omit<P, 'limit'>,
        P extends PageNumberPaginationOptions,
      >(
        // make limit optional
        options?: TOptions & { limit?: P['limit'] },
      ) => Promise<
        [
          Prisma.Result<T, A, 'findMany'>,
          PageNumberPaginationMeta<
            // if includePageCount provided
            TOptions extends { includePageCount: boolean }
              ? TOptions['includePageCount'] // else if global includePageCount provided
              : O['pages'] extends { includePageCount: boolean }
                ? O['pages']['includePageCount'] // else
                : false
          >,
        ]
      >
    : <
        TOptions extends PageNumberPaginationOptions,
        P extends PageNumberPaginationOptions,
      >(
        options: TOptions & { limit: P['limit'] },
      ) => Promise<
        [
          Prisma.Result<T, A, 'findMany'>,
          PageNumberPaginationMeta<
            // if includePageCount provided
            TOptions extends { includePageCount: boolean }
              ? TOptions['includePageCount'] // else if global includePageCount provided
              : O['pages'] extends { includePageCount: boolean }
                ? O['pages']['includePageCount']
                : false
          >,
        ]
      >

  withCursor: O['cursor'] extends { limit: number } // if global limit provided
    ? <
        TOptions extends Omit<P, 'limit'>,
        P extends CursorPaginationOptions<
          Prisma.Result<T, A, 'findMany'>[number],
          NonNullable<Prisma.Args<T, 'findMany'>['cursor']>
        >,
      >(
        // make limit optional
        options?: TOptions & { limit?: P['limit'] },
      ) => Promise<[Prisma.Result<T, A, 'findMany'>, CursorPaginationMeta]>
    : <
        TOptions extends Omit<P, 'limit'>,
        P extends CursorPaginationOptions<
          Prisma.Result<T, A, 'findMany'>[number],
          NonNullable<Prisma.Args<T, 'findMany'>['cursor']>
        >,
      >(
        options: TOptions & { limit: P['limit'] },
      ) => Promise<[Prisma.Result<T, A, 'findMany'>, CursorPaginationMeta]>
}

interface PaginatorOptions {
  pages?: {
    limit?: number
    includePageCount?: boolean
  }
  cursor?: {
    limit?: number
    getCursor?: GetCursorFunction<any>
    parseCursor?: ParseCursorFunction<any>
  }
}

export function createPaginator<O extends PaginatorOptions>(globalOptions?: O): Paginator<O> {
  return function paginate(this, args) {
    return {
      withPages: async (options = {}) => {
        const {
          page = 1,
          limit,
          includePageCount = false,
        } = {
          ...globalOptions?.pages,
          ...(options as PageNumberPaginationOptions),
        } satisfies Omit<PageNumberPaginationOptions, 'limit'>

        if (
          typeof page !== 'number'
          || page < 1
          || page > Number.MAX_SAFE_INTEGER
        ) {
          throw new Error('Invalid page value')
        }

        if (limit !== null && typeof limit !== 'number') {
          throw new Error('Missing limit value')
        }
        if (limit !== null && (limit < 1 || limit > Number.MAX_SAFE_INTEGER)) {
          throw new Error('Invalid limit value')
        }

        const query = (args ?? {}) as PrismaQuery

        return paginateWithPages(this as PrismaModel, query, {
          limit,
          page,
          includePageCount,
        }) as any
      },

      withCursor: async (options = {}) => {
        const {
          limit,
          after,
          before,
          getCursor = ({ id }) => {
            if (typeof id !== 'number') {
              throw new TypeError('Unable to serialize cursor')
            }

            return id.toString()
          },
          parseCursor = (cursor) => {
            const id = Number.parseInt(cursor, 10)

            if (Number.isNaN(id)) {
              throw new TypeError('Unable to parse cursor')
            }

            return {
              id,
            }
          },
        } = {
          ...globalOptions?.cursor,
          ...(options as CursorPaginationOptions<unknown, unknown>),
        } satisfies Omit<
          CursorPaginationOptions<unknown, unknown>,
          'limit' | 'after' | 'before'
        >

        if (limit !== null && typeof limit !== 'number') {
          throw new Error('Missing limit value')
        }

        if (limit !== null && (limit < 1 || limit > Number.MAX_SAFE_INTEGER)) {
          throw new Error('Invalid limit value')
        }

        if (typeof after === 'string' && typeof before === 'string') {
          throw new TypeError(
            'Invalid cursor. Options after and before cannot be provided at the same time',
          )
        }

        const query = (args ?? {}) as PrismaQuery

        return paginateWithCursor(this as PrismaModel, query, {
          limit,
          after,
          before,
          getCursor,
          parseCursor,
        }) as any
      },
    }
  }
}

export const paginate = createPaginator()

export function extension<O extends PaginatorOptions>(options?: O) {
  const paginate = createPaginator(options)

  return Prisma.defineExtension({
    name: 'pagination',
    model: {
      $allModels: {
        paginate,
      },
    },
  })
}
