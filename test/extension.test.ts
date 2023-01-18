import { PrismaClient } from "@prisma/client";
import extension from "../src";

const prisma = new PrismaClient().$extends(extension);

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

test("$deepThought client method", async () => {
  expect(prisma.$deepThought()).toBe(42);
});
