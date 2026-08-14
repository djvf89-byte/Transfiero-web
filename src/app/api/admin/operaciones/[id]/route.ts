import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { obtenerOperacionAdmin } from "@/services/operacion.service"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.rolPrincipal !== "ADMINISTRADOR") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { id } = await params
  const operacion = await obtenerOperacionAdmin(id)
  if (!operacion) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  return NextResponse.json(operacion)
}
