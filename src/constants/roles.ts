// Fuente de verdad: schema.prisma → enums RolUsuario y EstadoVendedor
// Estas constantes replican los valores del enum para uso en lógica de cliente
// donde @prisma/client no está disponible (ej. middleware, componentes cliente).

export const ROLES = {
  COMPRADOR: "COMPRADOR",
  VENDEDOR: "VENDEDOR",
  ADMINISTRADOR: "ADMINISTRADOR",
} as const

export type RolUsuario = (typeof ROLES)[keyof typeof ROLES]

export const ESTADOS_VENDEDOR = {
  NO_SOLICITADO: "NO_SOLICITADO",
  PENDIENTE: "PENDIENTE",
  APROBADO: "APROBADO",
  RECHAZADO: "RECHAZADO",
  SUSPENDIDO: "SUSPENDIDO",
} as const

export type EstadoVendedor = (typeof ESTADOS_VENDEDOR)[keyof typeof ESTADOS_VENDEDOR]
