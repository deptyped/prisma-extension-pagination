# Prisma Pagination Extension

## Introduction

Prisma Client extension for pagination.

## Features

- [Page number pagination](#page-number-pagination).
- [Cursor-based pagination](#cursor-based-pagination).
- Fully tested.

## Installation

```bash
npm i prisma-extension-pagination
```

## Usage

### Install extension to all models

```ts
import { PrismaClient } from "@prisma/client";
import pagination from "prisma-extension-pagination";

const prisma = new PrismaClient().$extends(pagination);
```

### Install extension on certain model

```ts
import { PrismaClient } from "@prisma/client";
import { paginate } from "prisma-extension-pagination";

const prisma = new PrismaClient().$extends({
  model: {
    user: {
      paginate,
    }
  }
});
```

### Page number pagination

Page number pagination uses `limit` to select a limited range and `page` to load a specific page of results.

#### Load first page

```ts
const [users, meta] = prisma.user
  .paginate({
    select: {
      id: true,
    }
  })
  .withPages({
    limit: 10,
  });

// meta contains the following
{
  currentPage: 1,
  isFirstPage: true,
  isLastPage: false,
  previousPage: null,
  nextPage: 2,
}
```

#### Load specific page

```ts
const [users, meta] = prisma.user
  .paginate()
  .withPages({
    limit: 10,
    page: 2,
  });

// meta contains the following
{
  currentPage: 2,
  isFirstPage: false,
  isLastPage: false,
  previousPage: 1,
  nextPage: 3,
}
```

#### Calculate page count

```ts
const [users, meta] = prisma.user
  .paginate()
  .withPages({
    limit: 10,
    page: 2,
    includePageCount: true,
  });

// meta contains the following
{
  currentPage: 2,
  isFirstPage: false,
  isLastPage: false,
  previousPage: 1,
  nextPage: 3,
  pageCount: 10, // the number of pages is calculated
  totalCount: 100, // the total number of results is calculated
}
```

### Cursor-based pagination

Cursor-based pagination uses `limit` to select a limited range
and `before` or `after` to return a set of results before or after a given cursor.

#### Load first records

```ts
const [users, meta] = prisma.user
  .paginate({
    select: {
      id: true,
    }
  })
  .withCursor({
    limit: 10,
  });

// meta contains the following
{
  hasPreviousPage: false,
  hasNextPage: true,
  startCursor: "1",
  endCursor: "10"
}
```

#### Load next page

```ts
const [users, meta] = prisma.user
  .paginate()
  .withCursor({
    limit: 10,
    after: "10"
  });

// meta contains the following
{
  hasPreviousPage: true,
  hasNextPage: true,
  startCursor: "11",
  endCursor: "20"
}
```

#### Load previous page

```ts
const [users, meta] = prisma.user
  .paginate()
  .withCursor({
    limit: 10,
    before: "11"
  });

// meta contains the following
{
  hasPreviousPage: false,
  hasNextPage: true,
  startCursor: "1",
  endCursor: "10"
}
```

#### Custom cursor

```ts
const getCustomCursor = (postId: number, userId: number) =>
  [postId, userId].join(":");


const [results, meta] = await prisma.postOnUser
  .paginate({
    select: {
      postId: true,
      userId: true,
    },
  })
  .withCursor({
    limit: 10,
    after: getCustomCursor(1, 1), // "1:1"

    // custom cursor serialization
    getCursor({ postId, userId }) {
      return getCustomCursor(postId, userId)
    },

    // custom cursor deserialization
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

// meta contains the following
{
  hasPreviousPage: false,
  hasNextPage: true,
  startCursor: "1:2",
  endCursor: "1:11"
}
```

## License

This project is licensed under the terms of the MIT license.
