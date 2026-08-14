"use server"

import { auth } from "@/lib/auth"
import { marcarLeida, marcarTodasLeidas } from "@/services/notificacion.service"
import { revalidatePath } from "next/cache"

export async function marcarLeidaAction(notificacionId: string) {
  const session = await auth()
  if (!session) return { error: "No autenticado" }

  await marcarLeida(notificacionId, session.user.id)
  revalidatePath("/notificaciones")
  return { ok: true }
}

export async function marcarTodasLeidasAction() {
  const session = await auth()
  if (!session) return { error: "No autenticado" }

  await marcarTodasLeidas(session.user.id)
  revalidatePath("/notificaciones")
  return { ok: true }
}
