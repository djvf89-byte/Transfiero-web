import type { Ticketera } from "@prisma/client"
import { TicketeraBadge } from "./TicketeraBadge"

interface InfoTicketera {
  nivel: string
  nivelColor: string
  metodo: string
  riesgo: string
  proteccion: string
}

const INFO: Record<Ticketera, InfoTicketera> = {
  TICKETMASTER: {
    nivel: "Alta",
    nivelColor: "text-green-700 bg-green-50 border-green-200",
    metodo:
      "Transferencia oficial por la plataforma de Ticketmaster, si el evento lo permite.",
    riesgo:
      "No todos los eventos habilitan la transferencia. El vendedor debe verificar que la opción está disponible.",
    proteccion:
      "Transfiero exige evidencia de la transferencia completada antes de liberar el pago al vendedor.",
  },
  JOINNUS: {
    nivel: "Media / Alta",
    nivelColor: "text-blue-700 bg-blue-50 border-blue-200",
    metodo:
      "Cambio de participante o titularidad dentro de Joinnus, si el evento lo permite.",
    riesgo:
      "Algunos eventos no permiten cambios de participante. Transfiero validará la evidencia antes de liberar el dinero.",
    proteccion:
      "El pago queda en custodia hasta que confirmes haber recibido la entrada válida. Si hay un problema, puedes abrir una disputa.",
  },
  TELETICKET: {
    nivel: "Media",
    nivelColor: "text-amber-700 bg-amber-50 border-amber-200",
    metodo:
      "Nominación, cambio de titularidad o entrega de PDF/QR, según el tipo de evento.",
    riesgo:
      "Si el evento no tiene cambio oficial de titular, la entrada se entrega como PDF o QR original, lo que puede implicar mayor riesgo. Transfiero lo indicará en la revisión.",
    proteccion:
      "El pago permanece retenido hasta que confirmes la validez de la entrada. Puedes abrir una disputa si el ticket no funciona.",
  },
}

interface Props {
  ticketera: Ticketera
}

export function RiesgoTicketera({ ticketera }: Props) {
  const info = INFO[ticketera]

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
          Transferencia de la entrada
        </h2>
        <TicketeraBadge ticketera={ticketera} />
      </div>

      <dl className="divide-y divide-gray-100 text-sm">
        <div className="flex justify-between gap-4 py-2.5">
          <dt className="text-gray-500 shrink-0">Seguridad</dt>
          <dd>
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${info.nivelColor}`}>
              {info.nivel}
            </span>
          </dd>
        </div>

        <div className="py-2.5 space-y-1">
          <dt className="text-gray-500">Método esperado</dt>
          <dd className="text-gray-800 font-medium mt-1">{info.metodo}</dd>
        </div>

        <div className="py-2.5 space-y-1">
          <dt className="text-gray-500">Riesgo</dt>
          <dd className="text-gray-700 mt-1">{info.riesgo}</dd>
        </div>

        <div className="py-2.5 space-y-1">
          <dt className="text-gray-500">Cómo te protege Transfiero</dt>
          <dd className="text-gray-700 mt-1">{info.proteccion}</dd>
        </div>
      </dl>

      <p className="mt-3 text-[11px] text-gray-400 leading-relaxed">
        Esta información es orientativa. Transfiero no garantiza transferencia y no afirma validar oficialmente con la ticketera.
      </p>
    </div>
  )
}
