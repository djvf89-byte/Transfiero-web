/**
 * Limpia el registro de la migración fallida 20260930000000_patch_fotos_seed
 * de _prisma_migrations. Se ejecuta antes de prisma migrate deploy.
 * Idempotente: si el registro no existe, simplemente continúa.
 */
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
if (!connectionString) {
  console.log("No DATABASE_URL — skipping migration cleanup")
  process.exit(0)
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as never) as unknown as PrismaClient

async function main() {
  try {
    const result = await prisma.$executeRaw`
      DELETE FROM "_prisma_migrations"
      WHERE migration_name = '20260930000000_patch_fotos_seed'
    `
    if (result > 0) {
      console.log(`✓ Limpiada migracion fallida: 20260930000000_patch_fotos_seed`)
    } else {
      console.log("✓ No habia migracion pendiente de limpiar")
    }
  } catch (e) {
    console.log("⚠ fix-migration: error ignorado ->", e instanceof Error ? e.message : e)
  }
}

main()
  .catch(() => {})
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
