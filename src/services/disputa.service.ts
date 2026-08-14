import { prisma } from "@/lib/prisma"

// ─── Abrir disputa (comprador) ────────────────────────────────────────────────

export async function abrirDisputa(
  operacionId: string,
  compradorId: string,
  motivo: string
) {
  const operacion = await prisma.operacion.findFirst({
    where: {
      id: operacionId,
      compradorId,
      estado: { in: ["PENDIENTE_CONFIRMACION_COMPRADOR", "TRANSFERENCIA_EN_PROCESO"] },
      eliminadoEn: null,
    },
    select: { id: true, publicacionId: true, vendedorId: true, estado: true, disputa: { select: { id: true } } },
  })
  if (!operacion) throw new Error("Operación no encontrada o no puedes abrir una disputa ahora")
  if (operacion.disputa) throw new Error("Ya existe una disputa para esta operación")

  await prisma.$transaction(async (tx) => {
    await tx.disputa.create({
      data: { operacionId, abridaPorId: compradorId, motivo, estado: "ABIERTA" },
    })
    await tx.operacion.update({ where: { id: operacionId }, data: { estado: "EN_DISPUTA" } })
    await tx.publicacion.update({ where: { id: operacion.publicacionId }, data: { estado: "EN_DISPUTA" } })
    await tx.auditoria.create({
      data: {
        entidad: "Operacion", entidadId: operacionId,
        accion: "ABRIR_DISPUTA",
        estadoAnterior: operacion.estado,
        estadoNuevo: "EN_DISPUTA",
        actorId: compradorId,
      },
    })
  })

  return { vendedorId: operacion.vendedorId }
}

// ─── Subir evidencia de disputa (comprador o vendedor) ────────────────────────

export async function subirEvidenciaDisputa(
  disputaId: string,
  usuarioId: string,
  datos: { url: string; cloudinaryId: string }
) {
  const disputa = await prisma.disputa.findFirst({
    where: { id: disputaId, estado: { in: ["ABIERTA", "EN_REVISION"] } },
    select: { id: true, operacion: { select: { compradorId: true, vendedorId: true, id: true } } },
  })
  if (!disputa) throw new Error("Disputa no encontrada o ya fue resuelta")

  const esParte =
    disputa.operacion.compradorId === usuarioId ||
    disputa.operacion.vendedorId === usuarioId
  if (!esParte) throw new Error("No tienes permiso para subir evidencia en esta disputa")

  await prisma.$transaction(async (tx) => {
    await tx.evidencia.create({
      data: {
        tipo: "DISPUTA",
        url: datos.url,
        cloudinaryId: datos.cloudinaryId,
        disputaId,
        subidoPorId: usuarioId,
      },
    })
    await tx.auditoria.create({
      data: {
        entidad: "Disputa", entidadId: disputaId,
        accion: "SUBIR_EVIDENCIA_DISPUTA",
        actorId: usuarioId,
      },
    })
  })

  return { operacionId: disputa.operacion.id }
}

// ─── Resolver disputa (admin) ─────────────────────────────────────────────────

export async function resolverDisputa(
  disputaId: string,
  adminId: string,
  favor: "VENDEDOR" | "COMPRADOR",
  nota?: string
) {
  const disputa = await prisma.disputa.findFirst({
    where: { id: disputaId, estado: { in: ["ABIERTA", "EN_REVISION"] } },
    select: {
      id: true,
      operacion: {
        select: { id: true, publicacionId: true, compradorId: true, vendedorId: true, montoCompradorCentimos: true },
      },
    },
  })
  if (!disputa) throw new Error("Disputa no encontrada o ya fue resuelta")

  const op = disputa.operacion
  const estadoDisputaNuevo = (
    favor === "VENDEDOR" ? "RESUELTA_VENDEDOR" : "RESUELTA_COMPRADOR"
  ) as "RESUELTA_VENDEDOR" | "RESUELTA_COMPRADOR"
  const disputaData = {
    estado: estadoDisputaNuevo,
    resueltosPorId: adminId,
    resueltaEn: new Date(),
    resolucionNota: nota ?? null,
  }

  if (favor === "VENDEDOR") {
    await prisma.$transaction(async (tx) => {
      await tx.operacion.update({
        where: { id: op.id },
        data: { estado: "FONDOS_LIBERADOS", liberadoPorId: adminId, fechaLiberacion: new Date() },
      })
      await tx.publicacion.update({ where: { id: op.publicacionId }, data: { estado: "COMPLETADA" } })
      await tx.disputa.update({ where: { id: disputaId }, data: disputaData })
      await tx.auditoria.create({
        data: {
          entidad: "Operacion", entidadId: op.id,
          accion: "RESOLVER_DISPUTA_VENDEDOR", estadoAnterior: "EN_DISPUTA", estadoNuevo: "FONDOS_LIBERADOS",
          actorId: adminId,
        },
      })
    })
  } else {
    await prisma.$transaction(async (tx) => {
      await tx.pago.updateMany({ where: { operacionId: op.id, estado: "RECIBIDO" }, data: { estado: "DEVUELTO" } })
      await tx.operacion.update({ where: { id: op.id }, data: { estado: "REEMBOLSADA" } })
      await tx.publicacion.update({ where: { id: op.publicacionId }, data: { estado: "CANCELADA" } })
      await tx.disputa.update({ where: { id: disputaId }, data: disputaData })
      await tx.reembolso.create({
        data: {
          operacionId: op.id,
          tipo: "TOTAL",
          motivo: "DISPUTA_RESUELTA_COMPRADOR",
          montoDevueltoCompradorCentimos: op.montoCompradorCentimos,
          procesadoPorId: adminId,
        },
      })
      await tx.auditoria.create({
        data: {
          entidad: "Operacion", entidadId: op.id,
          accion: "RESOLVER_DISPUTA_COMPRADOR", estadoAnterior: "EN_DISPUTA", estadoNuevo: "REEMBOLSADA",
          actorId: adminId,
        },
      })
    })
  }

  return { compradorId: op.compradorId, vendedorId: op.vendedorId }
}
