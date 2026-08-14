"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { guardarCuentaBancariaAction } from "@/app/actions/perfil.actions"
import { BANCOS_PERU } from "@/lib/validators/perfil.schema"

interface CuentaExistente {
  id: string
  banco: string
  tipoCuenta: "AHORROS" | "CORRIENTE"
  numeroCuenta: string
  cci: string | null
  titular: string
  documentoTitular: string
}

interface Props {
  cuentaActual: CuentaExistente | null
}

export function CuentaBancariaForm({ cuentaActual }: Props) {
  const router = useRouter()
  const [editando, setEditando] = useState(!cuentaActual)

  const [banco, setBanco] = useState(cuentaActual?.banco ?? "")
  const [tipoCuenta, setTipoCuenta] = useState<"AHORROS" | "CORRIENTE">(cuentaActual?.tipoCuenta ?? "AHORROS")
  const [numeroCuenta, setNumeroCuenta] = useState(cuentaActual?.numeroCuenta ?? "")
  const [cci, setCci] = useState(cuentaActual?.cci ?? "")
  const [titular, setTitular] = useState(cuentaActual?.titular ?? "")
  const [documentoTitular, setDocumentoTitular] = useState(cuentaActual?.documentoTitular ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guardado, setGuardado] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setGuardado(false)

    const res = await guardarCuentaBancariaAction(
      { banco, tipoCuenta, numeroCuenta, cci: cci || undefined, titular, documentoTitular },
      cuentaActual?.id
    )
    setLoading(false)

    if (res?.error) {
      setError(res.error)
    } else {
      setGuardado(true)
      setEditando(false)
      router.refresh()
    }
  }

  // Vista de solo lectura
  if (!editando && cuentaActual) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-green-500/20 bg-green-500/8 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-green-400 uppercase tracking-wider">✓ Cuenta activa</span>
            <button
              onClick={() => { setEditando(true); setGuardado(false) }}
              className="text-xs text-white/40 underline hover:text-white/70 transition-colors"
            >
              Cambiar
            </button>
          </div>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-white/45">Banco</dt>
              <dd className="font-semibold text-white">{cuentaActual.banco}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/45">Tipo</dt>
              <dd className="font-semibold text-white">{cuentaActual.tipoCuenta === "AHORROS" ? "Ahorros" : "Corriente"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/45">N° cuenta</dt>
              <dd className="font-semibold text-white font-mono">{"•".repeat(Math.max(0, cuentaActual.numeroCuenta.length - 4))}{cuentaActual.numeroCuenta.slice(-4)}</dd>
            </div>
            {cuentaActual.cci && (
              <div className="flex justify-between">
                <dt className="text-white/45">CCI</dt>
                <dd className="font-semibold text-white font-mono">{"•".repeat(16)}{cuentaActual.cci.slice(-4)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-white/45">Titular</dt>
              <dd className="font-semibold text-white">{cuentaActual.titular}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/45">DNI titular</dt>
              <dd className="font-semibold text-white">{cuentaActual.documentoTitular}</dd>
            </div>
          </dl>
        </div>
      </div>
    )
  }

  // Formulario de edición
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {guardado && (
        <div className="rounded-xl border border-green-500/25 bg-green-500/8 px-4 py-3 text-sm text-green-400">
          ✓ Cuenta bancaria guardada correctamente
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/60">Banco *</label>
          <select
            value={banco}
            onChange={(e) => setBanco(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0C1B3F] px-4 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
          >
            <option value="">Selecciona un banco</option>
            {BANCOS_PERU.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/60">Tipo de cuenta *</label>
          <div className="flex gap-2 mt-1">
            {(["AHORROS", "CORRIENTE"] as const).map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => setTipoCuenta(tipo)}
                className={`flex-1 rounded-xl border py-2.5 text-xs font-semibold transition-colors ${
                  tipoCuenta === tipo
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                    : "border-white/10 bg-white/5 text-white/50 hover:border-white/20"
                }`}
              >
                {tipo === "AHORROS" ? "Ahorros" : "Corriente"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/60">Número de cuenta *</label>
          <input
            value={numeroCuenta}
            onChange={(e) => setNumeroCuenta(e.target.value.replace(/\D/g, "").slice(0, 20))}
            placeholder="Solo dígitos"
            inputMode="numeric"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white font-mono placeholder:text-white/25 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/60">
            CCI <span className="text-white/30">(opcional, 20 dígitos)</span>
          </label>
          <input
            value={cci}
            onChange={(e) => setCci(e.target.value.replace(/\D/g, "").slice(0, 20))}
            placeholder="00219100012345678901"
            inputMode="numeric"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white font-mono placeholder:text-white/25 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/60">Nombre del titular *</label>
          <input
            value={titular}
            onChange={(e) => setTitular(e.target.value)}
            placeholder="Nombre completo como aparece en la cuenta"
            maxLength={120}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/60">DNI del titular *</label>
          <input
            value={documentoTitular}
            onChange={(e) => setDocumentoTitular(e.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="12345678"
            maxLength={8}
            inputMode="numeric"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white font-mono placeholder:text-white/25 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
          />
          <p className="mt-1 text-xs text-white/30">{documentoTitular.length}/8 dígitos</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 px-4 py-3 text-sm font-bold text-gray-900 hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? "Guardando..." : cuentaActual ? "Actualizar cuenta" : "Guardar cuenta bancaria"}
        </button>
        {cuentaActual && (
          <button
            type="button"
            onClick={() => { setEditando(false); setError(null) }}
            className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/50 hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
