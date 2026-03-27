import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from ".prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  ),
});

async function main() {
  const email = process.env.BARBER_EMAIL ?? "barber@salon.com";
  const password = process.env.BARBER_PASSWORD ?? "admin123";
  const timezone = process.env.BARBER_TIMEZONE ?? "Africa/Algiers";

  const existing = await prisma.barber.findUnique({ where: { email } });
  if (existing) {
    console.log("Barber already exists:", email);
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  await prisma.barber.create({
    data: { email, password: hash, timezone },
  });
  console.log("Created barber:", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

