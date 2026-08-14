import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { listarNotificaciones } from "@/services/notificacion.service"
import { ListaNotificaciones } from "@/components/notificaciones/ListaNotificaciones"

export default async function NotificacionesPage() {
  const session = await auth()
  if (!session) redirect("/auth/login")

  const notificaciones = await listarNotificaciones(session.user.id)
  const sinLeer = notificaciones.filter((n) => !n.leida).length

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-white">Notificaciones</h1>
        {sinLeer > 0 && (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
            {sinLeer} nueva{sinLeer !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <ListaNotificaciones notificaciones={notificaciones} sinLeer={sinLeer} />
    </div>
  )
}
