"use server"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { abrirDisputa, subirEvidenciaDisputa, resolverDisputa } from "@/services/disputa.service"
import { crearNotificacion, notificarAdmins } from "@/services/notificacion.service"

async function requireAuth() {
  const session = await auth()
  if (!session) redirect("/auth/login")
  return session.user
}

async function requireAdmin() {
  const session = await auth()
  if (!session) redirect("/auth/login")
  if (session.user.rolPrincipal !== "ADMINISTRADOR") redirect("/403")
  return session.user
}

// ─── Comprador ────────────────────────────────────────────────────────────────

export async function abrirDisputaAction(operacionId: string, motivo: string) {
  const usuario = await requireAuth()
  try {
    const { vendedorId } = await abrirDisputa(operacionId, usuario.id, motivo)
    await crearNotificacion({
      usuarioId: vendedorId,
      titulo: "Disputa abierta en tu venta",
      cuerpo: "El comprador abrió una disputa. El equipo de Transfiero revisará el caso.",
      url: `/mis-ventas/${operacionId}`,
    })
    await notificarAdmins(
      "Nueva disputa abierta",
      "Un comprador abrió una disputa. Requiere revisión.",
      `/admin/operaciones/${operacionId}`
    )
    revalidatePath(`/mis-compras/${operacionId}`)
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al abrir la disputa" }
  }
}

// ─── Comprador o vendedor ─────────────────────────────────────────────────────

export async function subirEvidenciaDisputaAction(
  disputaId: string,
  operacionId: string,
  datos: { url: string; cloudinaryId: string }
) {
  const usuario = await requireAuth()
  try {
    await subirEvidenciaDisputa(disputaId, usuario.id, datos)
    revalidatePath(`/mis-compras/${operacionId}`)
    revalidatePath(`/mis-ventas/${operacionId}`)
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al subir evidencia" }
  }
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function resolverDisputaAction(
  disputaId: string,
  operacionId: string,
  favor: "VENDEDOR" | "COMPRADOR",
  nota?: string
) {
  const admin = await requireAdmin()
  try {
    const { compradorId, vendedorId } = await resolverDisputa(disputaId, admin.id, favor, nota)
    const aFavorVendedor = favor === "VENDEDOR"

    await crearNotificacion({
      usuarioId: compradorId,
      titulo: aFavorVendedor ? "Disputa resuelta a favor del vendedor" : "Disputa resuelta — reembolso en proceso",
      cuerpo: aFavorVendedor
        ? "Los fondos fueron liberados al vendedor."
        : "Tu pago será reembolsado.",
      url: `/mis-compras/${operacionId}`,
    })
    await crearNotificacion({
      usuarioId: vendedorId,
      titulo: aFavorVendedor ? "Disputa resuelta — fondos liberados" : "Disputa resuelta a favor del comprador",
      cuerpo: aFavorVendedor
        ? "Los fondos de la operación fueron liberados a tu cuenta."
        : "La disputa fue resuelta a favor del comprador.",
      url: `/mis-ventas/${operacionId}`,
    })

    revalidatePath(`/admin/operaciones/${operacionId}`)
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al resolver la disputa" }
  }
}
