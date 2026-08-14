"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { abrirDisputaAction } from "@/app/actions/disputa.actions"

interface Props {
  operacionId: string
}

export function AbrirDisputaForm({ operacionId }: Props) {
  const router = useRouter()
  const [paso, setPaso] = useState<"motivo" | "confirmar">("motivo")
  const [motivo, setMotivo] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    const res = await abrirDisputaAction(operacionId, motivo)
    setSubmitting(false)
    if (res?.error) {
      setError(res.error)
      setPaso("motivo")
    } else {
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <h3 className="font-bold text-red-800 text-sm">Abrir disputa</h3>
        <p className="mt-1 text-xs text-red-600">
          Usa esta opción solo si no recibiste la entrada o la transferencia fue incorrecta.
          El equipo de Transfiero revisará el caso y tomará una decisión final.
        </p>
      </div>

      {paso === "motivo" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Describe el problema
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Explica en detalle qué ocurrió: qué entrada esperabas recibir y cuál fue el problema..."
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
            <p className="mt-1 text-right text-xs text-gray-400">{motivo.length} / mín. 20 caracteres</p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <button
            onClick={() => setPaso("confirmar")}
            disabled={motivo.trim().length < 20}
            className="w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-500 transition-colors disabled:opacity-50"
          >
            Continuar
          </button>
        </div>
      )}

      {paso === "confirmar" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-red-200 bg-white p-4 text-sm">
            <p className="font-semibold text-gray-700 mb-1">Tu motivo:</p>
            <p className="text-gray-600 leading-relaxed">{motivo}</p>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Al confirmar, la operación pasará a estado de disputa y los fondos quedarán retenidos hasta la resolución.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPaso("motivo")}
              disabled={submitting}
              className="rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Editar
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-500 transition-colors disabled:opacity-50"
            >
              {submitting ? "Abriendo..." : "Confirmar disputa"}
            </button>
          </div>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
        </div>
      )}
    </div>
  )
}
