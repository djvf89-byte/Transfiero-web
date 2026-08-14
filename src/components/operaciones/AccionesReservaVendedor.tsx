"use client"

import { useState, useEffect, useTransition } from "react"
import { aceptarReservaAction, rechazarReservaAction } from "@/app/actions/operacion.actions"

function calcularRestante(expiraEn: string): number {
  return Math.max(0, new Date(expiraEn).getTime() - Date.now())
}

function formatTiempo(ms: number): string {
  const seg = Math.floor(ms / 1000)
  const min = Math.floor(seg / 60)
  const s = seg % 60
  return `${min}:${s.toString().padStart(2, "0")}`
}

interface Props {
  operacionId: string
  reservaExpiraEn: string
}

export function AccionesReservaVendedor({ operacionId, reservaExpiraEn }: Props) {
  const [restante, setRestante] = useState(() => calcularRestante(reservaExpiraEn))
  const [isPending, startTransition] = useTransition()
  const [resultado, setResultado] = useState<{ ok?: boolean; error?: string } | null>(null)

  useEffect(() => {
    if (restante <= 0) return
    const id = setInterval(() => {
      setRestante(calcularRestante(reservaExpiraEn))
    }, 1000)
    return () => clearInterval(id)
  }, [reservaExpiraEn, restante])

  const expirada = restante <= 0
  const urgente = restante < 5 * 60 * 1000 && !expirada

  function handleAceptar() {
    startTransition(async () => {
      const res = await aceptarReservaAction(operacionId)
      setResultado(res)
    })
  }

  function handleRechazar() {
    if (!confirm("¿Seguro que quieres rechazar esta reserva? La entrada volverá al marketplace.")) return
    startTransition(async () => {
      const res = await rechazarReservaAction(operacionId)
      setResultado(res)
    })
  }

  if (resultado?.ok) {
    return (
      <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-center">
        <p className="text-sm font-semibold text-green-700">✓ Acción registrada</p>
        <p className="mt-1 text-xs text-green-500">La página se actualizará en breve</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Timer */}
      {!expirada && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold ${
            urgente
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }`}
        >
          <span>⏱</span>
          <span>Tiempo para responder: {formatTiempo(restante)}</span>
        </div>
      )}

      {expirada && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 text-center">
          La reserva ha expirado
        </div>
      )}

      {!expirada && (
        <div className="flex gap-3">
          <button
            onClick={handleAceptar}
            disabled={isPending}
            className="flex-1 rounded-lg bg-green-100 px-4 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-200 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Procesando..." : "✓ Aceptar reserva"}
          </button>
          <button
            onClick={handleRechazar}
            disabled={isPending}
            className="flex-1 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            ✕ Rechazar
          </button>
        </div>
      )}

      {resultado?.error && (
        <p className="text-xs text-red-600 text-center">{resultado.error}</p>
      )}
    </div>
  )
}
