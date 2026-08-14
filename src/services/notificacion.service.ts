import { prisma } from "@/lib/prisma"

interface CrearNotificacionInput {
  usuarioId: string
  titulo: string
  cuerpo: string
  url?: string
}

export async function crearNotificacion(datos: CrearNotificacionInput) {
  return prisma.notificacion.create({
    data: {
      usuarioId: datos.usuarioId,
      titulo: datos.titulo,
      cuerpo: datos.cuerpo,
      url: datos.url,
    },
  })
}

export async function notificarAdmins(titulo: string, cuerpo: string, url?: string) {
  const admins = await prisma.usuario.findMany({
    where: { rolPrincipal: "ADMINISTRADOR", estadoCuenta: "ACTIVO" },
    select: { id: true },
  })

  if (admins.length === 0) return

  await prisma.notificacion.createMany({
    data: admins.map((admin) => ({
      usuarioId: admin.id,
      titulo,
      cuerpo,
      url,
    })),
  })
}

export async function listarNotificaciones(usuarioId: string) {
  return prisma.notificacion.findMany({
    where: { usuarioId },
    orderBy: { creadoEn: "desc" },
    take: 50,
  })
}

export async function marcarLeida(notificacionId: string, usuarioId: string) {
  return prisma.notificacion.updateMany({
    where: { id: notificacionId, usuarioId },
    data: { leida: true },
  })
}

export async function marcarTodasLeidas(usuarioId: string) {
  return prisma.notificacion.updateMany({
    where: { usuarioId, leida: false },
    data: { leida: true },
  })
}
