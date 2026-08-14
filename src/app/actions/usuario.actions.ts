"use server"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { suspenderUsuario, reactivarUsuario } from "@/services/usuario.service"
import { revalidatePath } from "next/cache"

export async function suspenderUsuarioAction(usuarioId: string) {
  const session = await auth()
  if (!session || session.user.rolPrincipal !== "ADMINISTRADOR") redirect("/403")

  try {
    await suspenderUsuario(usuarioId, session.user.id)
    revalidatePath("/admin/usuarios")
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al suspender" }
  }
}

export async function reactivarUsuarioAction(usuarioId: string) {
  const session = await auth()
  if (!session || session.user.rolPrincipal !== "ADMINISTRADOR") redirect("/403")

  try {
    await reactivarUsuario(usuarioId, session.user.id)
    revalidatePath("/admin/usuarios")
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al reactivar" }
  }
}
