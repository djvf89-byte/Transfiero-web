import { NextResponse } from "next/server"
import { procesarLiberacionesVencidas } from "@/lib/liberacion-automatica"

// GET /api/cron/liberar — llamado por Vercel Cron o manualmente por admin
// Protegido por CRON_SECRET para evitar ejecución no autorizada
export async function GET(req: Request) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "")

  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const procesadas = await procesarLiberacionesVencidas()
    return NextResponse.json({ ok: true, procesadas })
  } catch (error) {
    console.error("[cron/liberar]", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
