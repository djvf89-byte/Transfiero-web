"use client"

import { useState } from "react"
import type { Ticketera } from "@prisma/client"
import { InstruccionesTicketera } from "./InstruccionesTicketera"

const OPCIONES: { value: Ticketera; label: string }[] = [
  { value: "JOINNUS", label: "Joinnus" },
  { value: "TELETICKET", label: "Teleticket" },
  { value: "TICKETMASTER", label: "Ticketmaster" },
]

// Mismo estilo dark que el resto del formulario
const SELECT =
  "mt-1 block w-full rounded-xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-white outline-none transition focus:border-amber-500/60 focus:bg-white/8 [&>option]:bg-[#0d1224] [&>option]:text-white"
const LABEL = "block text-xs font-semibold uppercase tracking-wider text-white/40"

interface Props {
  defaultValue?: Ticketera | null
  required?: boolean
}

export function TicketeraSelect({ defaultValue, required = true }: Props) {
  const [seleccion, setSeleccion] = useState<Ticketera | "">(defaultValue ?? "")

  return (
    <div className="space-y-4">
      <div>
        <label className={LABEL}>
          Ticketera de la entrada{required && <span className="ml-1 text-red-400">*</span>}
        </label>
        <select
          name="ticketeraEnum"
          required={required}
          value={seleccion}
          onChange={(e) => setSeleccion(e.target.value as Ticketera | "")}
          className={SELECT}
        >
          <option value="" disabled className="bg-[#0d1224]">
            Selecciona la ticketera…
          </option>
          {OPCIONES.map((op) => (
            <option key={op.value} value={op.value} className="bg-[#0d1224]">
              {op.label}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-white/30">
          ¿No ves tu ticketera? Escríbenos para agregarla.
        </p>
      </div>

      {seleccion && <InstruccionesTicketera ticketera={seleccion} />}
    </div>
  )
}
