// Única fuente de verdad para estados y transiciones de la plataforma

// ─── Estados de publicación de entrada ───────────────────────────────────────

export const ESTADOS_ENTRADA = {
  BORRADOR: "BORRADOR",
  PENDIENTE_REVISION: "PENDIENTE_REVISION",
  APROBADA: "APROBADA",
  DISPONIBLE: "DISPONIBLE",
  PENDIENTE_VENDEDOR: "PENDIENTE_VENDEDOR",
  RESERVADA: "RESERVADA",
  EN_TRANSFERENCIA: "EN_TRANSFERENCIA",
  TRANSFERIDA: "TRANSFERIDA",
  COMPLETADA: "COMPLETADA",
  CANCELADA: "CANCELADA",
  EN_DISPUTA: "EN_DISPUTA",
} as const

export type EstadoEntrada = (typeof ESTADOS_ENTRADA)[keyof typeof ESTADOS_ENTRADA]

// ─── Estados de operación ─────────────────────────────────────────────────────

export const ESTADOS_OPERACION = {
  ESPERANDO_VENDEDOR: "ESPERANDO_VENDEDOR",
  PAGO_PENDIENTE: "PAGO_PENDIENTE",
  PAGO_RECIBIDO: "PAGO_RECIBIDO",
  VENDEDOR_NOTIFICADO: "VENDEDOR_NOTIFICADO",
  TRANSFERENCIA_EN_PROCESO: "TRANSFERENCIA_EN_PROCESO",
  PENDIENTE_CONFIRMACION_COMPRADOR: "PENDIENTE_CONFIRMACION_COMPRADOR",
  COMPRADOR_CONFIRMADO: "COMPRADOR_CONFIRMADO",
  FONDOS_LIBERADOS: "FONDOS_LIBERADOS",
  REEMBOLSADA: "REEMBOLSADA",
  EN_DISPUTA: "EN_DISPUTA",
  CANCELADA: "CANCELADA",
} as const

export type EstadoOperacion = (typeof ESTADOS_OPERACION)[keyof typeof ESTADOS_OPERACION]

// ─── Estados terminales (no se puede revertir) ────────────────────────────────

export const ESTADOS_TERMINALES_OPERACION: EstadoOperacion[] = [
  ESTADOS_OPERACION.FONDOS_LIBERADOS,
  ESTADOS_OPERACION.REEMBOLSADA,
  ESTADOS_OPERACION.CANCELADA,
]

// ─── Transiciones válidas de entrada ─────────────────────────────────────────

export const TRANSICIONES_ENTRADA: Record<EstadoEntrada, EstadoEntrada[]> = {
  BORRADOR: [ESTADOS_ENTRADA.PENDIENTE_REVISION],
  PENDIENTE_REVISION: [ESTADOS_ENTRADA.APROBADA, ESTADOS_ENTRADA.CANCELADA],
  APROBADA: [ESTADOS_ENTRADA.DISPONIBLE],
  DISPONIBLE: [ESTADOS_ENTRADA.PENDIENTE_VENDEDOR, ESTADOS_ENTRADA.CANCELADA],
  PENDIENTE_VENDEDOR: [
    ESTADOS_ENTRADA.DISPONIBLE,       // vendedor rechazó o reserva expiró
    ESTADOS_ENTRADA.RESERVADA,        // vendedor aceptó
    ESTADOS_ENTRADA.CANCELADA,
  ],
  RESERVADA: [
    ESTADOS_ENTRADA.EN_TRANSFERENCIA, // pago confirmado
    ESTADOS_ENTRADA.CANCELADA,
  ],
  EN_TRANSFERENCIA: [ESTADOS_ENTRADA.TRANSFERIDA, ESTADOS_ENTRADA.EN_DISPUTA],
  TRANSFERIDA: [ESTADOS_ENTRADA.COMPLETADA, ESTADOS_ENTRADA.EN_DISPUTA],
  COMPLETADA: [],
  CANCELADA: [],
  EN_DISPUTA: [ESTADOS_ENTRADA.COMPLETADA, ESTADOS_ENTRADA.CANCELADA],
}

// ─── Transiciones válidas de operación ───────────────────────────────────────

export const TRANSICIONES_OPERACION: Record<EstadoOperacion, EstadoOperacion[]> = {
  ESPERANDO_VENDEDOR: [ESTADOS_OPERACION.PAGO_PENDIENTE, ESTADOS_OPERACION.CANCELADA],
  PAGO_PENDIENTE: [ESTADOS_OPERACION.PAGO_RECIBIDO, ESTADOS_OPERACION.CANCELADA],
  PAGO_RECIBIDO: [ESTADOS_OPERACION.VENDEDOR_NOTIFICADO],
  VENDEDOR_NOTIFICADO: [
    ESTADOS_OPERACION.TRANSFERENCIA_EN_PROCESO,
    ESTADOS_OPERACION.REEMBOLSADA,
  ],
  TRANSFERENCIA_EN_PROCESO: [
    ESTADOS_OPERACION.PENDIENTE_CONFIRMACION_COMPRADOR,
    // COMPRADOR_CONFIRMADO mantiene compatibilidad con ops pre-migración
    ESTADOS_OPERACION.COMPRADOR_CONFIRMADO,
    ESTADOS_OPERACION.EN_DISPUTA,
  ],
  PENDIENTE_CONFIRMACION_COMPRADOR: [
    ESTADOS_OPERACION.COMPRADOR_CONFIRMADO,
    ESTADOS_OPERACION.FONDOS_LIBERADOS,  // liberación automática por plazo
    ESTADOS_OPERACION.EN_DISPUTA,
  ],
  COMPRADOR_CONFIRMADO: [ESTADOS_OPERACION.FONDOS_LIBERADOS],
  FONDOS_LIBERADOS: [],
  REEMBOLSADA: [],
  EN_DISPUTA: [ESTADOS_OPERACION.FONDOS_LIBERADOS, ESTADOS_OPERACION.REEMBOLSADA],
  CANCELADA: [],
}

// ─── Helpers de validación ────────────────────────────────────────────────────

export function esTransicionEntradaValida(
  desde: EstadoEntrada,
  hacia: EstadoEntrada
): boolean {
  return TRANSICIONES_ENTRADA[desde]?.includes(hacia) ?? false
}

export function esTransicionOperacionValida(
  desde: EstadoOperacion,
  hacia: EstadoOperacion
): boolean {
  return TRANSICIONES_OPERACION[desde]?.includes(hacia) ?? false
}

export function obtenerTransicionesEntrada(estado: EstadoEntrada): EstadoEntrada[] {
  return TRANSICIONES_ENTRADA[estado] ?? []
}

export function obtenerTransicionesOperacion(estado: EstadoOperacion): EstadoOperacion[] {
  return TRANSICIONES_OPERACION[estado] ?? []
}
