import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { buscarUsuarioPorId } from "@/services/usuario.service"
import { obtenerUltimaSolicitud } from "@/services/solicitud.service"
import { obtenerCuentaBancariaActiva } from "@/services/cuenta-bancaria.service"
import { logoutAction } from "@/app/actions/auth.actions"
import { DatosPersonalesForm } from "@/components/perfil/DatosPersonalesForm"
import { CuentaBancariaForm } from "@/components/perfil/CuentaBancariaForm"

const ESTADO_VENDEDOR_CONFIG = {
  NO_SOLICITADO: { classes: "border border-white/15 bg-white/8 text-white/50", label: "No solicitado" },
  PENDIENTE:     { classes: "border border-amber-500/30 bg-amber-500/10 text-amber-400", label: "En revisión" },
  APROBADO:      { classes: "border border-green-500/30 bg-green-500/10 text-green-400", label: "Vendedor verificado" },
  RECHAZADO:     { classes: "border border-red-500/30 bg-red-500/10 text-red-400", label: "Solicitud rechazada" },
  SUSPENDIDO:    { classes: "border border-orange-500/30 bg-orange-500/10 text-orange-400", label: "Suspendido" },
}

export default async function PerfilPage() {
  const session = await auth()
  if (!session) redirect("/auth/login")

  const [usuario, ultimaSolicitud, cuentaBancaria] = await Promise.all([
    buscarUsuarioPorId(session.user.id),
    obtenerUltimaSolicitud(session.user.id),
    obtenerCuentaBancariaActiva(session.user.id),
  ])

  if (!usuario) redirect("/auth/login")

  const esVendedor = usuario.estadoVendedor === "APROBADO"
  const estadoVendedor = ESTADO_VENDEDOR_CONFIG[usuario.estadoVendedor]
  const puedeRequestar = ["NO_SOLICITADO", "RECHAZADO"].includes(usuario.estadoVendedor)

  const iniciales = usuario.nombre
    .split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()

  // Completitud para vendedores
  const datosCompletos = !!(usuario.nombres && usuario.apellidos && usuario.dni)
  const cuentaActiva = !!cuentaBancaria
  const perfilCompleto = datosCompletos && cuentaActiva

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-extrabold text-white">Mi perfil</h1>

      {/* Checklist "Preparado para cobrar" — solo para vendedores */}
      {esVendedor && (
        <div className={`mb-5 rounded-2xl border p-5 ${perfilCompleto ? "border-green-500/25 bg-green-500/6" : "border-amber-500/25 bg-amber-500/6"}`}>
          <p className={`text-sm font-bold mb-3 ${perfilCompleto ? "text-green-400" : "text-amber-400"}`}>
            {perfilCompleto ? "✓ Preparado para cobrar" : "⚠ Falta completar información para recibir pagos"}
          </p>
          <div className="space-y-2">
            {[
              { ok: datosCompletos, label: "Datos personales (nombres, apellidos, DNI)" },
              { ok: cuentaActiva,   label: "Cuenta bancaria activa" },
              { ok: esVendedor,     label: "Verificación como vendedor" },
            ].map(({ ok, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${ok ? "bg-green-500/20 text-green-400" : "bg-white/8 text-white/25"}`}>
                  {ok ? "✓" : "○"}
                </span>
                <span className={`text-sm ${ok ? "text-white/70" : "text-white/35"}`}>{label}</span>
              </div>
            ))}
          </div>
          {!perfilCompleto && (
            <p className="mt-3 text-xs text-amber-400/70">
              Completa los datos faltantes para poder recibir el pago cuando realices una venta.
            </p>
          )}
        </div>
      )}

      {/* Header cuenta */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-6 mb-4">
        <div className="flex items-center gap-4 mb-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white">
            {iniciales}
          </div>
          <div>
            <p className="text-lg font-bold text-white">{usuario.nombre}</p>
            <p className="text-sm text-white/45">{usuario.email}</p>
          </div>
        </div>
        <div className="divide-y divide-white/8 text-sm">
          <div className="flex justify-between py-2.5">
            <span className="text-white/45">Rol</span>
            <span className="font-semibold text-white">
              {usuario.rolPrincipal === "ADMINISTRADOR" ? "Administrador" :
               usuario.rolPrincipal === "VENDEDOR" ? "Comprador · Vendedor" : "Comprador"}
            </span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-white/45">Correo</span>
            <span className="font-semibold text-white">{usuario.email}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-white/45">Miembro desde</span>
            <span className="font-semibold text-white">
              {new Intl.DateTimeFormat("es-PE", { month: "long", year: "numeric" }).format(usuario.creadoEn)}
            </span>
          </div>
        </div>
      </div>

      {/* Datos personales */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-6 mb-4">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-base font-bold text-white">Datos personales</h2>
          {datosCompletos
            ? <span className="rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-semibold text-green-400">✓ Completo</span>
            : esVendedor
              ? <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400">Requerido</span>
              : null
          }
        </div>
        <DatosPersonalesForm
          inicial={{
            nombres: usuario.nombres ?? null,
            apellidos: usuario.apellidos ?? null,
            dni: usuario.dni ?? null,
            telefono: usuario.telefono ?? null,
          }}
        />
      </div>

      {/* Cuenta bancaria — solo para vendedores */}
      {(esVendedor || usuario.estadoVendedor === "PENDIENTE") && (
        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-6 mb-4">
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-base font-bold text-white">Cuenta bancaria</h2>
            {cuentaActiva
              ? <span className="rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-semibold text-green-400">✓ Activa</span>
              : <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400">Requerida para cobrar</span>
            }
          </div>
          <p className="mb-4 text-xs text-white/40">
            Datos necesarios para abonarte el pago una vez completada una venta. No son visibles para los compradores.
          </p>
          <CuentaBancariaForm cuentaActual={cuentaBancaria ?? null} />
        </div>
      )}

      {/* Verificación como vendedor */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Verificación como vendedor</h2>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${estadoVendedor.classes}`}>
            {estadoVendedor.label}
          </span>
        </div>

        {usuario.estadoVendedor === "NO_SOLICITADO" && (
          <div className="space-y-3">
            <p className="text-sm text-white/50">
              Para vender entradas en Transfiero necesitas verificar tu identidad. El proceso toma menos de 2 minutos.
            </p>
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/8 p-3 text-xs text-blue-300 space-y-1">
              <p className="font-semibold">Necesitarás:</p>
              <p>📄 Foto frontal de tu DNI</p>
              <p>📄 Foto posterior de tu DNI</p>
            </div>
          </div>
        )}

        {usuario.estadoVendedor === "PENDIENTE" && (
          <p className="text-sm text-white/50">
            Tu solicitud está siendo revisada. Normalmente tarda menos de 24 horas. Te notificaremos cuando tengamos una respuesta.
          </p>
        )}

        {usuario.estadoVendedor === "APROBADO" && (
          <div className="space-y-3">
            <p className="text-sm text-green-400 font-semibold">
              ✓ Estás verificado y puedes publicar entradas.
            </p>
            <Link
              href="/mis-publicaciones/nueva"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 px-4 py-2 text-sm font-bold text-gray-900 hover:opacity-90 transition-opacity shadow-[0_4px_16px_rgba(245,158,11,0.3)]"
            >
              + Publicar una entrada
            </Link>
          </div>
        )}

        {usuario.estadoVendedor === "RECHAZADO" && (
          <div className="space-y-3">
            {ultimaSolicitud?.motivoRechazo && (
              <div className="rounded-xl border border-red-500/25 bg-red-500/8 p-3">
                <p className="text-xs font-semibold text-red-400 mb-1">Motivo del rechazo:</p>
                <p className="text-sm text-red-300">{ultimaSolicitud.motivoRechazo}</p>
              </div>
            )}
            <p className="text-sm text-white/50">Puedes volver a enviar tu solicitud corrigiendo lo indicado.</p>
          </div>
        )}

        {puedeRequestar && (
          <Link
            href="/perfil/verificacion"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/6 px-4 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors"
          >
            {usuario.estadoVendedor === "RECHAZADO" ? "Reenviar solicitud" : "Solicitar verificación"} →
          </Link>
        )}
      </div>

      {/* Seguridad */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-6 mb-4">
        <h2 className="mb-4 text-base font-bold text-white">Seguridad</h2>
        <Link
          href="/auth/recuperar"
          className="text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors"
        >
          Cambiar contraseña →
        </Link>
      </div>

      {/* Cerrar sesión */}
      <form action={logoutAction}>
        <button
          type="submit"
          className="w-full rounded-2xl border border-white/8 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white/45 hover:border-red-500/30 hover:bg-red-500/8 hover:text-red-400 transition-colors"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  )
}
