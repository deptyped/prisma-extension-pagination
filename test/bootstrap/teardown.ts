import { prisma } from "../helpers/prisma";

const teardown = async () => {
  await prisma.user.deleteMany();
  await prisma.post.deleteMany();

  await prisma.$disconnect();
};

export default teardown;
