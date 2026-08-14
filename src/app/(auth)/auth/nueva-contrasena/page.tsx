"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { nuevaContrasenaAction } from "@/app/actions/auth.actions"

function NuevaContrasenaForm() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get("token") ?? ""
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!token) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <p className="text-sm font-semibold text-red-400">
          El enlace de recuperación es inválido o ha expirado.
        </p>
        <Link
          href="/auth/recuperar"
          className="mt-3 inline-block text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
        >
          Solicitar un nuevo enlace →
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set("token", token)
    const res = await nuevaContrasenaAction(formData)
    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      router.push("/auth/login?recuperado=1")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-white/70" htmlFor="password">
          Nueva contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          placeholder="Mínimo 8 caracteres"
          className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-amber-500/60 focus:bg-white/8"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-white/70" htmlFor="confirmPassword">
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Repite la contraseña"
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
        {loading ? "Guardando..." : "Guardar nueva contraseña"}
      </button>
    </form>
  )
}

export default function NuevaContrasenaPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-white">Nueva contraseña</h1>
        <p className="mt-1 text-sm text-white/50">Elige una contraseña segura para tu cuenta.</p>
      </div>

      <Suspense fallback={<p className="text-center text-sm text-white/30">Verificando enlace...</p>}>
        <NuevaContrasenaForm />
      </Suspense>

      <p className="mt-4 text-center text-sm text-white/40">
        <Link href="/auth/login" className="font-semibold text-amber-400 hover:text-amber-300 transition-colors">
          ← Volver al inicio de sesión
        </Link>
      </p>
    </>
  )
}
