"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { crearReservaAction } from "@/app/actions/operacion.actions"
import { useState } from "react"

interface Props {
  publicacionId: string
  disponible: boolean
  autenticado: boolean
  esPropioVendedor: boolean
}

export function BotoneraReserva({ publicacionId, disponible, autenticado, esPropioVendedor }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleReservar() {
    if (!autenticado) {
      router.push("/auth/login")
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await crearReservaAction(publicacionId)
      if (res.error) {
        setError(res.error)
      } else if (res.operacionId) {
        router.push(`/mis-compras/${res.operacionId}`)
      }
    })
  }

  if (esPropioVendedor) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm text-gray-500">
        Esta es tu propia entrada
      </div>
    )
  }

  if (!disponible) {
    return (
      <button
        disabled
        className="w-full rounded-xl bg-gray-100 px-4 py-4 text-sm font-semibold text-gray-400 cursor-not-allowed"
      >
        No disponible
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleReservar}
        disabled={isPending}
        className="w-full rounded-xl bg-amber-500 px-4 py-4 text-base font-bold text-gray-900 hover:bg-amber-400 disabled:opacity-60 transition-colors shadow-md shadow-amber-500/20"
      >
        {isPending ? "Procesando..." : "🎟 Reservar entrada"}
      </button>
      {!autenticado && (
        <p className="text-center text-xs text-gray-400">
          Necesitas una cuenta para reservar
        </p>
      )}
      {error && <p className="text-center text-xs text-red-600">{error}</p>}
    </div>
  )
}
