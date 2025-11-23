import { USERS_COUNT } from "../helpers/constants";
import { prisma } from "../helpers/prisma";

export default async function () {
  await prisma.$connect();

  await Promise.all(
    [...Array(USERS_COUNT)].map(() =>
      prisma.user.create({
        select: {
          id: true,
        },
        data: {
          posts: {
            create: [
              {
                post: {
                  create: {},
                },
              },
              {
                post: {
                  create: {
                    title: "Untitled",
                  },
                },
              },
            ],
          },
        },
      }),
    ),
  );

  return async () => {
    await prisma.user.deleteMany();
    await prisma.post.deleteMany();

    await prisma.$disconnect();
  };
}
