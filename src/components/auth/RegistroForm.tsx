"use client"

import { useActionState } from "react"
import Link from "next/link"
import { registroAction } from "@/app/actions/auth.actions"

const initialState = { error: undefined as string | undefined }

export function RegistroForm() {
  const [state, action, isPending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      return (await registroAction(formData)) ?? initialState
    },
    initialState
  )

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">{state.error}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="nombre" className="text-sm font-medium text-white/70">Nombre completo</label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          placeholder="Juan Pérez"
          required
          autoComplete="name"
          className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-amber-500/60 focus:bg-white/8"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-white/70">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-amber-500/60 focus:bg-white/8"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-white/70">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          required
          autoComplete="new-password"
          className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-amber-500/60 focus:bg-white/8"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-white/70">Confirmar contraseña</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Repite tu contraseña"
          required
          autoComplete="new-password"
          className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-amber-500/60 focus:bg-white/8"
        />
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="terminos"
          required
          className="mt-0.5 h-4 w-4 shrink-0 accent-amber-500 cursor-pointer"
        />
        <span className="text-sm text-white/50 leading-snug">
          He leído y acepto los{" "}
          <Link href="/terminos" target="_blank" className="font-semibold text-amber-400 hover:text-amber-300 transition-colors">
            Términos y condiciones
          </Link>{" "}
          y la{" "}
          <Link href="/privacidad" target="_blank" className="font-semibold text-amber-400 hover:text-amber-300 transition-colors">
            Política de privacidad
          </Link>
          .
        </span>
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-bold text-gray-900 transition hover:opacity-90 disabled:opacity-60 shadow-[0_4px_24px_rgba(245,158,11,0.35)]"
      >
        {isPending ? "Creando cuenta..." : "Crear cuenta gratis"}
      </button>

      <p className="text-center text-sm text-white/40">
        ¿Ya tienes cuenta?{" "}
        <Link href="/auth/login" className="font-semibold text-amber-400 hover:text-amber-300 transition-colors">
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}
