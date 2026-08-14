import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { mpPayment } from "@/lib/mercadopago"
import type { TipoPago } from "@prisma/client"

function mapearTipoPago(paymentMethodId: string, paymentTypeId: string): TipoPago {
  if (paymentMethodId === "yape") return "YAPE"
  if (paymentMethodId === "plin") return "PLIN"
  if (paymentTypeId === "credit_card" || paymentTypeId === "debit_card") return "TARJETA"
  return "TRANSFERENCIA_BANCARIA"
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { type?: string; data?: { id?: string } }

    // MP envía distintos tipos de notificación — solo nos interesan los pagos
    if (body.type !== "payment" || !body.data?.id) {
      return NextResponse.json({ ok: true })
    }

    const paymentId = String(body.data.id)
    const payment = await mpPayment.get({ id: paymentId })

    const operacionId = (payment.external_reference ?? payment.metadata?.operacion_id) as string | undefined
    if (!operacionId) {
      return NextResponse.json({ ok: true })
    }

    const operacion = await prisma.operacion.findFirst({
      where: { id: operacionId, eliminadoEn: null },
    })

    if (!operacion) {
      return NextResponse.json({ ok: true })
    }

    const tipo = mapearTipoPago(
      String(payment.payment_method_id ?? ""),
      String(payment.payment_type_id ?? "")
    )

    if (payment.status === "approved") {
      await prisma.$transaction(async (tx) => {
        // Solo procesar si aún está en PAGO_PENDIENTE
        if (operacion.estado !== "PAGO_PENDIENTE") return

        await tx.pago.create({
          data: {
            operacionId,
            pagadorId: operacion.compradorId,
            tipo,
            estado: "RECIBIDO",
            montoCentimos: operacion.montoCompradorCentimos,
            referenciaExterna: paymentId,
            pasarelaId: operacion.mpPreferenceId ?? undefined,
            confirmadoEn: new Date(),
          },
        })

        await tx.operacion.update({
          where: { id: operacionId },
          data: { estado: "PAGO_RECIBIDO" },
        })

        await tx.auditoria.create({
          data: {
            entidad: "Operacion",
            entidadId: operacionId,
            accion: "PAGO_MP_APROBADO",
            estadoAnterior: "PAGO_PENDIENTE",
            estadoNuevo: "PAGO_RECIBIDO",
            actorId: operacion.compradorId,
          },
        })
      })
    } else if (payment.status === "rejected") {
      await prisma.auditoria.create({
        data: {
          entidad: "Operacion",
          entidadId: operacionId,
          accion: "PAGO_MP_RECHAZADO",
          actorId: operacion.compradorId,
        },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[MP Webhook] Error:", error)
    // Siempre devolver 200 — MP reintenta si recibe error
    return NextResponse.json({ ok: true })
  }
}
