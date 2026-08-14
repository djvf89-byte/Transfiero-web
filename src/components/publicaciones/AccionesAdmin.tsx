"use client"

import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import {
  aprobarPublicacionAction,
  rechazarPublicacionAction,
} from "@/app/actions/publicacion.actions"

export function AccionesAdmin({ id }: { id: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [mostrarRechazo, setMostrarRechazo] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleAprobar() {
    if (!confirm("¿Aprobar esta publicación? Quedará disponible en el marketplace.")) return
    setError(null)
    startTransition(async () => {
      const res = await aprobarPublicacionAction(id)
      if (res?.error) { setError(res.error); return }
      router.refresh()
    })
  }

  function handleRechazar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await rechazarPublicacionAction(id, formData)
      if (res?.error) { setError(res.error); return }
      router.refresh()
    })
  }

  return (
    <div className="space-y-4 border-t border-white/8 pt-6">
      {error && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {!mostrarRechazo ? (
        <div className="flex gap-3">
          <button
            onClick={handleAprobar}
            disabled={isPending}
            className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity shadow-[0_4px_16px_rgba(34,197,94,0.3)]"
          >
            {isPending ? "Procesando..." : "Aprobar y publicar"}
          </button>
          <button
            onClick={() => setMostrarRechazo(true)}
            disabled={isPending}
            className="rounded-xl border border-red-500/30 bg-red-500/8 px-5 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/15 disabled:opacity-50 transition-colors"
          >
            Rechazar
          </button>
        </div>
      ) : (
        <form onSubmit={handleRechazar} className="space-y-3">
          <label className="block text-sm font-semibold text-white/70">
            Motivo del rechazo <span className="text-red-400">*</span>
          </label>
          <textarea
            name="motivoRechazo"
            required
            rows={3}
            minLength={10}
            maxLength={500}
            placeholder="Explica brevemente por qué se rechaza la publicación..."
            className="block w-full rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-red-500/50 focus:bg-white/8"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Rechazando..." : "Confirmar rechazo"}
            </button>
            <button
              type="button"
              onClick={() => setMostrarRechazo(false)}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
