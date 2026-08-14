"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { marcarLeidaAction, marcarTodasLeidasAction } from "@/app/actions/notificacion.actions"

interface Notificacion {
  id: string
  titulo: string
  cuerpo: string
  url: string | null
  leida: boolean
  creadoEn: Date
}

function formatFecha(fecha: Date) {
  const ahora = new Date()
  const diff = ahora.getTime() - new Date(fecha).getTime()
  const mins = Math.floor(diff / 60000)
  const horas = Math.floor(diff / 3600000)
  const dias = Math.floor(diff / 86400000)

  if (mins < 1) return "ahora"
  if (mins < 60) return `hace ${mins} min`
  if (horas < 24) return `hace ${horas}h`
  if (dias < 7) return `hace ${dias}d`
  return new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short" }).format(new Date(fecha))
}

interface Props {
  notificaciones: Notificacion[]
  sinLeer: number
}

export function ListaNotificaciones({ notificaciones, sinLeer }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  async function handleClick(notif: Notificacion) {
    if (!notif.leida) {
      await marcarLeidaAction(notif.id)
    }
    if (notif.url) {
      router.push(notif.url)
    }
  }

  function handleMarcarTodas() {
    startTransition(async () => {
      await marcarTodasLeidasAction()
    })
  }

  if (notificaciones.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] py-20 text-center">
        <p className="text-3xl mb-3">🔔</p>
        <p className="text-white/60 font-medium">No tienes notificaciones</p>
        <p className="text-white/35 text-sm mt-1">Te avisaremos cuando haya novedades sobre tus operaciones.</p>
      </div>
    )
  }

  return (
    <div>
      {sinLeer > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-amber-400 font-semibold">
            {sinLeer} sin leer
          </p>
          <button
            onClick={handleMarcarTodas}
            disabled={pending}
            className="text-xs font-semibold text-white/50 hover:text-white transition-colors disabled:opacity-50"
          >
            Marcar todas como leídas
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] divide-y divide-white/6">
        {notificaciones.map((notif) => (
          <div
            key={notif.id}
            onClick={() => handleClick(notif)}
            className={`flex items-start gap-4 px-5 py-4 transition-colors ${
              notif.url ? "cursor-pointer hover:bg-white/[0.04]" : ""
            } ${!notif.leida ? "bg-amber-500/[0.06]" : ""}`}
          >
            <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!notif.leida ? "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]" : "bg-transparent"}`} />
            <div className="min-w-0 flex-1">
              <p className={`text-sm ${!notif.leida ? "font-semibold text-white" : "font-medium text-white/60"}`}>
                {notif.titulo}
              </p>
              <p className="mt-0.5 text-sm text-white/40 leading-relaxed">{notif.cuerpo}</p>
            </div>
            <span className="shrink-0 text-xs text-white/25 mt-0.5">{formatFecha(notif.creadoEn)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
