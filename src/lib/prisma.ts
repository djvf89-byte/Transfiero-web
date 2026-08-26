import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function crearPrismaClient(): PrismaClient {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  // Prisma 7 + PgAdapter: doble cast necesario — `as never` en opciones evita
  // el error del constructor; `as unknown as PrismaClient` restaura los tipos de retorno.
  return new PrismaClient({ adapter } as never) as unknown as PrismaClient
}

export const prisma = globalForPrisma.prisma ?? crearPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
