"use client"

import { useState } from "react"
import Link from "next/link"
import { recuperarContrasenaAction } from "@/app/actions/auth.actions"

export default function RecuperarPage() {
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const res = await recuperarContrasenaAction(formData)
    if (res?.error) setError(res.error)
    else setEnviado(true)
    setLoading(false)
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-white">Recuperar contraseña</h1>
        <p className="mt-1 text-sm text-white/50">
          Te enviaremos un enlace para crear una nueva contraseña.
        </p>
      </div>

      {enviado ? (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
          <p className="text-3xl mb-3">✉️</p>
          <p className="text-sm font-semibold text-green-400 mb-1">Revisa tu correo</p>
          <p className="text-xs text-white/40">
            Si el email está registrado, recibirás un enlace en los próximos minutos.
          </p>
          <Link
            href="/auth/login"
            className="mt-4 inline-block text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            ← Volver al inicio de sesión
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70" htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="tu@email.com"
              className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-amber-500/60 focus:bg-white/8"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-bold text-gray-900 transition hover:opacity-90 disabled:opacity-60 shadow-[0_4px_24px_rgba(245,158,11,0.35)]"
          >
            {loading ? "Enviando..." : "Enviar enlace de recuperación"}
          </button>

          <p className="text-center text-sm text-white/40">
            <Link href="/auth/login" className="font-semibold text-amber-400 hover:text-amber-300 transition-colors">
              ← Volver al inicio de sesión
            </Link>
          </p>
        </form>
      )}
    </>
  )
}
