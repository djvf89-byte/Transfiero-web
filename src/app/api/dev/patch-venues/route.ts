import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Endpoint temporal para asignar venueSlug a publicaciones de demo — ELIMINAR tras uso
const SEED_SECRET = process.env.SEED_SECRET ?? "transfiero-seed-2026"

const VENUE_PATCHES = [
  { nombreEvento: "Bad Bunny — Most Wanted Tour",                    venueSlug: "estadio-nacional",   zona: "Tribuna Norte" },
  { nombreEvento: "Coldplay — Music of the Spheres World Tour",      venueSlug: "estadio-nacional",   zona: "Campo / Piso" },
  { nombreEvento: "Alianza Lima vs. Universitario — Clásico del Fútbol Peruano", venueSlug: "estadio-villanueva", zona: "Tribuna Sur" },
  { nombreEvento: "Selección Peruana vs. Argentina — Eliminatorias 2026", venueSlug: "estadio-nacional", zona: "Oriente" },
  { nombreEvento: "Vivo x el Rock 2026",                             venueSlug: "arena-1",            zona: "General" },
  { nombreEvento: "Reggaeton Lima Festival",                         venueSlug: "costa-21",           zona: "VIP Sin Asientos" },
  { nombreEvento: "Hamilton — El Musical (Gira Latinoamérica)",      venueSlug: "gran-teatro-nacional", zona: "Platea Central" },
]

export async function POST(req: NextRequest) {
  const { secret } = await req.json()
  if (secret !== SEED_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const resultados: { evento: string; ok: boolean }[] = []

  for (const patch of VENUE_PATCHES) {
    const updated = await prisma.publicacion.updateMany({
      where: { nombreEvento: patch.nombreEvento },
      data: { venueSlug: patch.venueSlug, zona: patch.zona },
    })
    resultados.push({ evento: patch.nombreEvento, ok: updated.count > 0 })
  }

  return NextResponse.json({ ok: true, resultados })
}
