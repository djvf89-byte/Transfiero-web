/**
 * Limpia el registro de la migracion fallida 20260930000000_patch_fotos_seed
 * de _prisma_migrations antes de prisma migrate deploy.
 * Idempotente. Usa pg directamente (sin tsx) para correr en Vercel build.
 */
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
if (!connectionString) {
  console.log('No DATABASE_URL — skipping migration cleanup')
  process.exit(0)
}

const pool = new Pool({ connectionString })

try {
  const result = await pool.query(
    `DELETE FROM "_prisma_migrations" WHERE migration_name = '20260930000000_patch_fotos_seed'`
  )
  if (result.rowCount > 0) {
    console.log('✓ Limpiada migracion fallida: 20260930000000_patch_fotos_seed')
  } else {
    console.log('✓ No habia migracion pendiente de limpiar')
  }
} catch (e) {
  console.log('⚠ fix-migration: error ignorado ->', e.message ?? e)
} finally {
  await pool.end()
}
