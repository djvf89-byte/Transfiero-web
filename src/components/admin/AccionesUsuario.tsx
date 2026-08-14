"use client"

import { useState, useTransition } from "react"
import { suspenderUsuarioAction, reactivarUsuarioAction } from "@/app/actions/usuario.actions"

interface Props {
  usuarioId: string
  estadoCuenta: string
  esMismoAdmin: boolean
}

export function AccionesUsuario({ usuarioId, estadoCuenta, esMismoAdmin }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [confirmar, setConfirmar] = useState(false)

  if (esMismoAdmin) {
    return <span className="text-xs text-gray-400">Tu cuenta</span>
  }

  const esSuspendido = estadoCuenta === "SUSPENDIDO"

  function handleAccion() {
    if (!esSuspendido && !confirmar) {
      setConfirmar(true)
      return
    }
    startTransition(async () => {
      const res = esSuspendido
        ? await reactivarUsuarioAction(usuarioId)
        : await suspenderUsuarioAction(usuarioId)

      if (res?.error) setError(res.error)
      setConfirmar(false)
    })
  }

  if (confirmar) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600">¿Suspender?</span>
        <button
          onClick={handleAccion}
          disabled={pending}
          className="text-xs font-semibold text-red-700 hover:underline disabled:opacity-50"
        >
          Sí
        </button>
        <button
          onClick={() => setConfirmar(false)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleAccion}
        disabled={pending}
        className={`text-xs font-semibold hover:underline disabled:opacity-50 ${
          esSuspendido ? "text-green-700" : "text-red-600"
        }`}
      >
        {pending ? "..." : esSuspendido ? "Reactivar" : "Suspender"}
      </button>
      {error && <p className="text-[10px] text-red-600">{error}</p>}
    </div>
  )
}
