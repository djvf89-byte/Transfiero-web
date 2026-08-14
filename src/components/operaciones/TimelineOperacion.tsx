import type { EstadoOperacion } from "@prisma/client"

interface Paso {
  key: EstadoOperacion
  label: string
  descripcion: string
}

const PASOS_COMPRADOR: Paso[] = [
  { key: "ESPERANDO_VENDEDOR",       label: "Reserva enviada",        descripcion: "Esperando que el vendedor acepte" },
  { key: "PAGO_PENDIENTE",           label: "Realiza tu pago",        descripcion: "El vendedor aceptó — procede con el pago" },
  { key: "PAGO_RECIBIDO",            label: "Pago confirmado",        descripcion: "Transfiero recibió tu pago" },
  { key: "VENDEDOR_NOTIFICADO",      label: "Esperando transferencia",descripcion: "El vendedor está transfiriendo tu entrada" },
  { key: "TRANSFERENCIA_EN_PROCESO", label: "Entrada en camino",      descripcion: "Verificando la transferencia" },
  { key: "COMPRADOR_CONFIRMADO",     label: "Confirma la recepción",  descripcion: "¿Recibiste la entrada? Confirma para cerrar" },
  { key: "FONDOS_LIBERADOS",         label: "¡Operación completada!", descripcion: "Entrada recibida y pago liberado al vendedor" },
]

function posicionActual(estado: EstadoOperacion): number {
  const orden = PASOS_COMPRADOR.findIndex((p) => p.key === estado)
  if (estado === "CANCELADA" || estado === "REEMBOLSADA") return -1
  return orden >= 0 ? orden : PASOS_COMPRADOR.length - 1
}

function formatFecha(fecha: Date | null | undefined): string {
  if (!fecha) return ""
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(fecha))
}

interface Props {
  estado: EstadoOperacion
  creadoEn: Date
  vendedorAceptoEn?: Date | null
}

export function TimelineOperacion({ estado, creadoEn, vendedorAceptoEn }: Props) {
  if (estado === "CANCELADA") {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center">
        <p className="text-sm font-semibold text-red-600">Operación cancelada</p>
        <p className="mt-1 text-xs text-red-400">Esta reserva fue cancelada o expiró</p>
      </div>
    )
  }

  if (estado === "REEMBOLSADA") {
    return (
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-center">
        <p className="text-sm font-semibold text-blue-600">Pago reembolsado</p>
        <p className="mt-1 text-xs text-blue-400">Tu pago fue devuelto correctamente</p>
      </div>
    )
  }

  const posicion = posicionActual(estado)

  const fechas: Record<number, string> = {
    0: formatFecha(creadoEn),
    1: vendedorAceptoEn ? formatFecha(vendedorAceptoEn) : "",
  }

  return (
    <div className="relative pl-6">
      <div className="absolute left-[9px] top-3 bottom-3 w-0.5 bg-gray-200" />
      <div className="space-y-4">
        {PASOS_COMPRADOR.map((paso, idx) => {
          const completo = idx < posicion
          const actual = idx === posicion

          return (
            <div key={paso.key} className="relative flex items-start gap-3">
              <div
                className={`absolute -left-6 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-white ${
                  completo
                    ? "bg-green-500"
                    : actual
                    ? "bg-amber-500"
                    : "bg-gray-200"
                } ${actual ? "ring-4 ring-amber-100" : ""}`}
              />
              <div className="min-w-0">
                <p
                  className={`text-sm font-semibold ${
                    completo ? "text-gray-700" : actual ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {paso.label}
                </p>
                {(completo || actual) && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {actual ? paso.descripcion : (fechas[idx] || paso.descripcion)}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
