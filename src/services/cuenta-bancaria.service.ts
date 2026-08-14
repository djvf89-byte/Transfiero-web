import { prisma } from "@/lib/prisma"
import type { CuentaBancariaInput } from "@/lib/validators/perfil.schema"

export async function obtenerCuentaBancariaActiva(usuarioId: string) {
  return prisma.cuentaBancaria.findFirst({
    where: { usuarioId, activo: true, eliminadoEn: null },
    select: {
      id: true, banco: true, tipoCuenta: true, numeroCuenta: true,
      cci: true, titular: true, documentoTitular: true, activo: true,
    },
  })
}

export async function crearCuentaBancaria(usuarioId: string, datos: CuentaBancariaInput) {
  await prisma.$transaction(async (tx) => {
    // Desactivar cuenta anterior si existe
    await tx.cuentaBancaria.updateMany({
      where: { usuarioId, activo: true },
      data: { activo: false },
    })

    await tx.cuentaBancaria.create({
      data: {
        usuarioId,
        banco: datos.banco,
        tipoCuenta: datos.tipoCuenta,
        numeroCuenta: datos.numeroCuenta,
        cci: datos.cci || null,
        titular: datos.titular,
        documentoTitular: datos.documentoTitular,
        activo: true,
      },
    })

    await tx.auditoria.create({
      data: {
        entidad: "Usuario", entidadId: usuarioId,
        accion: "CUENTA_BANCARIA_CREADA",
        actorId: usuarioId,
        descripcion: `Banco: ${datos.banco}, Tipo: ${datos.tipoCuenta}`,
      },
    })
  })
}

export async function actualizarCuentaBancaria(
  cuentaId: string,
  usuarioId: string,
  datos: CuentaBancariaInput
) {
  const cuenta = await prisma.cuentaBancaria.findFirst({
    where: { id: cuentaId, usuarioId, eliminadoEn: null },
  })
  if (!cuenta) throw new Error("Cuenta bancaria no encontrada")

  await prisma.$transaction(async (tx) => {
    await tx.cuentaBancaria.update({
      where: { id: cuentaId },
      data: {
        banco: datos.banco,
        tipoCuenta: datos.tipoCuenta,
        numeroCuenta: datos.numeroCuenta,
        cci: datos.cci || null,
        titular: datos.titular,
        documentoTitular: datos.documentoTitular,
        activo: true,
      },
    })

    await tx.auditoria.create({
      data: {
        entidad: "Usuario", entidadId: usuarioId,
        accion: "CUENTA_BANCARIA_ACTUALIZADA",
        actorId: usuarioId,
        descripcion: `Banco: ${datos.banco}, Tipo: ${datos.tipoCuenta}`,
      },
    })
  })
}

export async function verificarCuentaBancariaActiva(usuarioId: string): Promise<boolean> {
  const cuenta = await prisma.cuentaBancaria.findFirst({
    where: { usuarioId, activo: true, eliminadoEn: null },
    select: { id: true },
  })
  return !!cuenta
}
