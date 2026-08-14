import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { listarUsuariosAdmin } from "@/services/usuario.service"
import { AccionesUsuario } from "@/components/admin/AccionesUsuario"
import type { RolUsuario, EstadoCuenta } from "@prisma/client"

const ROL_CONFIG: Record<RolUsuario, { label: string; color: string }> = {
  ADMINISTRADOR: { label: "Admin",    color: "bg-purple-100 text-purple-800" },
  VENDEDOR:      { label: "Vendedor", color: "bg-blue-100 text-blue-800" },
  COMPRADOR:     { label: "Comprador", color: "bg-gray-100 text-gray-700" },
}

const ESTADO_CONFIG: Record<EstadoCuenta, { label: string; color: string }> = {
  ACTIVO:     { label: "Activo",     color: "bg-green-100 text-green-800" },
  SUSPENDIDO: { label: "Suspendido", color: "bg-red-100 text-red-700" },
  BANEADO:    { label: "Baneado",    color: "bg-gray-200 text-gray-700" },
}

function formatFecha(fecha: Date) {
  return new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", year: "numeric" }).format(new Date(fecha))
}

interface PageProps {
  searchParams: Promise<{ buscar?: string }>
}

export default async function AdminUsuariosPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session) redirect("/auth/login")

  const { buscar } = await searchParams
  const usuarios = await listarUsuariosAdmin(buscar?.trim() || undefined)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Usuarios</h1>
          <p className="mt-1 text-sm text-gray-500">{usuarios.length} resultado{usuarios.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Búsqueda */}
      <form method="GET" className="mb-5">
        <div className="flex gap-2">
          <input
            name="buscar"
            defaultValue={buscar ?? ""}
            placeholder="Buscar por nombre o email..."
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#1B3A6B] focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#1B3A6B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#152d54] transition-colors"
          >
            Buscar
          </button>
          {buscar && (
            <a
              href="/admin/usuarios"
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Limpiar
            </a>
          )}
        </div>
      </form>

      {usuarios.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
          <p className="text-gray-400">No se encontraron usuarios</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Usuario</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Rol</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Estado</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Miembro desde</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map((u) => {
                const rolCfg = ROL_CONFIG[u.rolPrincipal]
                const estadoCfg = ESTADO_CONFIG[u.estadoCuenta]
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-900">{u.nombre}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${rolCfg.color}`}>
                        {rolCfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${estadoCfg.color}`}>
                        {estadoCfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">{formatFecha(u.creadoEn)}</td>
                    <td className="px-5 py-3 text-right">
                      <AccionesUsuario
                        usuarioId={u.id}
                        estadoCuenta={u.estadoCuenta}
                        esMismoAdmin={u.id === session.user.id}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
