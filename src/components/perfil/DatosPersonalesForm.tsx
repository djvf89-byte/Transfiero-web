"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { actualizarDatosPersonalesAction } from "@/app/actions/perfil.actions"

interface Props {
  inicial: {
    nombres: string | null
    apellidos: string | null
    dni: string | null
    telefono: string | null
  }
}

export function DatosPersonalesForm({ inicial }: Props) {
  const router = useRouter()
  const [nombres, setNombres] = useState(inicial.nombres ?? "")
  const [apellidos, setApellidos] = useState(inicial.apellidos ?? "")
  const [dni, setDni] = useState(inicial.dni ?? "")
  const [telefono, setTelefono] = useState(inicial.telefono ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guardado, setGuardado] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setGuardado(false)

    const res = await actualizarDatosPersonalesAction({ nombres, apellidos, dni, telefono: telefono || null })
    setLoading(false)

    if (res?.error) {
      setError(res.error)
    } else {
      setGuardado(true)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/60">Nombres *</label>
          <input
            value={nombres}
            onChange={(e) => { setNombres(e.target.value); setGuardado(false) }}
            placeholder="Ej: Juan Carlos"
            maxLength={80}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/60">Apellidos *</label>
          <input
            value={apellidos}
            onChange={(e) => { setApellidos(e.target.value); setGuardado(false) }}
            placeholder="Ej: Pérez García"
            maxLength={80}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/60">DNI *</label>
          <input
            value={dni}
            onChange={(e) => { setDni(e.target.value.replace(/\D/g, "").slice(0, 8)); setGuardado(false) }}
            placeholder="12345678"
            maxLength={8}
            inputMode="numeric"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
          />
          <p className="mt-1 text-xs text-white/30">{dni.length}/8 dígitos</p>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/60">Teléfono</label>
          <input
            value={telefono}
            onChange={(e) => { setTelefono(e.target.value); setGuardado(false) }}
            placeholder="+51 999 999 999"
            maxLength={20}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-3 text-sm text-red-400">{error}</div>
      )}
      {guardado && (
        <div className="rounded-xl border border-green-500/25 bg-green-500/8 px-4 py-3 text-sm text-green-400">
          ✓ Datos actualizados correctamente
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 px-4 py-3 text-sm font-bold text-gray-900 hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? "Guardando..." : "Guardar datos personales"}
      </button>
    </form>
  )
}
