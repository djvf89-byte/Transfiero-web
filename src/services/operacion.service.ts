import { prisma } from "@/lib/prisma"
import { calcularFechaLimite, checkLiberacionLazy } from "@/lib/liberacion-automatica"

const MINUTOS_EXPIRACION = 15

// ─── Helpers de cálculo ───────────────────────────────────────────────────────

function calcularComisiones(precioVentaCentimos: number) {
  const comisionComprador = Math.round(precioVentaCentimos * 0.07)
  const comisionVendedor = Math.round(precioVentaCentimos * 0.03)
  return {
    comisionCompradorCentimos: comisionComprador,
    comisionVendedorCentimos: comisionVendedor,
    montoCompradorCentimos: precioVentaCentimos + comisionComprador,
    montoVendedorCentimos: precioVentaCentimos - comisionVendedor,
  }
}

// ─── Expiry lazy ─────────────────────────────────────────────────────────────

async function expirarSiCorresponde(operacionId: string): Promise<boolean> {
  const op = await prisma.operacion.findFirst({
    where: { id: operacionId, estado: "ESPERANDO_VENDEDOR", eliminadoEn: null },
    select: { id: true, publicacionId: true, reservaExpiraEn: true },
  })
  if (!op) return false
  if (op.reservaExpiraEn > new Date()) return false

  await prisma.$transaction(async (tx) => {
    await tx.operacion.update({
      where: { id: op.id },
      data: { estado: "CANCELADA" },
    })
    await tx.publicacion.update({
      where: { id: op.publicacionId },
      data: { estado: "DISPONIBLE" },
    })
    await tx.auditoria.create({
      data: {
        entidad: "Operacion",
        entidadId: op.id,
        accion: "EXPIRAR",
        estadoAnterior: "ESPERANDO_VENDEDOR",
        estadoNuevo: "CANCELADA",
      },
    })
  })

  return true
}

// ─── Crear reserva ────────────────────────────────────────────────────────────

export async function crearReserva(publicacionId: string, compradorId: string) {
  const publicacion = await prisma.publicacion.findFirst({
    where: { id: publicacionId, estado: "DISPONIBLE", eliminadoEn: null },
    select: {
      id: true,
      vendedorId: true,
      precioVentaCentimos: true,
      nombreEvento: true,
    },
  })

  if (!publicacion) throw new Error("La entrada no está disponible")
  if (publicacion.vendedorId === compradorId) {
    throw new Error("No puedes reservar tu propia entrada")
  }

  const ahora = new Date()
  const expiraEn = new Date(ahora.getTime() + MINUTOS_EXPIRACION * 60 * 1000)
  const comisiones = calcularComisiones(publicacion.precioVentaCentimos)

  const operacion = await prisma.$transaction(async (tx) => {
    const op = await tx.operacion.create({
      data: {
        publicacionId,
        compradorId,
        vendedorId: publicacion.vendedorId,
        estado: "ESPERANDO_VENDEDOR",
        precioVentaCentimos: publicacion.precioVentaCentimos,
        ...comisiones,
        reservadaEn: ahora,
        reservaExpiraEn: expiraEn,
      },
    })

    await tx.publicacion.update({
      where: { id: publicacionId },
      data: { estado: "PENDIENTE_VENDEDOR" },
    })

    await tx.auditoria.create({
      data: {
        entidad: "Operacion",
        entidadId: op.id,
        accion: "CREAR_RESERVA",
        estadoNuevo: "ESPERANDO_VENDEDOR",
        actorId: compradorId,
      },
    })

    return op
  })

  return operacion
}

// ─── Aceptar reserva ─────────────────────────────────────────────────────────

export async function aceptarReserva(operacionId: string, vendedorId: string) {
  const expirada = await expirarSiCorresponde(operacionId)
  if (expirada) throw new Error("La reserva ha expirado")

  const operacion = await prisma.operacion.findFirst({
    where: { id: operacionId, vendedorId, estado: "ESPERANDO_VENDEDOR", eliminadoEn: null },
    select: { id: true, publicacionId: true, compradorId: true },
  })

  if (!operacion) throw new Error("Reserva no encontrada o no tienes permiso")

  await prisma.$transaction(async (tx) => {
    await tx.operacion.update({
      where: { id: operacionId },
      data: { estado: "PAGO_PENDIENTE", vendedorAceptoEn: new Date() },
    })

    await tx.publicacion.update({
      where: { id: operacion.publicacionId },
      data: { estado: "RESERVADA" },
    })

    await tx.auditoria.create({
      data: {
        entidad: "Operacion",
        entidadId: operacionId,
        accion: "ACEPTAR_RESERVA",
        estadoAnterior: "ESPERANDO_VENDEDOR",
        estadoNuevo: "PAGO_PENDIENTE",
        actorId: vendedorId,
      },
    })
  })

  return operacion.compradorId
}

// ─── Rechazar reserva ─────────────────────────────────────────────────────────

export async function rechazarReserva(operacionId: string, vendedorId: string) {
  const operacion = await prisma.operacion.findFirst({
    where: { id: operacionId, vendedorId, estado: "ESPERANDO_VENDEDOR", eliminadoEn: null },
    select: { id: true, publicacionId: true, compradorId: true },
  })

  if (!operacion) throw new Error("Reserva no encontrada o no tienes permiso")

  await prisma.$transaction(async (tx) => {
    await tx.operacion.update({
      where: { id: operacionId },
      data: { estado: "CANCELADA" },
    })

    await tx.publicacion.update({
      where: { id: operacion.publicacionId },
      data: { estado: "DISPONIBLE" },
    })

    await tx.auditoria.create({
      data: {
        entidad: "Operacion",
        entidadId: operacionId,
        accion: "RECHAZAR_RESERVA",
        estadoAnterior: "ESPERANDO_VENDEDOR",
        estadoNuevo: "CANCELADA",
        actorId: vendedorId,
      },
    })
  })

  return operacion.compradorId
}

// ─── Lecturas ─────────────────────────────────────────────────────────────────

export async function listarOperacionesComprador(compradorId: string, pagina: number = 1) {
  const POR_PAGINA = 10
  const skip = (pagina - 1) * POR_PAGINA

  const [operaciones, total] = await Promise.all([
    prisma.operacion.findMany({
      where: { compradorId, eliminadoEn: null },
      orderBy: { creadoEn: "desc" },
      skip,
      take: POR_PAGINA,
      include: {
        publicacion: {
          select: {
            nombreEvento: true,
            fechaEvento: true,
            lugarEvento: true,
            categoria: true,
            imagenPortadaUrl: true,
            evidencias: {
              where: { tipo: "COMPRA_ENTRADA" },
              take: 1,
              select: { url: true },
            },
          },
        },
      },
    }),
    prisma.operacion.count({ where: { compradorId, eliminadoEn: null } }),
  ])

  return { operaciones, total, totalPaginas: Math.ceil(total / POR_PAGINA) }
}

export async function listarOperacionesVendedor(vendedorId: string, pagina: number = 1) {
  const POR_PAGINA = 10
  const skip = (pagina - 1) * POR_PAGINA

  const [operaciones, total] = await Promise.all([
    prisma.operacion.findMany({
      where: { vendedorId, eliminadoEn: null },
      orderBy: { creadoEn: "desc" },
      skip,
      take: POR_PAGINA,
      include: {
        publicacion: {
          select: {
            nombreEvento: true,
            fechaEvento: true,
            lugarEvento: true,
            categoria: true,
            zona: true,
            asiento: true,
            imagenPortadaUrl: true,
          },
        },
        comprador: { select: { id: true, nombre: true, email: true } },
      },
    }),
    prisma.operacion.count({ where: { vendedorId, eliminadoEn: null } }),
  ])

  return { operaciones, total, totalPaginas: Math.ceil(total / POR_PAGINA) }
}

export async function obtenerOperacionComprador(operacionId: string, compradorId: string) {
  const expirada = await expirarSiCorresponde(operacionId)
  await checkLiberacionLazy(operacionId)

  const operacion = await prisma.operacion.findFirst({
    where: { id: operacionId, compradorId, eliminadoEn: null },
    include: {
      publicacion: {
        select: {
          nombreEvento: true,
          fechaEvento: true,
          lugarEvento: true,
          categoria: true,
          zona: true,
          asiento: true,
          ticketera: true,
          ticketeraEnum: true,
          imagenPortadaUrl: true,
          vendedorId: true,
          estado: true,
          evidencias: {
            where: { tipo: "COMPRA_ENTRADA" },
            take: 1,
            select: { url: true },
          },
        },
      },
      vendedor: { select: { id: true, nombre: true } },
      pagos: { select: { estado: true }, orderBy: { creadoEn: "desc" } },
      disputa: {
        select: {
          id: true, estado: true, motivo: true, creadoEn: true,
          resolucionNota: true, resueltaEn: true,
          evidencias: {
            select: { id: true, url: true, subidoPorId: true, creadoEn: true },
            orderBy: { creadoEn: "desc" },
          },
        },
      },
    },
  })

  return { operacion, fueExpirada: expirada }
}

// Estados donde el vendedor puede ver la cuentaDestinoComprador
const ESTADOS_CUENTA_VISIBLE_VENDEDOR = [
  "PAGO_RECIBIDO", "VENDEDOR_NOTIFICADO", "TRANSFERENCIA_EN_PROCESO",
  "PENDIENTE_CONFIRMACION_COMPRADOR", "COMPRADOR_CONFIRMADO",
  "FONDOS_LIBERADOS", "EN_DISPUTA",
] as const

export async function obtenerOperacionVendedor(operacionId: string, vendedorId: string) {
  const expirada = await expirarSiCorresponde(operacionId)

  const operacion = await prisma.operacion.findFirst({
    where: { id: operacionId, vendedorId, eliminadoEn: null },
    include: {
      publicacion: {
        select: {
          nombreEvento: true,
          fechaEvento: true,
          lugarEvento: true,
          categoria: true,
          zona: true,
          asiento: true,
          ticketera: true,
          ticketeraEnum: true,
          imagenPortadaUrl: true,
        },
      },
      comprador: { select: { id: true, nombre: true, email: true } },
      disputa: {
        select: {
          id: true, estado: true, motivo: true, creadoEn: true,
          evidencias: {
            select: { id: true, url: true, subidoPorId: true, creadoEn: true },
            orderBy: { creadoEn: "desc" },
          },
        },
      },
    },
  })

  // Enmascarar cuenta de destino si el pago aún no fue validado por Transfiero
  if (operacion && !(ESTADOS_CUENTA_VISIBLE_VENDEDOR as readonly string[]).includes(operacion.estado)) {
    return { operacion: { ...operacion, cuentaDestinoComprador: null }, fueExpirada: expirada }
  }

  return { operacion, fueExpirada: expirada }
}

// ─── Registrar / actualizar cuenta de destino (comprador) ────────────────────

export async function registrarCuentaDestino(
  operacionId: string,
  compradorId: string,
  cuenta: string
) {
  const operacion = await prisma.operacion.findFirst({
    where: { id: operacionId, compradorId, estado: "PAGO_PENDIENTE", eliminadoEn: null },
    select: { id: true, cuentaDestinoComprador: true },
  })
  if (!operacion) throw new Error("Operación no encontrada o no puedes registrar este dato ahora")

  const esModificacion = !!operacion.cuentaDestinoComprador

  await prisma.$transaction(async (tx) => {
    await tx.operacion.update({
      where: { id: operacionId },
      data: { cuentaDestinoComprador: cuenta.trim() },
    })
    await tx.auditoria.create({
      data: {
        entidad: "Operacion", entidadId: operacionId,
        accion: esModificacion ? "MODIFICAR_CUENTA_DESTINO" : "REGISTRAR_CUENTA_DESTINO",
        actorId: compradorId,
        descripcion: esModificacion ? "Comprador actualizó su cuenta de destino" : "Comprador registró cuenta de destino",
      },
    })
  })
}

// ─── Cancelar reserva (comprador) ────────────────────────────────────────────

export async function cancelarReserva(operacionId: string, compradorId: string) {
  const operacion = await prisma.operacion.findFirst({
    where: { id: operacionId, compradorId, estado: "PAGO_PENDIENTE", eliminadoEn: null },
    select: { id: true, publicacionId: true, vendedorId: true },
  })
  if (!operacion) throw new Error("Operación no encontrada o no se puede cancelar")

  await prisma.$transaction(async (tx) => {
    await tx.operacion.update({ where: { id: operacionId }, data: { estado: "CANCELADA" } })
    await tx.publicacion.update({ where: { id: operacion.publicacionId }, data: { estado: "DISPONIBLE" } })
    await tx.auditoria.create({
      data: {
        entidad: "Operacion", entidadId: operacionId,
        accion: "CANCELAR_RESERVA", estadoAnterior: "PAGO_PENDIENTE", estadoNuevo: "CANCELADA",
        actorId: compradorId,
      },
    })
  })

  return operacion.vendedorId
}

// ─── Subir comprobante de pago (comprador) ───────────────────────────────────

export async function subirComprobante(
  operacionId: string,
  compradorId: string,
  datos: { tipo: "YAPE" | "PLIN" | "TRANSFERENCIA_BANCARIA"; url: string; cloudinaryId: string; referencia?: string }
) {
  const operacion = await prisma.operacion.findFirst({
    where: { id: operacionId, compradorId, estado: "PAGO_PENDIENTE", eliminadoEn: null },
    select: { id: true, montoCompradorCentimos: true, cuentaDestinoComprador: true },
  })
  if (!operacion) throw new Error("Operación no encontrada o no puedes subir comprobante ahora")
  if (!operacion.cuentaDestinoComprador) {
    throw new Error("Debes registrar tu cuenta de destino antes de subir el comprobante")
  }

  await prisma.$transaction(async (tx) => {
    // Eliminar comprobantes anteriores pendientes (reenvío)
    await tx.pago.deleteMany({ where: { operacionId, estado: "PENDIENTE" } })
    await tx.evidencia.deleteMany({ where: { operacionId, tipo: "PAGO" } })

    await tx.pago.create({
      data: {
        operacionId,
        pagadorId: compradorId,
        tipo: datos.tipo,
        estado: "PENDIENTE",
        montoCentimos: operacion.montoCompradorCentimos,
        referenciaExterna: datos.referencia ?? null,
      },
    })
    await tx.evidencia.create({
      data: {
        tipo: "PAGO",
        url: datos.url,
        cloudinaryId: datos.cloudinaryId,
        operacionId,
        subidoPorId: compradorId,
      },
    })
    await tx.auditoria.create({
      data: {
        entidad: "Operacion", entidadId: operacionId,
        accion: "SUBIR_COMPROBANTE", estadoAnterior: "PAGO_PENDIENTE", estadoNuevo: "PAGO_PENDIENTE",
        actorId: compradorId,
      },
    })
  })
}

// ─── Subir evidencia de transferencia (vendedor) ─────────────────────────────

export async function subirEvidenciaTransferencia(
  operacionId: string,
  vendedorId: string,
  evidencia: { url: string; cloudinaryId: string }
) {
  const operacion = await prisma.operacion.findFirst({
    where: { id: operacionId, vendedorId, estado: "VENDEDOR_NOTIFICADO", eliminadoEn: null },
    select: { id: true, publicacionId: true, compradorId: true },
  })
  if (!operacion) throw new Error("Operación no encontrada o no puedes subir evidencia ahora")

  await prisma.$transaction(async (tx) => {
    await tx.evidencia.create({
      data: {
        tipo: "TRANSFERENCIA",
        url: evidencia.url,
        cloudinaryId: evidencia.cloudinaryId,
        operacionId,
        subidoPorId: vendedorId,
      },
    })
    await tx.operacion.update({ where: { id: operacionId }, data: { estado: "TRANSFERENCIA_EN_PROCESO" } })
    await tx.publicacion.update({ where: { id: operacion.publicacionId }, data: { estado: "EN_TRANSFERENCIA" } })
    await tx.auditoria.create({
      data: {
        entidad: "Operacion", entidadId: operacionId,
        accion: "SUBIR_EVIDENCIA_TRANSFERENCIA",
        estadoAnterior: "VENDEDOR_NOTIFICADO", estadoNuevo: "TRANSFERENCIA_EN_PROCESO",
        actorId: vendedorId,
      },
    })
  })

  return operacion.compradorId
}

// ─── Confirmar recepción (comprador) ─────────────────────────────────────────

export async function confirmarRecepcion(operacionId: string, compradorId: string) {
  const operacion = await prisma.operacion.findFirst({
    where: {
      id: operacionId,
      compradorId,
      estado: { in: ["PENDIENTE_CONFIRMACION_COMPRADOR", "TRANSFERENCIA_EN_PROCESO"] },
      eliminadoEn: null,
    },
    select: { id: true, vendedorId: true, publicacionId: true, estado: true, montoVendedorCentimos: true },
  })
  if (!operacion) throw new Error("Operación no encontrada o no puedes confirmar ahora")

  const ahora = new Date()

  // El comprador confirma → fondos se liberan automáticamente en la misma transacción.
  // No requiere intervención del admin: el escrow ya cumplió su propósito.
  await prisma.$transaction(async (tx) => {
    await tx.operacion.update({
      where: { id: operacionId },
      data: {
        estado: "FONDOS_LIBERADOS",
        motivoLiberacion: "CONFIRMACION_COMPRADOR",
        fechaLiberacion: ahora,
      },
    })
    await tx.publicacion.update({
      where: { id: operacion.publicacionId },
      data: { estado: "COMPLETADA" },
    })
    await tx.auditoria.create({
      data: {
        entidad: "Operacion", entidadId: operacionId,
        accion: "CONFIRMAR_RECEPCION",
        estadoAnterior: operacion.estado,
        estadoNuevo: "FONDOS_LIBERADOS",
        actorId: compradorId,
        descripcion: "Comprador confirmó recepción — fondos liberados automáticamente",
      },
    })
  })

  return { vendedorId: operacion.vendedorId, montoVendedorCentimos: operacion.montoVendedorCentimos }
}

// ─── Acciones admin ───────────────────────────────────────────────────────────

export async function confirmarPago(operacionId: string, adminId: string) {
  const operacion = await prisma.operacion.findFirst({
    where: { id: operacionId, estado: "PAGO_PENDIENTE", eliminadoEn: null },
    select: { id: true, vendedorId: true, compradorId: true },
  })
  if (!operacion) throw new Error("Operación no encontrada o estado incorrecto")

  await prisma.$transaction(async (tx) => {
    await tx.pago.updateMany({ where: { operacionId, estado: "PENDIENTE" }, data: { estado: "RECIBIDO", confirmadoPorId: adminId, confirmadoEn: new Date() } })
    await tx.operacion.update({ where: { id: operacionId }, data: { estado: "PAGO_RECIBIDO" } })
    await tx.auditoria.create({
      data: {
        entidad: "Operacion", entidadId: operacionId,
        accion: "CONFIRMAR_PAGO", estadoAnterior: "PAGO_PENDIENTE", estadoNuevo: "PAGO_RECIBIDO",
        actorId: adminId,
      },
    })
  })

  return { vendedorId: operacion.vendedorId, compradorId: operacion.compradorId }
}

export async function notificarVendedor(operacionId: string, adminId: string) {
  const operacion = await prisma.operacion.findFirst({
    where: { id: operacionId, estado: "PAGO_RECIBIDO", eliminadoEn: null },
    select: { id: true, vendedorId: true },
  })
  if (!operacion) throw new Error("Operación no encontrada o estado incorrecto")

  // Verificar que el vendedor tiene datos completos antes de notificar (dinero en juego)
  const { verificarCuentaBancariaActiva } = await import("@/services/cuenta-bancaria.service")
  const [vendedorDatos, tieneCuenta] = await Promise.all([
    prisma.usuario.findUnique({
      where: { id: operacion.vendedorId },
      select: { nombres: true, apellidos: true, dni: true },
    }),
    verificarCuentaBancariaActiva(operacion.vendedorId),
  ])

  const faltantes: string[] = []
  if (!vendedorDatos?.nombres) faltantes.push("nombres")
  if (!vendedorDatos?.apellidos) faltantes.push("apellidos")
  if (!vendedorDatos?.dni) faltantes.push("DNI")
  if (!tieneCuenta) faltantes.push("cuenta bancaria")

  if (faltantes.length > 0) {
    await prisma.auditoria.create({
      data: {
        entidad: "Operacion", entidadId: operacionId,
        accion: "OPERACION_BLOQUEADA_CUENTA_BANCARIA",
        actorId: adminId,
        descripcion: `El vendedor debe completar: ${faltantes.join(", ")}`,
      },
    })
    throw new Error(`El vendedor debe completar su perfil antes de proceder: falta ${faltantes.join(", ")}.`)
  }

  await prisma.$transaction(async (tx) => {
    await tx.operacion.update({ where: { id: operacionId }, data: { estado: "VENDEDOR_NOTIFICADO" } })
    await tx.auditoria.create({
      data: {
        entidad: "Operacion", entidadId: operacionId,
        accion: "NOTIFICAR_VENDEDOR", estadoAnterior: "PAGO_RECIBIDO", estadoNuevo: "VENDEDOR_NOTIFICADO",
        actorId: adminId,
      },
    })
  })

  return operacion.vendedorId
}

export async function marcarTransferida(operacionId: string, adminId: string) {
  const operacion = await prisma.operacion.findFirst({
    where: { id: operacionId, estado: "TRANSFERENCIA_EN_PROCESO", eliminadoEn: null },
    select: { id: true, publicacionId: true, compradorId: true },
  })
  if (!operacion) throw new Error("Operación no encontrada o estado incorrecto")

  // Guard de idempotencia
  const publicacion = await prisma.publicacion.findUnique({
    where: { id: operacion.publicacionId },
    select: { estado: true },
  })
  if (publicacion?.estado === "TRANSFERIDA") {
    throw new Error("La transferencia ya fue marcada como válida anteriormente")
  }

  const ahora = new Date()
  const fechaLimite = calcularFechaLimite(ahora)

  await prisma.$transaction(async (tx) => {
    await tx.operacion.update({
      where: { id: operacionId },
      data: {
        estado: "PENDIENTE_CONFIRMACION_COMPRADOR",
        fechaTransferenciaValidada: ahora,
        fechaInicioConfirmacion: ahora,
        fechaLimiteConfirmacion: fechaLimite,
        motivoLiberacion: null,
      },
    })
    await tx.publicacion.update({ where: { id: operacion.publicacionId }, data: { estado: "TRANSFERIDA" } })
    await tx.auditoria.create({
      data: {
        entidad: "Operacion", entidadId: operacionId,
        accion: "MARCAR_TRANSFERIDA",
        estadoAnterior: "TRANSFERENCIA_EN_PROCESO",
        estadoNuevo: "PENDIENTE_CONFIRMACION_COMPRADOR",
        actorId: adminId,
        descripcion: `Plazo de confirmación hasta ${fechaLimite.toISOString()}`,
      },
    })
  })

  return { compradorId: operacion.compradorId, fechaLimite }
}

export async function liberarFondos(operacionId: string, adminId: string) {
  const operacion = await prisma.operacion.findFirst({
    where: {
      id: operacionId,
      estado: { in: ["COMPRADOR_CONFIRMADO", "PENDIENTE_CONFIRMACION_COMPRADOR"] },
      eliminadoEn: null,
    },
    select: { id: true, publicacionId: true, vendedorId: true, estado: true },
  })
  if (!operacion) throw new Error("Operación no encontrada o estado incorrecto")

  await prisma.$transaction(async (tx) => {
    await tx.operacion.update({
      where: { id: operacionId },
      data: {
        estado: "FONDOS_LIBERADOS",
        liberadoPorId: adminId,
        fechaLiberacion: new Date(),
        motivoLiberacion: "MANUAL",
      },
    })
    await tx.publicacion.update({ where: { id: operacion.publicacionId }, data: { estado: "COMPLETADA" } })
    await tx.auditoria.create({
      data: {
        entidad: "Operacion", entidadId: operacionId,
        accion: "LIBERAR_FONDOS",
        estadoAnterior: operacion.estado,
        estadoNuevo: "FONDOS_LIBERADOS",
        actorId: adminId,
      },
    })
  })

  return operacion.vendedorId
}

export async function cancelarOperacionAdmin(operacionId: string, adminId: string, reembolso: boolean) {
  const operacion = await prisma.operacion.findFirst({
    where: { id: operacionId, eliminadoEn: null },
    select: { id: true, publicacionId: true, compradorId: true, vendedorId: true, estado: true, montoCompradorCentimos: true },
  })
  if (!operacion) throw new Error("Operación no encontrada")

  const estadosFinales = ["FONDOS_LIBERADOS", "REEMBOLSADA", "CANCELADA"]
  if (estadosFinales.includes(operacion.estado)) throw new Error("La operación ya está en estado final")
  if (operacion.estado === "EN_DISPUTA") throw new Error("La operación tiene una disputa activa — resuélvela antes de cancelar")

  // Si la entrada ya fue transferida físicamente (pub TRANSFERIDA o COMPLETADA),
  // no puede volver a DISPONIBLE — se cancela sin posibilidad de reventa.
  const publicacion = await prisma.publicacion.findUnique({
    where: { id: operacion.publicacionId },
    select: { estado: true },
  })
  const pubYaTransferida = publicacion?.estado === "TRANSFERIDA" || publicacion?.estado === "COMPLETADA"
  const estadoPubNuevo = pubYaTransferida ? "CANCELADA" : "DISPONIBLE"

  const estadoNuevo = reembolso ? "REEMBOLSADA" : "CANCELADA"

  await prisma.$transaction(async (tx) => {
    if (reembolso) {
      await tx.pago.updateMany({ where: { operacionId, estado: "RECIBIDO" }, data: { estado: "DEVUELTO" } })
      await tx.reembolso.create({
        data: {
          operacionId,
          tipo: "TOTAL",
          motivo: "INCUMPLIMIENTO_VENDEDOR",
          montoDevueltoCompradorCentimos: operacion.montoCompradorCentimos,
          procesadoPorId: adminId,
        },
      })
    }
    await tx.operacion.update({ where: { id: operacionId }, data: { estado: estadoNuevo } })
    await tx.publicacion.update({ where: { id: operacion.publicacionId }, data: { estado: estadoPubNuevo } })
    await tx.auditoria.create({
      data: {
        entidad: "Operacion", entidadId: operacionId,
        accion: reembolso ? "REEMBOLSAR" : "CANCELAR_ADMIN",
        estadoAnterior: operacion.estado, estadoNuevo,
        actorId: adminId,
      },
    })
  })

  return { compradorId: operacion.compradorId, vendedorId: operacion.vendedorId }
}

// ─── Lecturas extendidas ──────────────────────────────────────────────────────

export async function listarOperacionesAdmin(estado?: string, busqueda?: string) {
  const where: Record<string, unknown> = { eliminadoEn: null }
  if (estado) where.estado = estado

  if (busqueda) {
    const q = busqueda.trim()
    where.OR = [
      { id: { contains: q, mode: "insensitive" } },
      { publicacion: { nombreEvento: { contains: q, mode: "insensitive" } } },
      { comprador: { nombre: { contains: q, mode: "insensitive" } } },
      { vendedor: { nombre: { contains: q, mode: "insensitive" } } },
    ]
  }

  return prisma.operacion.findMany({
    where: where as never,
    orderBy: { creadoEn: "desc" },
    include: {
      publicacion: { select: { nombreEvento: true, fechaEvento: true } },
      comprador: { select: { nombre: true, email: true } },
      vendedor: { select: { nombre: true, email: true } },
    },
  })
}

export async function obtenerOperacionAdmin(operacionId: string) {
  return prisma.operacion.findFirst({
    where: { id: operacionId, eliminadoEn: null },
    include: {
      publicacion: {
        select: {
          id: true, nombreEvento: true, fechaEvento: true, lugarEvento: true,
          zona: true, asiento: true, ticketera: true, ticketeraEnum: true, imagenPortadaUrl: true, estado: true,
        },
      },
      comprador: { select: { id: true, nombre: true, email: true, telefono: true } },
      vendedor: {
        select: {
          id: true, nombre: true, nombres: true, apellidos: true, dni: true, email: true, telefono: true,
          cuentasBancarias: {
            where: { activo: true, eliminadoEn: null },
            select: { id: true, banco: true, tipoCuenta: true, numeroCuenta: true, cci: true, titular: true, documentoTitular: true },
            take: 1,
          },
        },
      },
      pagos: { orderBy: { creadoEn: "desc" } },
      evidencias: { orderBy: { id: "desc" } },
      disputa: {
        include: {
          evidencias: { orderBy: { creadoEn: "desc" } },
        },
      },
    },
  })
}

export async function obtenerResumenVendedor(vendedorId: string) {
  const [activas, enCustodia, completadas] = await Promise.all([
    prisma.operacion.count({
      where: {
        vendedorId,
        estado: { notIn: ["CANCELADA", "FONDOS_LIBERADOS", "REEMBOLSADA"] },
        eliminadoEn: null,
      },
    }),
    prisma.operacion.aggregate({
      where: {
        vendedorId,
        estado: { in: ["PAGO_RECIBIDO", "VENDEDOR_NOTIFICADO", "TRANSFERENCIA_EN_PROCESO", "PENDIENTE_CONFIRMACION_COMPRADOR", "COMPRADOR_CONFIRMADO"] },
        eliminadoEn: null,
      },
      _sum: { montoVendedorCentimos: true },
    }),
    prisma.operacion.count({
      where: { vendedorId, estado: "FONDOS_LIBERADOS", eliminadoEn: null },
    }),
  ])

  return {
    activas,
    enCustodiaCentimos: enCustodia._sum.montoVendedorCentimos ?? 0,
    completadas,
  }
}
