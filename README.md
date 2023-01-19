# Prisma Pagination Extension

## Introduction

Prisma Client extension for pagination.

## Features

- [Page number pagination](#page-number-pagination).

## Installation

```bash
npm i prisma-extension-pagination
```

## Usage

### Install extension

```ts
import { PrismaClient } from "@prisma/client";
import pagination from "prisma-extension-pagination";

const prisma = new PrismaClient().$extends(pagination);
```

### Page number pagination

Page number pagination uses `limit` to select a limited range and `page` to load a specific page of results.

#### Load first page

```ts
const [users, meta] = prisma.user.paginate().withPages({
  limit: 10
});

// meta contains the following
{
  currentPage: 1,
  isFirstPage: true,
  isLastPage: false,
  previousPage: null,
  nextPage: 2,
  pageCount: null,
}
```

#### Load specific page

```ts
const [users, meta] = prisma.user.paginate().withPages({
  limit: 10,
  page: 2
});

// meta contains the following
{
  currentPage: 2,
  isFirstPage: false,
  isLastPage: false,
  previousPage: 1,
  nextPage: 3,
  pageCount: null,
}
```

#### Calculate page count

```ts
const [users, meta] = prisma.user.paginate().withPages({
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
}
```

## License

This project is licensed under the terms of the MIT license.
