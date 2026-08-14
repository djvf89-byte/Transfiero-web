import { cn } from "@/lib/utils"
import type { EstadoPublicacion } from "@prisma/client"

const CONFIG: Record<EstadoPublicacion, { label: string; clase: string }> = {
  BORRADOR: { label: "Borrador", clase: "bg-gray-100 text-gray-700" },
  PENDIENTE_REVISION: { label: "En revisión", clase: "bg-yellow-100 text-yellow-800" },
  APROBADA: { label: "Aprobada", clase: "bg-blue-100 text-blue-800" },
  DISPONIBLE: { label: "Disponible", clase: "bg-green-100 text-green-800" },
  PENDIENTE_VENDEDOR: { label: "Reserva pendiente", clase: "bg-amber-100 text-amber-800" },
  RESERVADA: { label: "Reservada", clase: "bg-orange-100 text-orange-800" },
  EN_TRANSFERENCIA: { label: "En transferencia", clase: "bg-purple-100 text-purple-800" },
  TRANSFERIDA: { label: "Transferida", clase: "bg-indigo-100 text-indigo-800" },
  COMPLETADA: { label: "Completada", clase: "bg-emerald-100 text-emerald-800" },
  CANCELADA: { label: "Cancelada", clase: "bg-red-100 text-red-700" },
  EN_DISPUTA: { label: "En disputa", clase: "bg-rose-100 text-rose-800" },
}

export function EstadoBadge({ estado }: { estado: EstadoPublicacion }) {
  const { label, clase } = CONFIG[estado] ?? { label: estado, clase: "bg-gray-100 text-gray-700" }
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", clase)}>
      {label}
    </span>
  )
}
