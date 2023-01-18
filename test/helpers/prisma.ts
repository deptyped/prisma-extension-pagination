import { PrismaClient } from "@prisma/client";

import pagination from "../../src";

export const prisma = new PrismaClient().$extends(pagination);
