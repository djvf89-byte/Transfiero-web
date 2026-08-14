import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { obtenerSolicitudAdmin } from "@/services/solicitud.service"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.rolPrincipal !== "ADMINISTRADOR") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { id } = await params
  const solicitud = await obtenerSolicitudAdmin(id)
  if (!solicitud) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 })
  }

  return NextResponse.json(solicitud)
}
