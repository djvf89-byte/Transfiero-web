/**
 * Migración de datos: ticketera String? → ticketeraEnum Ticketera?
 * Mapea valores de texto existentes al enum tipado.
 * Las publicaciones con valores inválidos quedan con ticketeraEnum = null.
 */
import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { PrismaClient } from "@prisma/client"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as never)

const MAPA: Record<string, "JOINNUS" | "TELETICKET" | "TICKETMASTER"> = {
  joinnus: "JOINNUS",
  teleticket: "TELETICKET",
  ticketmaster: "TICKETMASTER",
}

async function run() {
  const publicaciones = await prisma.publicacion.findMany({
    where: { ticketera: { not: null }, ticketeraEnum: null },
    select: { id: true, ticketera: true },
  })

  console.log(`Publicaciones a migrar: ${publicaciones.length}`)
  let migradas = 0
  let sin_mapeo = 0

  for (const pub of publicaciones) {
    const clave = pub.ticketera?.toLowerCase().trim() ?? ""
    const enumVal = MAPA[clave]

    if (enumVal) {
      await prisma.publicacion.update({
        where: { id: pub.id },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { ticketeraEnum: enumVal as any },
      })
      migradas++
    } else {
      console.log(`  Sin mapeo: "${pub.ticketera}" (id: ${pub.id})`)
      sin_mapeo++
    }
  }

  console.log(`✓ Migradas: ${migradas} | Sin mapeo (quedan null): ${sin_mapeo}`)
  await pool.end()
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
