"use client"

import { useState } from "react"

interface Props {
  operacionId: string
  monto: string
}

export function BotonPagarMP({ operacionId, monto }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePagar() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/pagos/preferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operacionId }),
      })
      const data = await res.json() as { initPoint?: string; error?: string }
      if (!res.ok || !data.initPoint) {
        setError(data.error ?? "Error al iniciar el pago")
        return
      }
      window.location.href = data.initPoint
    } catch {
      setError("Error de conexión. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handlePagar}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#009EE3] px-5 py-3.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(0,158,227,0.3)] hover:bg-[#0088cc] disabled:opacity-60 transition-colors"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Redirigiendo a MercadoPago...
          </>
        ) : (
          <>
            <svg viewBox="0 0 48 48" className="h-5 w-5 shrink-0" aria-hidden="true">
              <path fill="currentColor" d="M24 4C12.96 4 4 12.96 4 24s8.96 20 20 20 20-8.96 20-20S35.04 4 24 4zm-2 28.5l-7-7 2.12-2.12L22 28.26l10.88-10.88L35 19.5l-13 13z"/>
            </svg>
            Pagar S/ {monto} con MercadoPago
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-[10px] text-white/25">
        <span>🔒</span>
        <span>Yape · Plin · Tarjeta de crédito/débito</span>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  )
}
