"use server"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { z } from "zod"
import {
  crearSolicitudVendedor,
  aprobarSolicitud,
  rechazarSolicitud,
} from "@/services/solicitud.service"

const motivoSchema = z.string().min(10, "El motivo debe tener al menos 10 caracteres")

export async function crearSolicitudAction(data: {
  dniFrontalUrl: string
  dniFrontalCloudinaryId: string
  dniPosteriorUrl: string
  dniPosteriorCloudinaryId: string
}) {
  const session = await auth()
  if (!session) return { error: "No autenticado" }

  const estadosPermitidos: string[] = ["NO_SOLICITADO", "RECHAZADO"]
  if (!estadosPermitidos.includes(session.user.estadoVendedor)) {
    return { error: "Ya tienes una solicitud activa o estás aprobado" }
  }

  try {
    await crearSolicitudVendedor(session.user.id, [
      { tipo: "DNI_FRONTAL", url: data.dniFrontalUrl, cloudinaryId: data.dniFrontalCloudinaryId },
      { tipo: "DNI_POSTERIOR", url: data.dniPosteriorUrl, cloudinaryId: data.dniPosteriorCloudinaryId },
    ])
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al enviar la solicitud" }
  }
}

export async function aprobarSolicitudAction(solicitudId: string) {
  const session = await auth()
  if (!session || session.user.rolPrincipal !== "ADMINISTRADOR") redirect("/403")

  try {
    await aprobarSolicitud(solicitudId, session.user.id)
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al aprobar" }
  }
}

export async function rechazarSolicitudAction(solicitudId: string, motivo: string) {
  const session = await auth()
  if (!session || session.user.rolPrincipal !== "ADMINISTRADOR") redirect("/403")

  const parsed = motivoSchema.safeParse(motivo)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Motivo inválido" }

  try {
    await rechazarSolicitud(solicitudId, session.user.id, motivo)
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al rechazar" }
  }
}
