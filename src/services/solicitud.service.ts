import { prisma } from "@/lib/prisma"
import type { EstadoSolicitud } from "@prisma/client"

type EvidenciaDNI = {
  tipo: "DNI_FRONTAL" | "DNI_POSTERIOR"
  url: string
  cloudinaryId: string
}

export async function crearSolicitudVendedor(usuarioId: string, evidencias: EvidenciaDNI[]) {
  const existente = await prisma.solicitudVendedor.findFirst({
    where: { usuarioId, estado: { in: ["PENDIENTE", "APROBADA"] } },
  })
  if (existente) throw new Error("Ya tienes una solicitud activa o aprobada")

  return prisma.$transaction(async (tx) => {
    const solicitud = await tx.solicitudVendedor.create({ data: { usuarioId } })

    await tx.evidencia.createMany({
      data: evidencias.map((e) => ({
        tipo: e.tipo,
        url: e.url,
        cloudinaryId: e.cloudinaryId,
        solicitudVendedorId: solicitud.id,
        subidoPorId: usuarioId,
      })),
    })

    await tx.usuario.update({
      where: { id: usuarioId },
      data: { estadoVendedor: "PENDIENTE" },
    })

    return solicitud
  })
}

export async function listarSolicitudesAdmin(estado?: EstadoSolicitud) {
  return prisma.solicitudVendedor.findMany({
    where: estado ? { estado } : {},
    orderBy: { creadoEn: "desc" },
    include: {
      usuario: { select: { id: true, nombre: true, email: true, estadoVendedor: true } },
    },
  })
}

export async function obtenerSolicitudAdmin(id: string) {
  return prisma.solicitudVendedor.findUnique({
    where: { id },
    include: {
      usuario: {
        select: {
          id: true, nombre: true, nombres: true, apellidos: true,
          dni: true, email: true, telefono: true,
          cuentasBancarias: {
            where: { activo: true, eliminadoEn: null },
            select: {
              id: true, banco: true, tipoCuenta: true,
              numeroCuenta: true, cci: true, titular: true, documentoTitular: true,
            },
            take: 1,
          },
        },
      },
      evidencias: { select: { id: true, tipo: true, url: true } },
      revisadoPor: { select: { nombre: true } },
    },
  })
}

export async function obtenerUltimaSolicitud(usuarioId: string) {
  return prisma.solicitudVendedor.findFirst({
    where: { usuarioId },
    orderBy: { creadoEn: "desc" },
    select: { estado: true, motivoRechazo: true, creadoEn: true },
  })
}

export async function aprobarSolicitud(solicitudId: string, adminId: string) {
  const solicitud = await prisma.solicitudVendedor.findUnique({ where: { id: solicitudId } })
  if (!solicitud) throw new Error("Solicitud no encontrada")
  if (solicitud.estado !== "PENDIENTE") throw new Error("La solicitud no está en estado PENDIENTE")

  return prisma.$transaction(async (tx) => {
    await tx.solicitudVendedor.update({
      where: { id: solicitudId },
      data: { estado: "APROBADA", revisadoPorId: adminId, revisadoEn: new Date() },
    })
    await tx.usuario.update({
      where: { id: solicitud.usuarioId },
      data: { rolPrincipal: "VENDEDOR", estadoVendedor: "APROBADO" },
    })
    await tx.auditoria.create({
      data: {
        entidad: "SolicitudVendedor",
        entidadId: solicitudId,
        accion: "APROBAR",
        estadoAnterior: "PENDIENTE",
        estadoNuevo: "APROBADA",
        actorId: adminId,
      },
    })
  })
}

export async function rechazarSolicitud(solicitudId: string, adminId: string, motivo: string) {
  const solicitud = await prisma.solicitudVendedor.findUnique({ where: { id: solicitudId } })
  if (!solicitud) throw new Error("Solicitud no encontrada")
  if (solicitud.estado !== "PENDIENTE") throw new Error("La solicitud no está en estado PENDIENTE")

  return prisma.$transaction(async (tx) => {
    await tx.solicitudVendedor.update({
      where: { id: solicitudId },
      data: { estado: "RECHAZADA", motivoRechazo: motivo, revisadoPorId: adminId, revisadoEn: new Date() },
    })
    await tx.usuario.update({
      where: { id: solicitud.usuarioId },
      data: { estadoVendedor: "RECHAZADO" },
    })
    await tx.auditoria.create({
      data: {
        entidad: "SolicitudVendedor",
        entidadId: solicitudId,
        accion: "RECHAZAR",
        estadoAnterior: "PENDIENTE",
        estadoNuevo: "RECHAZADA",
        actorId: adminId,
      },
    })
  })
}
