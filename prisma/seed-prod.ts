import { readFileSync } from "fs"
import { resolve } from "path"

try {
  const envFile = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8")
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIndex = trimmed.indexOf("=")
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "")
    if (!process.env[key]) process.env[key] = value
  }
} catch { /* en producción las vars vienen del sistema */ }

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const ADMIN_NOMBRE = process.env.ADMIN_NOMBRE ?? "Administrador"

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("ERROR: Se requieren ADMIN_EMAIL y ADMIN_PASSWORD en las variables de entorno.")
  process.exit(1)
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as never)

async function main() {
  const existe = await prisma.usuario.findUnique({ where: { email: ADMIN_EMAIL! } })

  if (existe) {
    console.log(`El usuario administrador ya existe: ${ADMIN_EMAIL}`)
    return
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD!, 12)

  await prisma.usuario.create({
    data: {
      email: ADMIN_EMAIL!,
      nombre: ADMIN_NOMBRE,
      passwordHash,
      rolPrincipal: "ADMINISTRADOR",
      estadoCuenta: "ACTIVO",
    },
  })

  console.log(`Administrador creado: ${ADMIN_EMAIL}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
