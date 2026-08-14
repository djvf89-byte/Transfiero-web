import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/password"
import { randomBytes } from "crypto"

export async function buscarUsuarioPorEmail(email: string) {
  return prisma.usuario.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      nombre: true,
      passwordHash: true,
      rolPrincipal: true,
      estadoVendedor: true,
      estadoCuenta: true,
    },
  })
}

export async function crearUsuario(datos: {
  nombre: string
  email: string
  password: string
}) {
  const passwordHash = await hashPassword(datos.password)

  return prisma.usuario.create({
    data: {
      nombre: datos.nombre,
      email: datos.email,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      nombre: true,
      rolPrincipal: true,
      estadoVendedor: true,
      estadoCuenta: true,
    },
  })
}

export async function buscarUsuarioPorId(id: string) {
  return prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      nombres: true,
      apellidos: true,
      dni: true,
      email: true,
      telefono: true,
      rolPrincipal: true,
      estadoVendedor: true,
      estadoCuenta: true,
      creadoEn: true,
    },
  })
}

export async function actualizarDatosPersonales(
  usuarioId: string,
  datos: { nombres: string; apellidos: string; dni: string; telefono?: string | null }
) {
  const nombreCompleto = `${datos.nombres.trim()} ${datos.apellidos.trim()}`

  try {
    await prisma.$transaction(async (tx) => {
      await tx.usuario.update({
        where: { id: usuarioId },
        data: {
          nombres: datos.nombres.trim(),
          apellidos: datos.apellidos.trim(),
          nombre: nombreCompleto,
          dni: datos.dni.trim(),
          telefono: datos.telefono?.trim() || null,
        },
      })
      await tx.auditoria.create({
        data: {
          entidad: "Usuario", entidadId: usuarioId,
          accion: "PERFIL_ACTUALIZADO",
          actorId: usuarioId,
          descripcion: "Datos personales actualizados",
        },
      })
    })
  } catch (err: unknown) {
    const e = err as { code?: string }
    if (e?.code === "P2002") throw new Error("El DNI ya está registrado en otra cuenta")
    throw err
  }
}

export async function verificarPerfilVendedorCompleto(usuarioId: string): Promise<{
  completo: boolean
  faltaNombres: boolean
  faltaApellidos: boolean
  faltaDni: boolean
}> {
  const u = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { nombres: true, apellidos: true, dni: true },
  })
  const faltaNombres = !u?.nombres
  const faltaApellidos = !u?.apellidos
  const faltaDni = !u?.dni
  return {
    completo: !faltaNombres && !faltaApellidos && !faltaDni,
    faltaNombres,
    faltaApellidos,
    faltaDni,
  }
}

// ─── Recuperación de contraseña ──────────────────────────────────────────────

const RESET_PREFIX = "reset:"
const RESET_EXPIRY_MS = 60 * 60 * 1000 // 1 hora

export async function crearTokenRecuperacion(email: string): Promise<string | null> {
  const usuario = await buscarUsuarioPorEmail(email)
  if (!usuario) return null // No revelar si el email existe

  const identifier = `${RESET_PREFIX}${email}`
  const token = randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + RESET_EXPIRY_MS)

  // Eliminar tokens anteriores del mismo email
  await prisma.verificationToken.deleteMany({ where: { identifier } })

  await prisma.verificationToken.create({ data: { identifier, token, expires } })

  return token
}

export async function validarTokenRecuperacion(token: string) {
  const registro = await prisma.verificationToken.findFirst({
    where: { token, identifier: { startsWith: RESET_PREFIX } },
  })
  if (!registro) return null
  if (registro.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: registro.identifier, token } },
    })
    return null
  }
  const email = registro.identifier.replace(RESET_PREFIX, "")
  return { email, identifier: registro.identifier }
}

// ─── Admin: gestión de usuarios ──────────────────────────────────────────────

export async function listarUsuariosAdmin(buscar?: string) {
  return prisma.usuario.findMany({
    where: buscar
      ? {
          OR: [
            { nombre: { contains: buscar, mode: "insensitive" } },
            { email: { contains: buscar, mode: "insensitive" } },
          ],
        }
      : {},
    select: {
      id: true,
      nombre: true,
      email: true,
      rolPrincipal: true,
      estadoVendedor: true,
      estadoCuenta: true,
      creadoEn: true,
    },
    orderBy: { creadoEn: "desc" },
    take: 100,
  })
}

export async function suspenderUsuario(usuarioId: string, adminId: string) {
  if (usuarioId === adminId) throw new Error("No puedes suspenderte a ti mismo")

  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { estadoCuenta: true },
  })
  if (!usuario) throw new Error("Usuario no encontrado")
  if (usuario.estadoCuenta === "SUSPENDIDO") throw new Error("El usuario ya está suspendido")

  await prisma.$transaction(async (tx) => {
    await tx.usuario.update({ where: { id: usuarioId }, data: { estadoCuenta: "SUSPENDIDO" } })
    await tx.auditoria.create({
      data: {
        entidad: "Usuario", entidadId: usuarioId,
        accion: "SUSPENDER", estadoAnterior: "ACTIVO", estadoNuevo: "SUSPENDIDO",
        actorId: adminId,
      },
    })
  })
}

export async function reactivarUsuario(usuarioId: string, adminId: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { estadoCuenta: true },
  })
  if (!usuario) throw new Error("Usuario no encontrado")
  if (usuario.estadoCuenta === "ACTIVO") throw new Error("El usuario ya está activo")

  await prisma.$transaction(async (tx) => {
    await tx.usuario.update({ where: { id: usuarioId }, data: { estadoCuenta: "ACTIVO" } })
    await tx.auditoria.create({
      data: {
        entidad: "Usuario", entidadId: usuarioId,
        accion: "REACTIVAR", estadoAnterior: "SUSPENDIDO", estadoNuevo: "ACTIVO",
        actorId: adminId,
      },
    })
  })
}

export async function consumirTokenYActualizarPassword(
  token: string,
  identifier: string,
  nuevaPassword: string
): Promise<boolean> {
  const email = identifier.replace(RESET_PREFIX, "")
  const usuario = await buscarUsuarioPorEmail(email)
  if (!usuario) return false

  const passwordHash = await hashPassword(nuevaPassword)

  await prisma.$transaction([
    prisma.usuario.update({ where: { id: usuario.id }, data: { passwordHash } }),
    prisma.verificationToken.delete({ where: { identifier_token: { identifier, token } } }),
  ])

  return true
}
