import { prisma } from "@/lib/prisma"
import { crearNotificacion } from "@/services/notificacion.service"
import { enviarEmail, htmlAviso24h, htmlLiberacionAutomatica } from "@/lib/email"

const HORAS_PLAZO = 24

export function calcularFechaLimite(desde: Date): Date {
  return new Date(desde.getTime() + HORAS_PLAZO * 60 * 60 * 1000)
}

// ─── Enviar aviso de 24h si corresponde ──────────────────────────────────────

async function enviarAviso24hSiCorresponde(operacionId: string): Promise<void> {
  const op = await prisma.operacion.findFirst({
    where: {
      id: operacionId,
      estado: "PENDIENTE_CONFIRMACION_COMPRADOR",
      avisoVencimientoEnviadoEn: null,
      fechaLimiteConfirmacion: { not: null },
    },
    select: {
      id: true,
      fechaLimiteConfirmacion: true,
      comprador: { select: { id: true, email: true, nombre: true } },
      publicacion: { select: { nombreEvento: true } },
    },
  })

  if (!op || !op.fechaLimiteConfirmacion) return

  const limite = op.fechaLimiteConfirmacion
  const umbral = new Date(limite.getTime() - 4 * 60 * 60 * 1000) // 4h antes del límite

  if (new Date() < umbral) return // todavía no es momento de avisar

  await prisma.operacion.update({
    where: { id: operacionId },
    data: { avisoVencimientoEnviadoEn: new Date() },
  })

  await crearNotificacion({
    usuarioId: op.comprador.id,
    titulo: "⏰ Quedan pocas horas para confirmar tu entrada",
    cuerpo: `Tu plazo para confirmar ${op.publicacion.nombreEvento} vence en menos de 4 horas. Actúa antes de perder tu protección.`,
    url: `/mis-compras/${operacionId}`,
  })

  await enviarEmail(
    op.comprador.email,
    "Transfiero — Quedan pocas horas para confirmar tu entrada",
    htmlAviso24h(op.comprador.nombre, op.publicacion.nombreEvento, limite, `/mis-compras/${operacionId}`)
  )
}

// ─── Procesar una liberación vencida ─────────────────────────────────────────

async function procesarLiberacionUnitaria(operacionId: string): Promise<void> {
  const op = await prisma.operacion.findFirst({
    where: {
      id: operacionId,
      estado: "PENDIENTE_CONFIRMACION_COMPRADOR",
      fechaLimiteConfirmacion: { lte: new Date() },
      eliminadoEn: null,
    },
    select: {
      id: true, publicacionId: true, montoVendedorCentimos: true,
      comprador: { select: { id: true, email: true, nombre: true } },
      vendedor: { select: { id: true, email: true, nombre: true } },
      publicacion: { select: { nombreEvento: true } },
    },
  })

  if (!op) return

  await prisma.$transaction(async (tx) => {
    await tx.operacion.update({
      where: { id: op.id },
      data: {
        estado: "FONDOS_LIBERADOS",
        fechaLiberacionAutomatica: new Date(),
        motivoLiberacion: "LIBERACION_AUTOMATICA",
      },
    })
    await tx.publicacion.update({
      where: { id: op.publicacionId },
      data: { estado: "COMPLETADA" },
    })
    await tx.auditoria.create({
      data: {
        entidad: "Operacion", entidadId: op.id,
        accion: "LIBERACION_AUTOMATICA_PLAZO",
        estadoAnterior: "PENDIENTE_CONFIRMACION_COMPRADOR", estadoNuevo: "FONDOS_LIBERADOS",
        descripcion: "Plazo de 24h vencido sin confirmación del comprador",
      },
    })
  })

  await Promise.all([
    crearNotificacion({
      usuarioId: op.comprador.id,
      titulo: "Plazo de confirmación vencido",
      cuerpo: `No confirmaste tu entrada de ${op.publicacion.nombreEvento} a tiempo. Los fondos fueron liberados al vendedor.`,
      url: `/mis-compras/${operacionId}`,
    }),
    crearNotificacion({
      usuarioId: op.vendedor.id,
      titulo: "✓ Fondos liberados automáticamente",
      cuerpo: `El plazo del comprador venció. Los fondos de ${op.publicacion.nombreEvento} fueron liberados a tu favor.`,
      url: `/mis-ventas/${operacionId}`,
    }),
    enviarEmail(
      op.comprador.email,
      "Transfiero — Plazo de confirmación vencido",
      htmlLiberacionAutomatica(op.comprador.nombre, op.publicacion.nombreEvento, false)
    ),
    enviarEmail(
      op.vendedor.email,
      "Transfiero — ✓ Fondos liberados",
      htmlLiberacionAutomatica(op.vendedor.nombre, op.publicacion.nombreEvento, true, op.montoVendedorCentimos)
    ),
  ])
}

// ─── Procesamiento masivo (para Vercel Cron) ─────────────────────────────────

export async function procesarLiberacionesVencidas(): Promise<number> {
  const vencidas = await prisma.operacion.findMany({
    where: {
      estado: "PENDIENTE_CONFIRMACION_COMPRADOR",
      fechaLimiteConfirmacion: { lte: new Date() },
      eliminadoEn: null,
    },
    select: { id: true },
  })

  for (const op of vencidas) {
    await procesarLiberacionUnitaria(op.id)
  }

  return vencidas.length
}

// ─── Lazy check (llamar desde endpoints sensibles) ────────────────────────────
// Revisa UNA operación específica o todas las vencidas si no se pasa id.

export async function checkLiberacionLazy(operacionId?: string): Promise<void> {
  if (operacionId) {
    await enviarAviso24hSiCorresponde(operacionId)
    await procesarLiberacionUnitaria(operacionId)
  } else {
    await procesarLiberacionesVencidas()
  }
}
