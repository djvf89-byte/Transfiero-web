"use client"

import { useActionState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { loginAction } from "@/app/actions/auth.actions"

const initialState = { error: undefined as string | undefined }

export function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"
  const [state, action, isPending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      formData.set("callbackUrl", callbackUrl)
      return (await loginAction(formData)) ?? initialState
    },
    initialState
  )

  const recuperado = searchParams.get("recuperado") === "1"

  return (
    <form action={action} className="space-y-4">
      {recuperado && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3">
          <p className="text-sm text-green-400">Contraseña actualizada. Ya puedes iniciar sesión.</p>
        </div>
      )}
      {state?.error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">{state.error}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-white/70">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-amber-500/60 focus:bg-white/8 focus:ring-0"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-white/70">Contraseña</label>
          <Link href="/auth/recuperar" className="text-xs text-white/40 hover:text-amber-400 transition-colors">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-amber-500/60 focus:bg-white/8 focus:ring-0"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-gray-900 transition hover:bg-amber-400 disabled:opacity-60 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
      >
        {isPending ? "Ingresando..." : "Ingresar"}
      </button>

      <p className="text-center text-sm text-white/40">
        ¿No tienes cuenta?{" "}
        <Link href="/auth/registro" className="font-semibold text-amber-400 hover:text-amber-300 transition-colors">
          Regístrate gratis
        </Link>
      </p>
    </form>
  )
}
