// Los tipos de entidades (Operacion, Pago, etc.) vienen de @prisma/client
// tras `prisma generate`. Este archivo solo contiene tipos DERIVADOS.

// ResumenFinancieroCentimos viene de @/utils/pricing
// Re-exportarlo aquí para que sea accesible desde @/types
export type { ResumenFinancieroCentimos } from "@/utils/pricing"
