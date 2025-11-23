import { PrismaClient } from "../../prisma/generated/client.js";
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

import pagination from "../../src/index.js";

const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/test.db" })

export const prismaRaw = new PrismaClient({ adapter });
export const prisma = new PrismaClient({ adapter }).$extends(pagination());
