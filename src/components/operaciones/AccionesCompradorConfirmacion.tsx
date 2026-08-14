"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { confirmarRecepcionAction } from "@/app/actions/operacion.actions"

interface Props {
  operacionId: string
}

export function AccionesCompradorConfirmacion({ operacionId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirmar() {
    setLoading(true)
    setError(null)
    const res = await confirmarRecepcionAction(operacionId)
    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-bold text-green-800 mb-1">✓ La entrada fue transferida</p>
        <p className="text-sm text-green-700">
          El vendedor realizó la transferencia. Verifica que tienes acceso a la entrada antes de confirmar.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {!confirmando ? (
        <button
          onClick={() => setConfirmando(true)}
          className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-500 transition-colors"
        >
          Confirmar que recibí la entrada
        </button>
      ) : (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-3">
          <p className="text-sm font-semibold text-green-800">¿Verificaste que tienes acceso a la entrada?</p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirmar}
              disabled={loading}
              className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Confirmando..." : "Sí, confirmar"}
            </button>
            <button
              onClick={() => setConfirmando(false)}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Revisar más
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        ¿Hay un problema? Desplázate abajo para abrir una disputa.
      </p>
    </div>
  )
}
