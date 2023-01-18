import { Prisma } from "@prisma/client";

export const extension = Prisma.defineExtension({
  client: {
    $deepThought() {
      return 42;
    },
  },
});
