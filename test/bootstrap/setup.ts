import { USERS_COUNT } from "../helpers/constants";
import { prisma } from "../helpers/prisma";

const setup = async () => {
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
};

export default setup;
