interface Props {
  nombre: string
  ventasCompletadas: number
  disputasAbiertas?: number
}

function nombreParcial(nombre: string): string {
  const partes = nombre.trim().split(/\s+/)
  if (partes.length === 1) return partes[0]
  return `${partes[0]} ${partes[1][0]}.`
}

function estrellas(ventas: number): string {
  if (ventas >= 20) return "★★★★★"
  if (ventas >= 10) return "★★★★☆"
  if (ventas >= 5)  return "★★★☆☆"
  if (ventas >= 2)  return "★★☆☆☆"
  return "★☆☆☆☆"
}

export function ReputacionVendedor({ nombre, ventasCompletadas, disputasAbiertas = 0 }: Props) {
  const iniciales = nombre
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const nivel =
    ventasCompletadas >= 20
      ? { label: "Top vendedor", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" }
      : ventasCompletadas >= 5
      ? { label: "Vendedor confiable", color: "text-green-700", bg: "bg-green-50 border-green-200" }
      : { label: "Vendedor verificado", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" }

  return (
    <div className="border-t border-gray-100 pt-3 mt-1">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        Vendedor
      </p>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1E4799] text-sm font-bold text-white">
          {iniciales}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900">{nombreParcial(nombre)}</p>
            <span className="inline-flex items-center gap-1 rounded-full border bg-green-50 border-green-200 px-2 py-0.5 text-[10px] font-semibold text-green-700">
              ✓ Verificado
            </span>
          </div>
          <div className="mt-0.5 text-sm text-amber-500 tracking-wider leading-none">
            {estrellas(ventasCompletadas)}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
            <span className="text-xs text-gray-500">
              ✓{" "}
              <span className="font-semibold text-gray-700">{ventasCompletadas}</span>{" "}
              {ventasCompletadas === 1 ? "venta exitosa" : "ventas exitosas"}
            </span>
            <span className="text-xs text-gray-500">
              🛡{" "}
              <span className="font-semibold text-gray-700">{disputasAbiertas}</span>{" "}
              {disputasAbiertas === 1 ? "disputa" : "disputas"}
            </span>
          </div>
          <div className="mt-1.5">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${nivel.bg} ${nivel.color}`}>
              {nivel.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
