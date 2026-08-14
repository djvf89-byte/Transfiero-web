import type { EntradaAuditoria } from "@/types"

// Construye una entrada de auditoría tipada lista para persistir.
// La escritura a DB se realiza desde los servicios con prisma.auditoria.create().
export function construirEntradaAuditoria(entrada: EntradaAuditoria): EntradaAuditoria {
  return entrada
}
