// El modelo Auditoria viene de @prisma/client tras `prisma generate`.
// Este archivo contiene el tipo helper para construir entradas antes de persistirlas.

export type TipoEntidadAuditoria =
  | "Usuario"
  | "Publicacion"
  | "Operacion"
  | "Pago"
  | "Disputa"
  | "SolicitudVendedor"
  | "Retiro"

export interface EntradaAuditoria {
  entidad: TipoEntidadAuditoria
  entidadId: string
  accion: string
  estadoAnterior?: string
  estadoNuevo?: string
  actorId?: string
  ip?: string
}
