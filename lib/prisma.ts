import { PrismaClient } from ".prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(
      new Pool({
        connectionString: process.env.DATABASE_URL,
      }),
    ),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

