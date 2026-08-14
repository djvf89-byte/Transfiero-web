import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { mpPreference } from "@/lib/mercadopago"

const BASE_URL = process.env.AUTH_URL ?? "http://localhost:3000"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { operacionId } = await req.json() as { operacionId: string }
    if (!operacionId) {
      return NextResponse.json({ error: "operacionId requerido" }, { status: 400 })
    }

    const operacion = await prisma.operacion.findFirst({
      where: { id: operacionId, compradorId: session.user.id, estado: "PAGO_PENDIENTE", eliminadoEn: null },
      include: { publicacion: { select: { nombreEvento: true } } },
    })

    if (!operacion) {
      return NextResponse.json({ error: "Operación no encontrada" }, { status: 404 })
    }

    const monto = operacion.montoCompradorCentimos / 100

    const preference = await mpPreference.create({
      body: {
        items: [
          {
            id: operacionId,
            title: `Entrada: ${operacion.publicacion.nombreEvento}`,
            quantity: 1,
            unit_price: monto,
            currency_id: "PEN",
          },
        ],
        payer: { email: session.user.email ?? undefined },
        back_urls: {
          success: `${BASE_URL}/pagos/exito`,
          failure: `${BASE_URL}/pagos/error`,
          pending: `${BASE_URL}/pagos/pendiente`,
        },
        auto_return: "approved",
        notification_url: `${BASE_URL}/api/pagos/webhook`,
        metadata: { operacion_id: operacionId },
        statement_descriptor: "TRANSFIERO",
        external_reference: operacionId,
      },
    })

    // Guardar preference ID en la operacion para lookup desde webhook
    await prisma.operacion.update({
      where: { id: operacionId },
      data: { mpPreferenceId: preference.id },
    })

    return NextResponse.json({ initPoint: preference.init_point, preferenceId: preference.id })
  } catch (error) {
    console.error("[MP] Error creando preferencia:", error)
    return NextResponse.json({ error: "Error al crear preferencia de pago" }, { status: 500 })
  }
}
