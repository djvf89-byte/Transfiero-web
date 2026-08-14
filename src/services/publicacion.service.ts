import { prisma } from "@/lib/prisma"
import { solesToCentimos, validarPrecioVenta } from "@/utils/pricing"
import { esTransicionEntradaValida } from "@/constants/states"
import type { CrearPublicacionInput, EditarPublicacionInput } from "@/lib/validators/publicacion.schema"
import type { CategoriaEvento, EstadoPublicacion, Ticketera } from "@prisma/client"

// ─── Marketplace público ──────────────────────────────────────────────────────

export type OrdenMarketplace = "reciente" | "precio_asc" | "precio_desc" | "fecha_evento"

export async function listarMarketplace(
  pagina: number = 1,
  categoria?: CategoriaEvento,
  orden: OrdenMarketplace = "reciente"
) {
  const POR_PAGINA = 12
  const skip = (pagina - 1) * POR_PAGINA

  const orderBy = {
    reciente: { creadoEn: "desc" as const },
    precio_asc: { precioVentaCentimos: "asc" as const },
    precio_desc: { precioVentaCentimos: "desc" as const },
    fecha_evento: { fechaEvento: "asc" as const },
  }[orden]

  const CATEGORIAS_MARKETPLACE: CategoriaEvento[] = ["CONCIERTO", "DEPORTE"]

  const where = {
    estado: { in: ["DISPONIBLE", "PENDIENTE_VENDEDOR", "RESERVADA"] as EstadoPublicacion[] },
    eliminadoEn: null as null,
    fechaEvento: { gte: new Date() },
    categoria: categoria ?? { in: CATEGORIAS_MARKETPLACE },
    ticketeraEnum: { not: null },
  }

  const [publicaciones, total] = await Promise.all([
    prisma.publicacion.findMany({
      where,
      orderBy,
      skip,
      take: POR_PAGINA,
      include: {
        vendedor: { select: { id: true, nombre: true } },
        evidencias: {
          where: { tipo: "COMPRA_ENTRADA" },
          take: 1,
          select: { url: true },
        },
      },
    }),
    prisma.publicacion.count({ where }),
  ])

  return { publicaciones, total, totalPaginas: Math.ceil(total / POR_PAGINA) }
}

export async function obtenerPublicacionPublica(id: string) {
  return prisma.publicacion.findFirst({
    where: { id, eliminadoEn: null, estado: { notIn: ["BORRADOR", "PENDIENTE_REVISION", "CANCELADA"] } },
    include: {
      vendedor: { select: { id: true, nombre: true } },
      evidencias: {
        where: { tipo: "COMPRA_ENTRADA" },
        take: 1,
        select: { url: true },
      },
    },
  })
}

export async function listarPublicacionesSitemap() {
  return prisma.publicacion.findMany({
    where: { estado: "DISPONIBLE", eliminadoEn: null },
    select: { id: true, actualizadoEn: true },
    orderBy: { actualizadoEn: "desc" },
  })
}

export async function obtenerSpotifyDestacado() {
  return prisma.publicacion.findFirst({
    where: {
      categoria: "CONCIERTO",
      spotifyEmbedUrl: { not: null },
      estado: { in: ["DISPONIBLE", "PENDIENTE_VENDEDOR", "RESERVADA"] as EstadoPublicacion[] },
      eliminadoEn: null,
      fechaEvento: { gte: new Date() },
    },
    orderBy: { aprobadoEn: "desc" },
    select: { id: true, artista: true, spotifyEmbedUrl: true, nombreEvento: true },
  })
}

export async function contarVentasCompletadas(vendedorId: string): Promise<number> {
  return prisma.operacion.count({
    where: { vendedorId, estado: "FONDOS_LIBERADOS" },
  })
}

export async function contarDisputasVendedor(vendedorId: string): Promise<number> {
  return prisma.operacion.count({
    where: { vendedorId, estado: "EN_DISPUTA" },
  })
}

export async function guardarPortada(
  publicacionId: string,
  vendedorId: string,
  url: string,
  cloudinaryId: string
) {
  const publicacion = await prisma.publicacion.findFirst({
    where: { id: publicacionId, vendedorId, eliminadoEn: null },
    select: { id: true },
  })
  if (!publicacion) throw new Error("Publicación no encontrada")

  return prisma.publicacion.update({
    where: { id: publicacionId },
    data: { imagenPortadaUrl: url, imagenPortadaCloudinaryId: cloudinaryId },
  })
}

// ─── Lecturas ─────────────────────────────────────────────────────────────────

export async function listarPublicacionesVendedor(
  vendedorId: string,
  pagina: number = 1
) {
  const POR_PAGINA = 10
  const skip = (pagina - 1) * POR_PAGINA

  const [publicaciones, total] = await Promise.all([
    prisma.publicacion.findMany({
      where: { vendedorId, eliminadoEn: null },
      orderBy: { creadoEn: "desc" },
      skip,
      take: POR_PAGINA,
      include: {
        evidencias: {
          where: { tipo: "COMPRA_ENTRADA" },
          take: 1,
          select: { url: true },
        },
      },
    }),
    prisma.publicacion.count({ where: { vendedorId, eliminadoEn: null } }),
  ])

  return { publicaciones, total, totalPaginas: Math.ceil(total / POR_PAGINA) }
}

export async function listarPublicacionesAdmin(
  pagina: number = 1,
  estado?: EstadoPublicacion
) {
  const POR_PAGINA = 10
  const skip = (pagina - 1) * POR_PAGINA
  const where = {
    eliminadoEn: null as null,
    ...(estado ? { estado } : {}),
  }

  const [publicaciones, total] = await Promise.all([
    prisma.publicacion.findMany({
      where,
      orderBy: [
        { evidencias: { _count: "desc" } },
        { creadoEn: "desc" },
      ],
      skip,
      take: POR_PAGINA,
      include: {
        vendedor: { select: { id: true, nombre: true, email: true } },
        evidencias: {
          where: { tipo: "COMPRA_ENTRADA" },
          take: 1,
          select: { url: true },
        },
      },
    }),
    prisma.publicacion.count({ where }),
  ])

  return { publicaciones, total, totalPaginas: Math.ceil(total / POR_PAGINA) }
}

export async function obtenerPublicacion(id: string) {
  return prisma.publicacion.findFirst({
    where: { id, eliminadoEn: null },
    include: {
      vendedor: { select: { id: true, nombre: true, email: true } },
      evidencias: { orderBy: { creadoEn: "desc" } },
      aprobadoPor: { select: { id: true, nombre: true } },
    },
  })
}

// ─── Escrituras ───────────────────────────────────────────────────────────────

export async function crearPublicacion(vendedorId: string, datos: CrearPublicacionInput) {
  const precioOriginalCentimos = solesToCentimos(datos.precioOriginalSoles)
  const precioVentaCentimos = solesToCentimos(datos.precioVentaSoles)

  const validacion = validarPrecioVenta(precioVentaCentimos, precioOriginalCentimos)
  if (!validacion.valido) throw new Error(validacion.error)

  const publicacion = await prisma.publicacion.create({
    data: {
      vendedorId,
      nombreEvento: datos.nombreEvento,
      fechaEvento: new Date(datos.fechaEvento),
      lugarEvento: datos.lugarEvento,
      categoria: datos.categoria as CategoriaEvento,
      descripcion: datos.descripcion,
      precioOriginalCentimos,
      precioVentaCentimos,
      zona: datos.zona,
      asiento: datos.asiento,
      ticketeraEnum: datos.ticketeraEnum as Ticketera,
      artista: datos.artista,
      spotifyEmbedUrl: datos.spotifyEmbedUrl,
      estado: "BORRADOR",
    },
  })

  await prisma.auditoria.create({
    data: {
      entidad: "Publicacion",
      entidadId: publicacion.id,
      accion: "CREAR",
      estadoNuevo: "BORRADOR",
      actorId: vendedorId,
      descripcion: `Ticketera: ${datos.ticketeraEnum}`,
    },
  })

  return publicacion
}

export async function editarPublicacion(
  id: string,
  vendedorId: string,
  datos: EditarPublicacionInput
) {
  const publicacion = await prisma.publicacion.findFirst({
    where: { id, vendedorId, eliminadoEn: null },
  })

  if (!publicacion) throw new Error("Publicación no encontrada")

  const ESTADOS_BLOQUEADOS_TICKETERA: EstadoPublicacion[] = [
    "RESERVADA", "EN_TRANSFERENCIA", "TRANSFERIDA", "COMPLETADA", "EN_DISPUTA",
  ]
  if (
    ESTADOS_BLOQUEADOS_TICKETERA.includes(publicacion.estado) &&
    datos.ticketeraEnum &&
    datos.ticketeraEnum !== publicacion.ticketeraEnum
  ) {
    await prisma.auditoria.create({
      data: {
        entidad: "Publicacion",
        entidadId: id,
        accion: "TICKETERA_BLOQUEADA",
        estadoAnterior: publicacion.estado,
        actorId: vendedorId,
        descripcion: `Intento de cambio a ${datos.ticketeraEnum} bloqueado`,
      },
    })
    throw new Error("No se puede modificar la ticketera cuando la publicación está en proceso de venta")
  }

  if (publicacion.estado !== "BORRADOR") {
    throw new Error("Solo puedes editar publicaciones en borrador")
  }

  const precioOriginalCentimos = solesToCentimos(datos.precioOriginalSoles)
  const precioVentaCentimos = solesToCentimos(datos.precioVentaSoles)

  const validacion = validarPrecioVenta(precioVentaCentimos, precioOriginalCentimos)
  if (!validacion.valido) throw new Error(validacion.error)

  const actualizada = await prisma.publicacion.update({
    where: { id },
    data: {
      nombreEvento: datos.nombreEvento,
      fechaEvento: new Date(datos.fechaEvento),
      lugarEvento: datos.lugarEvento,
      categoria: datos.categoria as CategoriaEvento,
      descripcion: datos.descripcion,
      precioOriginalCentimos,
      precioVentaCentimos,
      zona: datos.zona,
      asiento: datos.asiento,
      ticketeraEnum: datos.ticketeraEnum as Ticketera,
      artista: datos.artista,
      spotifyEmbedUrl: datos.spotifyEmbedUrl,
    },
  })

  const ticketeraCambio =
    datos.ticketeraEnum && datos.ticketeraEnum !== publicacion.ticketeraEnum
      ? ` | Ticketera: ${publicacion.ticketeraEnum ?? "ninguna"} → ${datos.ticketeraEnum}`
      : ""

  await prisma.auditoria.create({
    data: {
      entidad: "Publicacion",
      entidadId: id,
      accion: "EDITAR",
      actorId: vendedorId,
      descripcion: `Editada${ticketeraCambio}`,
    },
  })

  return actualizada
}

export async function enviarARevision(id: string, vendedorId: string) {
  const publicacion = await prisma.publicacion.findFirst({
    where: { id, vendedorId, eliminadoEn: null },
    include: {
      evidencias: { where: { tipo: "COMPRA_ENTRADA" }, take: 1 },
    },
  })

  if (!publicacion) throw new Error("Publicación no encontrada")
  if (!esTransicionEntradaValida(publicacion.estado, "PENDIENTE_REVISION")) {
    throw new Error("No se puede enviar a revisión desde el estado actual")
  }

  if (!publicacion.ticketeraEnum) {
    await prisma.auditoria.create({
      data: {
        entidad: "Publicacion",
        entidadId: id,
        accion: "REVISION_BLOQUEADA",
        estadoAnterior: publicacion.estado,
        actorId: vendedorId,
        descripcion: "Bloqueado: falta ticketera",
      },
    })
    throw new Error("Debes seleccionar la ticketera de la entrada antes de enviar a revisión")
  }
  if (publicacion.evidencias.length === 0) {
    throw new Error("Debes subir al menos una imagen de la entrada antes de enviar a revisión")
  }

  await prisma.publicacion.update({
    where: { id },
    data: { estado: "PENDIENTE_REVISION" },
  })

  await prisma.auditoria.create({
    data: {
      entidad: "Publicacion",
      entidadId: id,
      accion: "ENVIAR_REVISION",
      estadoAnterior: "BORRADOR",
      estadoNuevo: "PENDIENTE_REVISION",
      actorId: vendedorId,
    },
  })
}

export async function cancelarPublicacion(id: string, vendedorId: string) {
  const publicacion = await prisma.publicacion.findFirst({
    where: { id, vendedorId, eliminadoEn: null },
  })

  if (!publicacion) throw new Error("Publicación no encontrada")

  const ESTADOS_CANCELABLES: EstadoPublicacion[] = ["BORRADOR", "APROBADA"]
  if (!ESTADOS_CANCELABLES.includes(publicacion.estado)) {
    throw new Error("No puedes cancelar una publicación en el estado actual")
  }

  // Verifica que no tenga operaciones activas (estados terminales: CANCELADA, FONDOS_LIBERADOS, REEMBOLSADA)
  const operacionActiva = await prisma.operacion.findFirst({
    where: {
      publicacionId: id,
      estado: {
        notIn: ["CANCELADA", "FONDOS_LIBERADOS", "REEMBOLSADA"],
      },
    },
  })
  if (operacionActiva) {
    throw new Error("No puedes cancelar una publicación con una operación activa")
  }

  await prisma.publicacion.update({
    where: { id },
    data: { estado: "CANCELADA" },
  })

  await prisma.auditoria.create({
    data: {
      entidad: "Publicacion",
      entidadId: id,
      accion: "CANCELAR",
      estadoAnterior: publicacion.estado,
      estadoNuevo: "CANCELADA",
      actorId: vendedorId,
    },
  })
}

export async function aprobarPublicacion(id: string, adminId: string) {
  const publicacion = await prisma.publicacion.findFirst({
    where: { id, eliminadoEn: null },
    include: {
      evidencias: { where: { tipo: "COMPRA_ENTRADA" }, take: 1 },
    },
  })

  if (!publicacion) throw new Error("Publicación no encontrada")
  if (!esTransicionEntradaValida(publicacion.estado, "APROBADA")) {
    throw new Error("Solo se pueden aprobar publicaciones en revisión")
  }
  if (publicacion.evidencias.length === 0) {
    throw new Error("La publicación no tiene evidencia de entrada")
  }

  // PENDIENTE_REVISION → APROBADA → DISPONIBLE en una sola operación
  await prisma.publicacion.update({
    where: { id },
    data: {
      estado: "DISPONIBLE",
      aprobadoPorId: adminId,
      aprobadoEn: new Date(),
      motivoRechazo: null,
    },
  })

  await prisma.auditoria.create({
    data: {
      entidad: "Publicacion",
      entidadId: id,
      accion: "APROBAR",
      estadoAnterior: "PENDIENTE_REVISION",
      estadoNuevo: "DISPONIBLE",
      actorId: adminId,
    },
  })

  return publicacion.vendedorId
}

export async function rechazarPublicacion(
  id: string,
  adminId: string,
  motivoRechazo: string
) {
  const publicacion = await prisma.publicacion.findFirst({
    where: { id, eliminadoEn: null },
  })

  if (!publicacion) throw new Error("Publicación no encontrada")
  if (!esTransicionEntradaValida(publicacion.estado, "CANCELADA")) {
    throw new Error("Solo se pueden rechazar publicaciones en revisión")
  }

  // Verificar que esté en PENDIENTE_REVISION específicamente
  if (publicacion.estado !== "PENDIENTE_REVISION") {
    throw new Error("Solo se pueden rechazar publicaciones en revisión")
  }

  await prisma.publicacion.update({
    where: { id },
    data: {
      estado: "CANCELADA",
      motivoRechazo,
    },
  })

  await prisma.auditoria.create({
    data: {
      entidad: "Publicacion",
      entidadId: id,
      accion: "RECHAZAR",
      estadoAnterior: "PENDIENTE_REVISION",
      estadoNuevo: "CANCELADA",
      actorId: adminId,
    },
  })

  return publicacion.vendedorId
}

export async function guardarEvidencia(datos: {
  publicacionId: string
  url: string
  cloudinaryId: string
  subidoPorId: string
}) {
  const publicacion = await prisma.publicacion.findFirst({
    where: { id: datos.publicacionId, eliminadoEn: null },
    select: { vendedorId: true },
  })

  if (!publicacion) {
    throw new Error("Publicación no encontrada")
  }

  if (publicacion.vendedorId !== datos.subidoPorId) {
    await prisma.auditoria.create({
      data: {
        entidad: "Evidencia",
        entidadId: datos.publicacionId,
        accion: "INTENTO_NO_AUTORIZADO",
        actorId: datos.subidoPorId,
      },
    })
    throw new Error("No tienes permiso para subir evidencia a esta publicación")
  }

  return prisma.evidencia.create({
    data: {
      tipo: "COMPRA_ENTRADA",
      url: datos.url,
      cloudinaryId: datos.cloudinaryId,
      publicacionId: datos.publicacionId,
      subidoPorId: datos.subidoPorId,
    },
  })
}
