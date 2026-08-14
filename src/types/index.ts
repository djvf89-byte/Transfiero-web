// ─── Fuente de verdad: schema.prisma → tipos generados → validadores Zod → UI
//
// Los tipos de entidades (User, Listing, Operation, Dispute, etc.) se importan
// desde @prisma/client después de `prisma generate` en el Módulo 2.
//
// Este archivo re-exporta ÚNICAMENTE:
//   1. Constantes de negocio (states, roles, permissions)
//   2. Tipos computados que Prisma no genera
//   3. Tipos de API genéricos

// Constantes de dominio
export * from "@/constants/states"
export * from "@/constants/roles"
export * from "@/constants/permissions"

// Tipos computados (no son modelos de DB)
export * from "./operation.types"
export * from "./audit.types"

// Tipos de API
export type ApiResponse<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; codigo?: string }
