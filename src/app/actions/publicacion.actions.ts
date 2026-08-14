"use server"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import {
  crearPublicacionSchema,
  editarPublicacionSchema,
  rechazarPublicacionSchema,
} from "@/lib/validators/publicacion.schema"
import {
  crearPublicacion,
  editarPublicacion,
  enviarARevision,
  cancelarPublicacion,
  aprobarPublicacion,
  rechazarPublicacion,
  guardarEvidencia,
  guardarPortada,
} from "@/services/publicacion.service"
import { crearNotificacion, notificarAdmins } from "@/services/notificacion.service"

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function requireVendedor() {
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

async function requireAdmin() {
  const session = await auth()
  if (!session) redirect("/auth/login")
  if (session.user.rolPrincipal !== "ADMINISTRADOR") redirect("/403")
  return session.user
}

// ─── Vendedor ─────────────────────────────────────────────────────────────────

export async function crearPublicacionAction(formData: FormData) {
  const usuario = await requireVendedor()

  const datos = {
    nombreEvento: formData.get("nombreEvento") as string,
    fechaEvento: formData.get("fechaEvento") as string,
    lugarEvento: formData.get("lugarEvento") as string,
    categoria: formData.get("categoria") as string,
    descripcion: (formData.get("descripcion") as string) || undefined,
    precioOriginalSoles: formData.get("precioOriginalSoles"),
    precioVentaSoles: formData.get("precioVentaSoles"),
    zona: (formData.get("zona") as string) || undefined,
    asiento: (formData.get("asiento") as string) || undefined,
    ticketeraEnum: formData.get("ticketeraEnum") as string,
  }

  const parsed = crearPublicacionSchema.safeParse(datos)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" }
  }

  try {
    const publicacion = await crearPublicacion(usuario.id, parsed.data)
    revalidatePath("/mis-publicaciones")
    return { ok: true, id: publicacion.id }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al crear la publicación" }
  }
}

export async function editarPublicacionAction(id: string, formData: FormData) {
  const usuario = await requireVendedor()

  const datos = {
    nombreEvento: formData.get("nombreEvento") as string,
    fechaEvento: formData.get("fechaEvento") as string,
    lugarEvento: formData.get("lugarEvento") as string,
    categoria: formData.get("categoria") as string,
    descripcion: (formData.get("descripcion") as string) || undefined,
    precioOriginalSoles: formData.get("precioOriginalSoles"),
    precioVentaSoles: formData.get("precioVentaSoles"),
    zona: (formData.get("zona") as string) || undefined,
    asiento: (formData.get("asiento") as string) || undefined,
    ticketeraEnum: formData.get("ticketeraEnum") as string,
  }

  const parsed = editarPublicacionSchema.safeParse(datos)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" }
  }

  try {
    await editarPublicacion(id, usuario.id, parsed.data)
    revalidatePath(`/mis-publicaciones/${id}`)
    revalidatePath("/mis-publicaciones")
    return { ok: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al editar la publicación" }
  }
}

export async function enviarARevisionAction(id: string) {
  const usuario = await requireVendedor()

  try {
    await enviarARevision(id, usuario.id)

    await notificarAdmins(
      "Nueva publicación para revisar",
      `${usuario.name} envió una publicación a revisión.`,
      `/admin/publicaciones/${id}`
    )

    revalidatePath(`/mis-publicaciones/${id}`)
    revalidatePath("/mis-publicaciones")
    return { ok: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al enviar a revisión" }
  }
}

export async function cancelarPublicacionAction(id: string) {
  const usuario = await requireVendedor()

  try {
    await cancelarPublicacion(id, usuario.id)
    revalidatePath(`/mis-publicaciones/${id}`)
    revalidatePath("/mis-publicaciones")
    return { ok: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al cancelar la publicación" }
  }
}

export async function guardarEvidenciaAction(datos: {
  publicacionId: string
  url: string
  cloudinaryId: string
}) {
  const usuario = await requireVendedor()

  try {
    await guardarEvidencia({
      ...datos,
      subidoPorId: usuario.id,
    })
    revalidatePath(`/mis-publicaciones/${datos.publicacionId}`)
    return { ok: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al guardar la imagen" }
  }
}

export async function guardarPortadaAction(datos: {
  publicacionId: string
  url: string
  cloudinaryId: string
}) {
  const usuario = await requireVendedor()

  try {
    await guardarPortada(datos.publicacionId, usuario.id, datos.url, datos.cloudinaryId)
    revalidatePath(`/mis-publicaciones/${datos.publicacionId}`)
    return { ok: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al guardar la portada" }
  }
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function aprobarPublicacionAction(id: string) {
  const admin = await requireAdmin()

  try {
    const vendedorId = await aprobarPublicacion(id, admin.id)

    await crearNotificacion({
      usuarioId: vendedorId,
      titulo: "Tu publicación fue aprobada",
      cuerpo: "Tu entrada ya está disponible en el marketplace.",
      url: `/mis-publicaciones/${id}`,
    })

    revalidatePath(`/admin/publicaciones/${id}`)
    revalidatePath("/admin/publicaciones")
    return { ok: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al aprobar la publicación" }
  }
}

export async function rechazarPublicacionAction(id: string, formData: FormData) {
  const admin = await requireAdmin()

  const parsed = rechazarPublicacionSchema.safeParse({
    motivoRechazo: formData.get("motivoRechazo"),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Motivo inválido" }
  }

  try {
    const vendedorId = await rechazarPublicacion(id, admin.id, parsed.data.motivoRechazo)

    await crearNotificacion({
      usuarioId: vendedorId,
      titulo: "Tu publicación fue rechazada",
      cuerpo: `Motivo: ${parsed.data.motivoRechazo}`,
      url: `/mis-publicaciones/${id}`,
    })

    revalidatePath(`/admin/publicaciones/${id}`)
    revalidatePath("/admin/publicaciones")
    return { ok: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al rechazar la publicación" }
  }
}
