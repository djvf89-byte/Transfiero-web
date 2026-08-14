import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function crearPrismaClient(): PrismaClient {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  // En Prisma 7 el adapter se pasa al constructor para conexiones en runtime.
  // Las migraciones usan datasource.url definido en prisma.config.ts.
  return new PrismaClient({ adapter } as never)
}

export const prisma = globalForPrisma.prisma ?? crearPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
