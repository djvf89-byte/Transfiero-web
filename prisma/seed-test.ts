import { readFileSync } from "fs"
import { resolve } from "path"

// Cargar .env.local igual que prisma.config.ts (Next.js no lo carga para scripts tsx)
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

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as never)

const USUARIOS = [
  {
    email: "admin@test.com",
    password: "Admin123456",
    nombre: "Admin Test",
    rolPrincipal: "ADMINISTRADOR" as const,
    estadoVendedor: "NO_SOLICITADO" as const,
    estadoCuenta: "ACTIVO" as const,
  },
  {
    email: "vendedor@test.com",
    password: "Vendedor123456",
    nombre: "Vendedor Test",
    rolPrincipal: "VENDEDOR" as const,
    estadoVendedor: "APROBADO" as const,
    estadoCuenta: "ACTIVO" as const,
  },
  {
    email: "comprador@test.com",
    password: "Comprador123456",
    nombre: "Comprador Test",
    rolPrincipal: "COMPRADOR" as const,
    estadoVendedor: "NO_SOLICITADO" as const,
    estadoCuenta: "ACTIVO" as const,
  },
]

async function main() {
  console.log("Creando usuarios de prueba...\n")

  const creados: Record<string, string> = {}

  for (const u of USUARIOS) {
    const existe = await prisma.usuario.findUnique({ where: { email: u.email } })
    if (existe) {
      console.log(`  ⏭  Ya existe: ${u.email}`)
      creados[u.email] = existe.id
      continue
    }

    const passwordHash = await bcrypt.hash(u.password, 12)
    const usuario = await prisma.usuario.create({
      data: {
        email: u.email,
        nombre: u.nombre,
        passwordHash,
        rolPrincipal: u.rolPrincipal,
        estadoVendedor: u.estadoVendedor,
        estadoCuenta: u.estadoCuenta,
      },
    })
    creados[u.email] = usuario.id
    console.log(`  ✓  Creado: ${u.email} (${u.rolPrincipal})`)
  }

  // Publicación de prueba — aprobada y disponible en el marketplace
  const vendedorId = creados["vendedor@test.com"]
  const adminId = creados["admin@test.com"]

  const pubExiste = await prisma.publicacion.findFirst({
    where: { vendedorId, nombreEvento: "Coldplay — Music of the Spheres Tour" },
  })

  if (pubExiste) {
    console.log("\n  ⏭  Publicación de prueba ya existe")
  } else {
    await prisma.publicacion.create({
      data: {
        vendedorId,
        aprobadoPorId: adminId,
        aprobadoEn: new Date(),
        nombreEvento: "Coldplay — Music of the Spheres Tour",
        fechaEvento: new Date("2026-09-20T20:00:00"),
        lugarEvento: "Estadio Nacional, Lima",
        categoria: "CONCIERTO",
        descripcion: "Entrada para el concierto de Coldplay. Zona Field B, fila 12, asiento 34.",
        precioOriginalCentimos: 25000,  // S/ 250.00
        precioVentaCentimos: 27000,     // S/ 270.00 (dentro del límite 10%)
        zona: "Field B",
        asiento: "Fila 12 / Asiento 34",
        ticketera: "Teleticket",
        estado: "DISPONIBLE",
      },
    })
    console.log("\n  ✓  Publicación creada: Coldplay — Music of the Spheres Tour")
    console.log("     Precio original: S/ 250.00 | Precio venta: S/ 270.00")
    console.log("     Estado: DISPONIBLE (visible en marketplace)")
  }

  console.log("\n─────────────────────────────────────────────────")
  console.log("Usuarios listos:")
  console.log("  ADMINISTRADOR  →  admin@test.com       /  Admin123456")
  console.log("  VENDEDOR       →  vendedor@test.com    /  Vendedor123456")
  console.log("  COMPRADOR      →  comprador@test.com   /  Comprador123456")
  console.log("─────────────────────────────────────────────────\n")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
