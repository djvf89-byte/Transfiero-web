// Todos los montos son enteros en céntimos. Ejemplo: S/ 200.00 = 20000.
// No usar floats. Math.round garantiza que no queden fracciones de céntimo.

const TASA_COMISION_COMPRADOR = 0.07
const TASA_COMISION_VENDEDOR = 0.03
const TASA_PRECIO_MAXIMO = 1.10

export interface ResumenFinancieroCentimos {
  precioVentaCentimos: number
  comisionCompradorCentimos: number
  comisionVendedorCentimos: number
  montoCompradorCentimos: number
  montoVendedorCentimos: number
  ingresoTransfieroCentimos: number
}

/**
 * Calcula el resumen financiero completo a partir del precio de venta.
 * Todos los parámetros y resultados son enteros en céntimos.
 */
export function calcularResumenFinanciero(
  precioVentaCentimos: number
): ResumenFinancieroCentimos {
  const comisionCompradorCentimos = Math.round(precioVentaCentimos * TASA_COMISION_COMPRADOR)
  const comisionVendedorCentimos = Math.round(precioVentaCentimos * TASA_COMISION_VENDEDOR)

  return {
    precioVentaCentimos,
    comisionCompradorCentimos,
    comisionVendedorCentimos,
    montoCompradorCentimos: precioVentaCentimos + comisionCompradorCentimos,
    montoVendedorCentimos: precioVentaCentimos - comisionVendedorCentimos,
    ingresoTransfieroCentimos: comisionCompradorCentimos + comisionVendedorCentimos,
  }
}

/**
 * Devuelve el precio máximo permitido de venta en céntimos.
 * precioOriginalCentimos + 10%
 */
export function calcularPrecioMaximoCentimos(precioOriginalCentimos: number): number {
  return Math.round(precioOriginalCentimos * TASA_PRECIO_MAXIMO)
}

/**
 * Valida que el precio de venta sea mayor a 0 y no supere el límite del +10%.
 * Todos los parámetros son enteros en céntimos.
 */
export function validarPrecioVenta(
  precioVentaCentimos: number,
  precioOriginalCentimos: number
): { valido: boolean; error?: string } {
  if (precioVentaCentimos <= 0) {
    return { valido: false, error: "El precio de venta debe ser mayor a S/ 0.00" }
  }

  const maximoCentimos = calcularPrecioMaximoCentimos(precioOriginalCentimos)
  if (precioVentaCentimos > maximoCentimos) {
    const maximoSoles = (maximoCentimos / 100).toFixed(2)
    return {
      valido: false,
      error: `El precio máximo permitido es S/ ${maximoSoles} (precio original + 10%)`,
    }
  }

  return { valido: true }
}

/** Convierte soles (número decimal) a céntimos enteros. Solo usar en boundaries de UI. */
export function solesToCentimos(soles: number): number {
  return Math.round(soles * 100)
}

/** Convierte céntimos enteros a soles para mostrar en UI. */
export function centimosToCurrency(centimos: number): string {
  return `S/ ${(centimos / 100).toFixed(2)}`
}
