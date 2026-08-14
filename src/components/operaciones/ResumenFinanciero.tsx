interface Props {
  precioVentaCentimos: number
  comisionCompradorCentimos: number
  montoCompradorCentimos: number
  /** Si es true, muestra lo que recibe el vendedor en lugar de lo que paga el comprador */
  modoVendedor?: boolean
  comisionVendedorCentimos?: number
  montoVendedorCentimos?: number
}

function formatSoles(centimos: number): string {
  return `S/ ${(centimos / 100).toFixed(2)}`
}

export function ResumenFinanciero({
  precioVentaCentimos,
  comisionCompradorCentimos,
  montoCompradorCentimos,
  modoVendedor = false,
  comisionVendedorCentimos = 0,
  montoVendedorCentimos = 0,
}: Props) {
  if (modoVendedor) {
    return (
      <div className="rounded-xl bg-gray-50 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Precio de venta</span>
          <span className="font-semibold">{formatSoles(precioVentaCentimos)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Comisión Transfiero (3%)</span>
          <span className="font-semibold text-red-500">− {formatSoles(comisionVendedorCentimos)}</span>
        </div>
        <div className="flex justify-between pt-3 mt-1 border-t border-gray-200 text-base font-extrabold">
          <span>Recibirás</span>
          <span className="text-[#1B3A6B]">{formatSoles(montoVendedorCentimos)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-gray-50 p-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Precio de entrada</span>
        <span className="font-semibold">{formatSoles(precioVentaCentimos)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Comisión Transfiero (7%)</span>
        <span className="font-semibold">{formatSoles(comisionCompradorCentimos)}</span>
      </div>
      <div className="flex justify-between pt-3 mt-1 border-t border-gray-200 text-lg font-extrabold">
        <span>Total a pagar</span>
        <span className="text-[#1B3A6B]">{formatSoles(montoCompradorCentimos)}</span>
      </div>
    </div>
  )
}

/** Versión estática (para la página de detalle pública, antes de reservar) */
export function ResumenFinancieroPublico({ precioVentaCentimos }: { precioVentaCentimos: number }) {
  const comision = Math.round(precioVentaCentimos * 0.07)
  const total = precioVentaCentimos + comision
  return (
    <ResumenFinanciero
      precioVentaCentimos={precioVentaCentimos}
      comisionCompradorCentimos={comision}
      montoCompradorCentimos={total}
    />
  )
}
