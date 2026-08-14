"use server"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import {
  crearReserva, aceptarReserva, rechazarReserva,
  cancelarReserva, subirComprobante, subirEvidenciaTransferencia,
  confirmarRecepcion, confirmarPago, notificarVendedor, marcarTransferida,
  liberarFondos, cancelarOperacionAdmin, registrarCuentaDestino,
} from "@/services/operacion.service"
import { validarCuentaDestino } from "@/lib/validators/cuenta-destino"
import { crearNotificacion, notificarAdmins } from "@/services/notificacion.service"
import { enviarEmail, htmlPlazoConfirmacion, htmlVendedorNotificado } from "@/lib/email"
import { prisma } from "@/lib/prisma"

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function requireAuth() {
  const session = await auth()
  if (!session) redirect("/auth/login")
  return session.user
}

async function requireVendedorAprobado() {
  const session = await auth()
  if (!session) redirect("/auth/login")
  if (
    session.user.rolPrincipal !== "VENDEDOR" ||
    session.user.estadoVendedor !== "APROBADO"
  ) {
    redirect("/403")
  }
  return session.user
}

// ─── Comprador ────────────────────────────────────────────────────────────────

export async function crearReservaAction(publicacionId: string) {
  const usuario = await requireAuth()

  try {
    const operacion = await crearReserva(publicacionId, usuario.id)

    await crearNotificacion({
      usuarioId: operacion.vendedorId,
      titulo: "Nueva reserva recibida",
      cuerpo: `Tienes 15 minutos para aceptar o rechazar la reserva.`,
      url: `/mis-ventas/${operacion.id}`,
    })

    revalidatePath(`/entradas/${publicacionId}`)
    revalidatePath("/mis-compras")
    return { ok: true, operacionId: operacion.id }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al crear la reserva" }
  }
}

// ─── Vendedor ─────────────────────────────────────────────────────────────────

export async function aceptarReservaAction(operacionId: string) {
  const usuario = await requireVendedorAprobado()

  try {
    const compradorId = await aceptarReserva(operacionId, usuario.id)

    const operacion = await prisma.operacion.findUnique({
      where: { id: operacionId },
      select: { publicacionId: true, publicacion: { select: { nombreEvento: true } } },
    })

    await crearNotificacion({
      usuarioId: compradorId,
      titulo: "¡El vendedor aceptó tu reserva!",
      cuerpo: `Procede a realizar el pago para confirmar tu entrada a ${operacion?.publicacion?.nombreEvento ?? "el evento"}.`,
      url: `/mis-compras/${operacionId}`,
    })

    revalidatePath(`/mis-ventas/${operacionId}`)
    revalidatePath("/mis-ventas")
    return { ok: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al aceptar la reserva" }
  }
}

export async function rechazarReservaAction(operacionId: string) {
  const usuario = await requireVendedorAprobado()

  try {
    const compradorId = await rechazarReserva(operacionId, usuario.id)

    const operacion = await prisma.operacion.findUnique({
      where: { id: operacionId },
      select: { publicacion: { select: { nombreEvento: true } } },
    })

    await crearNotificacion({
      usuarioId: compradorId,
      titulo: "El vendedor rechazó tu reserva",
      cuerpo: `La entrada de ${operacion?.publicacion?.nombreEvento ?? "el evento"} volvió a estar disponible.`,
      url: `/mis-compras/${operacionId}`,
    })

    revalidatePath(`/mis-ventas/${operacionId}`)
    revalidatePath("/mis-ventas")
    return { ok: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al rechazar la reserva" }
  }
}

// ─── Comprador: cancelar / pagar / confirmar ──────────────────────────────────

export async function cancelarReservaAction(operacionId: string) {
  const usuario = await requireAuth()

  try {
    const vendedorId = await cancelarReserva(operacionId, usuario.id)

    const op = await prisma.operacion.findUnique({
      where: { id: operacionId },
      select: { publicacion: { select: { nombreEvento: true } } },
    })

    await crearNotificacion({
      usuarioId: vendedorId,
      titulo: "El comprador canceló la reserva",
      cuerpo: `La entrada de ${op?.publicacion?.nombreEvento ?? "el evento"} volvió a estar disponible.`,
      url: `/mis-ventas/${operacionId}`,
    })

    revalidatePath(`/mis-compras/${operacionId}`)
    revalidatePath("/mis-compras")
    return { ok: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al cancelar la reserva" }
  }
}

export async function subirComprobanteAction(
  operacionId: string,
  datos: { tipo: "YAPE" | "PLIN" | "TRANSFERENCIA_BANCARIA"; url: string; cloudinaryId: string; referencia?: string }
) {
  const usuario = await requireAuth()

  try {
    await subirComprobante(operacionId, usuario.id, datos)
    await notificarAdmins(
      "💳 Nuevo comprobante de pago",
      "Un comprador subió un comprobante. Requiere confirmación.",
      `/admin/operaciones/${operacionId}`
    )
    revalidatePath(`/mis-compras/${operacionId}`)
    return { ok: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al subir comprobante" }
  }
}

export async function confirmarRecepcionAction(operacionId: string) {
  const usuario = await requireAuth()

  try {
    const { vendedorId, montoVendedorCentimos } = await confirmarRecepcion(operacionId, usuario.id)

    const op = await prisma.operacion.findUnique({
      where: { id: operacionId },
      select: { publicacion: { select: { nombreEvento: true } } },
    })

    const nombreEvento = op?.publicacion?.nombreEvento ?? "la entrada"

    await crearNotificacion({
      usuarioId: vendedorId,
      titulo: "¡Fondos liberados!",
      cuerpo: `El comprador confirmó la recepción de ${nombreEvento}. Liberamos S/ ${(montoVendedorCentimos / 100).toFixed(2)} para tu cuenta.`,
      url: `/mis-ventas/${operacionId}`,
    })

    revalidatePath(`/mis-compras/${operacionId}`)
    revalidatePath("/mis-compras")
    return { ok: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al confirmar recepción" }
  }
}

// ─── Vendedor: subir evidencia de transferencia ───────────────────────────────

export async function subirEvidenciaTransferenciaAction(
  operacionId: string,
  evidencia: { url: string; cloudinaryId: string }
) {
  const usuario = await requireVendedorAprobado()

  try {
    const compradorId = await subirEvidenciaTransferencia(operacionId, usuario.id, evidencia)

    const op = await prisma.operacion.findUnique({
      where: { id: operacionId },
      select: { publicacion: { select: { nombreEvento: true } } },
    })

    await crearNotificacion({
      usuarioId: compradorId,
      titulo: "El vendedor inició la transferencia",
      cuerpo: `El vendedor subió evidencia de la transferencia de ${op?.publicacion?.nombreEvento ?? "la entrada"}.`,
      url: `/mis-compras/${operacionId}`,
    })
    await notificarAdmins(
      "📋 Evidencia de transferencia subida",
      "Un vendedor subió evidencia de transferencia. Requiere validación.",
      `/admin/operaciones/${operacionId}`
    )

    revalidatePath(`/mis-ventas/${operacionId}`)
    return { ok: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al subir evidencia" }
  }
}

// ─── Admin ────────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth()
  if (!session) redirect("/auth/login")
  if (session.user.rolPrincipal !== "ADMINISTRADOR") redirect("/403")
  return session.user
}

export async function confirmarPagoAction(operacionId: string) {
  const admin = await requireAdmin()

  try {
    const { vendedorId, compradorId } = await confirmarPago(operacionId, admin.id)

    const op = await prisma.operacion.findUnique({
      where: { id: operacionId },
      select: { publicacion: { select: { nombreEvento: true } } },
    })

    await Promise.all([
      crearNotificacion({
        usuarioId: compradorId,
        titulo: "Pago confirmado",
        cuerpo: `Recibimos tu pago por ${op?.publicacion?.nombreEvento ?? "la entrada"}. Notificaremos al vendedor.`,
        url: `/mis-compras/${operacionId}`,
      }),
      crearNotificacion({
        usuarioId: vendedorId,
        titulo: "Pago recibido",
        cuerpo: `El comprador pagó por ${op?.publicacion?.nombreEvento ?? "la entrada"}. Pronto te pediremos que realices la transferencia.`,
        url: `/mis-ventas/${operacionId}`,
      }),
    ])

    revalidatePath(`/admin/operaciones/${operacionId}`)
    return { ok: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al confirmar pago" }
  }
}

// Acción fusionada: confirma el pago y notifica al vendedor en un solo click.
// Si el perfil del vendedor está incompleto, el pago queda confirmado (PAGO_RECIBIDO)
// y devuelve un warning para que el admin complete el perfil antes de notificar.
export async function confirmarPagoYNotificarAction(operacionId: string): Promise<{ ok?: boolean; error?: string; warning?: string }> {
  const admin = await requireAdmin()

  // Paso 1: confirmar pago
  let compradorId: string, vendedorId: string
  try {
    const result = await confirmarPago(operacionId, admin.id)
    compradorId = result.compradorId
    vendedorId = result.vendedorId
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al confirmar pago" }
  }

  const op = await prisma.operacion.findUnique({
    where: { id: operacionId },
    select: {
      publicacion: { select: { nombreEvento: true } },
      vendedor: { select: { nombre: true, email: true } },
    },
  })
  const nombreEvento = op?.publicacion?.nombreEvento ?? "la entrada"

  await crearNotificacion({
    usuarioId: compradorId,
    titulo: "Pago confirmado",
    cuerpo: `Recibimos tu pago por ${nombreEvento}. Notificaremos al vendedor para que transfiera la entrada.`,
    url: `/mis-compras/${operacionId}`,
  })

  // Paso 2: notificar al vendedor (puede fallar si el perfil está incompleto)
  try {
    await notificarVendedor(operacionId, admin.id)
    await crearNotificacion({
      usuarioId: vendedorId,
      titulo: "Transfiere la entrada ahora",
      cuerpo: `El pago fue confirmado. Tienes 48 horas para transferir la entrada de ${nombreEvento} y subir evidencia.`,
      url: `/mis-ventas/${operacionId}`,
    })
    if (op?.vendedor) {
      await enviarEmail(
        op.vendedor.email,
        `Acción requerida: transfiere la entrada de ${nombreEvento}`,
        htmlVendedorNotificado(op.vendedor.nombre, nombreEvento, `/mis-ventas/${operacionId}`)
      )
    }
    revalidatePath(`/admin/operaciones/${operacionId}`)
    return { ok: true }
  } catch (error) {
    // El pago fue confirmado pero el vendedor debe completar su perfil
    await crearNotificacion({
      usuarioId: vendedorId,
      titulo: "Pago recibido — completa tu perfil",
      cuerpo: `El pago por ${nombreEvento} fue recibido. Completa tus datos y cuenta bancaria para recibir la instrucción de transferencia.`,
      url: `/mis-ventas/${operacionId}`,
    })
    revalidatePath(`/admin/operaciones/${operacionId}`)
    return {
      ok: true,
      warning: error instanceof Error ? error.message : "El pago fue confirmado pero el vendedor debe completar su perfil antes de ser notificado.",
    }
  }
}

export async function notificarVendedorAction(operacionId: string) {
  const admin = await requireAdmin()

  try {
    const vendedorId = await notificarVendedor(operacionId, admin.id)

    const op = await prisma.operacion.findUnique({
      where: { id: operacionId },
      select: {
        publicacion: { select: { nombreEvento: true } },
        vendedor: { select: { nombre: true, email: true } },
      },
    })
    const nombreEvento = op?.publicacion?.nombreEvento ?? "el evento"

    await crearNotificacion({
      usuarioId: vendedorId,
      titulo: "Transfiere la entrada ahora",
      cuerpo: `El pago fue confirmado. Tienes 48 horas para transferir la entrada de ${nombreEvento} y subir evidencia.`,
      url: `/mis-ventas/${operacionId}`,
    })

    if (op?.vendedor) {
      await enviarEmail(
        op.vendedor.email,
        `Acción requerida: transfiere la entrada de ${nombreEvento}`,
        htmlVendedorNotificado(op.vendedor.nombre, nombreEvento, `/mis-ventas/${operacionId}`)
      )
    }

    revalidatePath(`/admin/operaciones/${operacionId}`)
    return { ok: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al notificar al vendedor" }
  }
}

export async function marcarTransferidaAction(operacionId: string) {
  const admin = await requireAdmin()

  try {
    const { compradorId, fechaLimite } = await marcarTransferida(operacionId, admin.id)

    const op = await prisma.operacion.findUnique({
      where: { id: operacionId },
      select: {
        publicacion: { select: { nombreEvento: true } },
        comprador: { select: { email: true, nombre: true } },
      },
    })

    const nombreEvento = op?.publicacion?.nombreEvento ?? "el evento"

    const fechaFmt = new Intl.DateTimeFormat("es-PE", {
      weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
    }).format(fechaLimite)

    await crearNotificacion({
      usuarioId: compradorId,
      titulo: "Tu entrada fue transferida — confirma en 24h",
      cuerpo: `Transfiero validó la transferencia de ${nombreEvento}. Tienes hasta el ${fechaFmt} para confirmar o disputar.`,
      url: `/mis-compras/${operacionId}`,
    })

    if (op?.comprador) {
      await enviarEmail(
        op.comprador.email,
        "Transfiero — Confirma tu entrada en 24 horas",
        htmlPlazoConfirmacion(op.comprador.nombre, nombreEvento, fechaLimite, `/mis-compras/${operacionId}`)
      )
    }

    revalidatePath(`/admin/operaciones/${operacionId}`)
    return { ok: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al marcar como transferida" }
  }
}

export async function liberarFondosAction(operacionId: string) {
  const admin = await requireAdmin()

  try {
    const vendedorId = await liberarFondos(operacionId, admin.id)

    const op = await prisma.operacion.findUnique({
      where: { id: operacionId },
      select: { publicacion: { select: { nombreEvento: true } }, montoVendedorCentimos: true },
    })

    await crearNotificacion({
      usuarioId: vendedorId,
      titulo: "¡Fondos liberados!",
      cuerpo: `Liberamos S/ ${((op?.montoVendedorCentimos ?? 0) / 100).toFixed(2)} por la venta de ${op?.publicacion?.nombreEvento ?? "la entrada"}.`,
      url: `/mis-ventas/${operacionId}`,
    })

    revalidatePath(`/admin/operaciones/${operacionId}`)
    return { ok: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al liberar fondos" }
  }
}

export async function cancelarOperacionAdminAction(operacionId: string, reembolso: boolean) {
  const admin = await requireAdmin()

  try {
    const { compradorId, vendedorId } = await cancelarOperacionAdmin(operacionId, admin.id, reembolso)

    const op = await prisma.operacion.findUnique({
      where: { id: operacionId },
      select: { publicacion: { select: { nombreEvento: true } } },
    })

    const nombreEvento = op?.publicacion?.nombreEvento ?? "la entrada"

    await Promise.all([
      crearNotificacion({
        usuarioId: compradorId,
        titulo: reembolso ? "Operación reembolsada" : "Operación cancelada",
        cuerpo: reembolso
          ? `La operación de ${nombreEvento} fue reembolsada. Recibirás el monto pagado.`
          : `La operación de ${nombreEvento} fue cancelada.`,
        url: `/mis-compras/${operacionId}`,
      }),
      crearNotificacion({
        usuarioId: vendedorId,
        titulo: "Operación cancelada",
        cuerpo: `La operación de ${nombreEvento} fue cancelada por el administrador.`,
        url: `/mis-ventas/${operacionId}`,
      }),
    ])

    revalidatePath(`/admin/operaciones/${operacionId}`)
    revalidatePath("/admin/operaciones")
    return { ok: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al cancelar la operación" }
  }
}

// ─── Comprador: registrar cuenta de destino ───────────────────────────────────

export async function registrarCuentaDestinoAction(operacionId: string, cuenta: string) {
  const usuario = await requireAuth()

  const error = validarCuentaDestino(cuenta)
  if (error) return { error }

  try {
    await registrarCuentaDestino(operacionId, usuario.id, cuenta.trim())
    revalidatePath(`/mis-compras/${operacionId}`)
    return { ok: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al guardar el dato" }
  }
}
