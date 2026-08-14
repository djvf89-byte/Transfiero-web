"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registrarCuentaDestinoAction } from "@/app/actions/operacion.actions"
import {
  validarCuentaDestino,
  labelCuentaDestino,
  placeholderCuentaDestino,
} from "@/lib/validators/cuenta-destino"

interface Props {
  operacionId: string
  ticketeraEnum?: string | null
  valorActual?: string | null
}

export function CuentaDestinoForm({ operacionId, ticketeraEnum, valorActual }: Props) {
  const router = useRouter()
  const [editando, setEditando] = useState(!valorActual)
  const [valor, setValor] = useState(valorActual ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guardado, setGuardado] = useState(false)

  const label = labelCuentaDestino(ticketeraEnum)
  const placeholder = placeholderCuentaDestino(ticketeraEnum)

  async function handleGuardar() {
    const err = validarCuentaDestino(valor)
    if (err) { setError(err); return }

    setLoading(true)
    setError(null)
    const res = await registrarCuentaDestinoAction(operacionId, valor)
    setLoading(false)

    if (res?.error) {
      setError(res.error)
    } else {
      setGuardado(true)
      setEditando(false)
      router.refresh()
    }
  }

  // Modo lectura — ya guardado
  if (!editando && (valorActual || guardado)) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-green-700">
            ✓ {label}
          </p>
          <button
            onClick={() => { setEditando(true); setGuardado(false) }}
            className="text-xs text-gray-400 underline hover:text-gray-600"
          >
            Editar
          </button>
        </div>
        <p className="font-semibold text-gray-900 text-sm">{valor || valorActual}</p>
        <p className="text-xs text-gray-400">
          Usaremos este dato solo para completar la transferencia de esta operación.
        </p>
      </div>
    )
  }

  // Modo edición
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
      <div>
        <p className="text-sm font-bold text-amber-900">{label}</p>
        <p className="mt-0.5 text-xs text-amber-700">
          Este dato será compartido con el vendedor únicamente para realizar la transferencia
          de la entrada dentro de la ticketera.
        </p>
      </div>

      <div className="space-y-1.5">
        <input
          type="text"
          value={valor}
          onChange={(e) => { setValor(e.target.value); setError(null) }}
          placeholder={placeholder}
          maxLength={120}
          className="w-full rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
        <div className="flex justify-between">
          {error
            ? <p className="text-xs text-red-600">{error}</p>
            : <p className="text-xs text-gray-400">
                Usaremos este dato solo para completar la transferencia de esta operación.
              </p>
          }
          <p className="text-xs text-gray-400 shrink-0 ml-2">{valor.length}/120</p>
        </div>
      </div>

      <button
        onClick={handleGuardar}
        disabled={loading || valor.trim().length < 5}
        className="w-full rounded-xl bg-amber-600 py-2.5 text-sm font-bold text-white hover:bg-amber-500 disabled:opacity-50 transition-colors"
      >
        {loading ? "Guardando..." : valorActual ? "Actualizar dato" : "Guardar dato"}
      </button>

      {valorActual && (
        <button
          onClick={() => setEditando(false)}
          className="w-full text-xs text-gray-400 hover:text-gray-600"
        >
          Cancelar
        </button>
      )}
    </div>
  )
}
