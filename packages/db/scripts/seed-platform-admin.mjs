import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const EMAIL = "superadmin@vetan.app";
const PASSWORD = "Demo@12345";

const prisma = new PrismaClient();

try {
  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  await prisma.platformAdmin.upsert({
    where: { email: EMAIL },
    create: {
      email: EMAIL,
      name: "Vetan Platform Admin",
      passwordHash,
      status: "ACTIVE",
    },
    update: { passwordHash, status: "ACTIVE" },
  });
  console.log("Platform admin ready:", EMAIL, "password:", PASSWORD);
} finally {
  await prisma.$disconnect();
}
