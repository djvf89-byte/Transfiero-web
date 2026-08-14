import { auth } from "@/lib/auth"
import { uploadImage } from "@/lib/cloudinary"
import { NextRequest, NextResponse } from "next/server"

const MIME_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"]
const TAMANIO_MAXIMO = 5 * 1024 * 1024 // 5MB

// Allowlist de tipos de upload. El cliente pasa "tipo", el servidor decide el folder real.
const FOLDERS: Record<string, string> = {
  publicaciones: "evidencias/publicaciones",
  portada: "portadas/eventos",
  dni: "evidencias/dni",
  disputas: "evidencias/disputas",
  pago: "evidencias/pagos",
  evidencia: "evidencias/transferencias",
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const tipoParam = (formData.get("tipo") as string) || "publicaciones"

  if (!(tipoParam in FOLDERS)) {
    return NextResponse.json({ error: "Tipo de upload no permitido" }, { status: 400 })
  }

  const folder = FOLDERS[tipoParam]

  if (!file) {
    return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 })
  }

  const mimeEvidencia = tipoParam === "evidencia" ? [...MIME_PERMITIDOS, "application/pdf"] : MIME_PERMITIDOS
  if (!mimeEvidencia.includes(file.type)) {
    return NextResponse.json(
      { error: "Solo se permiten imágenes JPG, PNG o WEBP" + (tipoParam === "evidencia" ? " o PDF" : "") },
      { status: 400 }
    )
  }

  if (file.size > TAMANIO_MAXIMO) {
    return NextResponse.json(
      { error: "La imagen no puede superar los 5MB" },
      { status: 400 }
    )
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const resultado = await uploadImage(buffer, folder)
  return NextResponse.json(resultado)
}
