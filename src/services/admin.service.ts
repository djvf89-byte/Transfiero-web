import { prisma } from "@/lib/prisma"

export async function obtenerMetricasAdmin() {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const manana = new Date(hoy)
  manana.setDate(manana.getDate() + 1)

  const [
    disputasAbiertas,
    compradorConfirmado,
    transferenciaEnProceso,
    pagoRecibido,
    pagoPendiente,
    esperandoVendedor,
    publicacionesPendientes,
    solicitudesPendientes,
    custodia,
    completadasHoy,
    operacionesActivas,
  ] = await Promise.all([
    prisma.operacion.count({ where: { estado: "EN_DISPUTA", eliminadoEn: null } }),
    prisma.operacion.count({ where: { estado: "COMPRADOR_CONFIRMADO", eliminadoEn: null } }),
    prisma.operacion.count({ where: { estado: "TRANSFERENCIA_EN_PROCESO", eliminadoEn: null } }),
    prisma.operacion.count({ where: { estado: "PAGO_RECIBIDO", eliminadoEn: null } }),
    prisma.operacion.count({ where: { estado: "PAGO_PENDIENTE", eliminadoEn: null } }),
    prisma.operacion.count({ where: { estado: "ESPERANDO_VENDEDOR", eliminadoEn: null } }),
    prisma.publicacion.count({ where: { estado: "PENDIENTE_REVISION", eliminadoEn: null } }),
    prisma.solicitudVendedor.count({ where: { estado: "PENDIENTE" } }),
    prisma.operacion.aggregate({
      where: {
        estado: { in: ["PAGO_RECIBIDO", "VENDEDOR_NOTIFICADO", "TRANSFERENCIA_EN_PROCESO", "COMPRADOR_CONFIRMADO"] },
        eliminadoEn: null,
      },
      _sum: { montoCompradorCentimos: true },
    }),
    prisma.operacion.count({
      where: { estado: "FONDOS_LIBERADOS", fechaLiberacion: { gte: hoy, lt: manana }, eliminadoEn: null },
    }),
    prisma.operacion.count({
      where: {
        estado: { in: ["ESPERANDO_VENDEDOR", "PAGO_PENDIENTE", "PAGO_RECIBIDO", "VENDEDOR_NOTIFICADO", "TRANSFERENCIA_EN_PROCESO", "COMPRADOR_CONFIRMADO", "EN_DISPUTA"] },
        eliminadoEn: null,
      },
    }),
  ])

  return {
    operacionesActivas,
    montoCustodiaCentimos: custodia._sum.montoCompradorCentimos ?? 0,
    disputasAbiertas,
    completadasHoy,
    cola: [
      { estado: "EN_DISPUTA",               label: "Disputas abiertas",        count: disputasAbiertas,        href: "/admin/operaciones?estado=EN_DISPUTA",              urgente: true },
      { estado: "COMPRADOR_CONFIRMADO",      label: "Fondos por liberar",       count: compradorConfirmado,     href: "/admin/operaciones?estado=COMPRADOR_CONFIRMADO",    urgente: true },
      { estado: "TRANSFERENCIA_EN_PROCESO",  label: "Evidencias por revisar",   count: transferenciaEnProceso,  href: "/admin/operaciones?estado=TRANSFERENCIA_EN_PROCESO", urgente: true },
      { estado: "PAGO_RECIBIDO",             label: "Notificar a vendedores",   count: pagoRecibido,            href: "/admin/operaciones?estado=PAGO_RECIBIDO",           urgente: true },
      { estado: "PAGO_PENDIENTE",            label: "Comprobantes por revisar", count: pagoPendiente,           href: "/admin/operaciones?estado=PAGO_PENDIENTE",          urgente: false },
      { estado: "ESPERANDO_VENDEDOR",        label: "Reservas sin respuesta",   count: esperandoVendedor,       href: "/admin/operaciones?estado=ESPERANDO_VENDEDOR",      urgente: false },
      { estado: "PENDIENTE_REVISION",        label: "Publicaciones en revisión",count: publicacionesPendientes, href: "/admin/publicaciones?estado=PENDIENTE_REVISION",    urgente: false },
      { estado: "SOLICITUD_PENDIENTE",       label: "Solicitudes de vendedor",  count: solicitudesPendientes,   href: "/admin/vendedores?estado=PENDIENTE",                urgente: false },
    ],
  }
}
