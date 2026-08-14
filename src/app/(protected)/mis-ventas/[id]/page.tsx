import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { obtenerOperacionVendedor } from "@/services/operacion.service"
import { EstadoBadge } from "@/components/operaciones/EstadoBadge"
import { ResumenFinanciero } from "@/components/operaciones/ResumenFinanciero"
import { AccionesReservaVendedor } from "@/components/operaciones/AccionesReservaVendedor"
import { EvidenciaTransferenciaForm } from "@/components/operaciones/EvidenciaTransferenciaForm"
import { EvidenciaDisputaForm } from "@/components/disputas/EvidenciaDisputaForm"
import { labelCuentaDestino } from "@/lib/validators/cuenta-destino"

function formatFecha(fecha: Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(fecha))
}

interface PageProps {
  params: Promise<{ id: string }>
}

const DISPUTA_ESTADO_LABELS: Record<string, string> = {
  ABIERTA: "Abierta — pendiente de revisión",
  EN_REVISION: "En revisión por el equipo",
  RESUELTA_VENDEDOR: "Resuelta a tu favor",
  RESUELTA_COMPRADOR: "Resuelta a favor del comprador",
}

export default async function DetalleVentaPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()

  if (
    session!.user.rolPrincipal !== "VENDEDOR" ||
    session!.user.estadoVendedor !== "APROBADO"
  ) {
    redirect("/403")
  }

  const { operacion } = await obtenerOperacionVendedor(id, session!.user.id)
  if (!operacion) notFound()

  const pub = operacion.publicacion
  const esperandoRespuesta = operacion.estado === "ESPERANDO_VENDEDOR"
  const necesitaEvidencia = operacion.estado === "VENDEDOR_NOTIFICADO"
  const cuentaDestinoComprador = operacion.cuentaDestinoComprador ?? null
  const ticketeraEnum = (pub as { ticketeraEnum?: string | null }).ticketeraEnum ?? null

  // Tipado de disputa
  type DisputaResumen = {
    id: string; estado: string; motivo: string; creadoEn: Date
    evidencias: { id: string; url: string; subidoPorId: string; creadoEn: Date }[]
  }
  const disputa = (operacion as { disputa?: DisputaResumen | null }).disputa

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/mis-ventas" className="mb-5 inline-block text-sm text-gray-400 hover:text-gray-600 transition-colors">
        ← Mis Ventas
      </Link>

      {/* Header */}
      <div className="mb-6 rounded-2xl bg-[#0C1B3F] p-5">
        <div className="mb-2">
          <EstadoBadge estado={operacion.estado} vista="vendedor" />
        </div>
        <h1 className="text-xl font-extrabold text-white leading-tight">{pub.nombreEvento}</h1>
        <p className="mt-1 text-sm text-gray-400">
          📅 {formatFecha(pub.fechaEvento)} · 📍 {pub.lugarEvento}
        </p>
        <p className="mt-1 text-xs text-gray-500">Operación #{operacion.id.slice(-8).toUpperCase()}</p>
      </div>

      <div className="space-y-4">
        {/* Acción urgente: aceptar/rechazar reserva */}
        {esperandoRespuesta && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="mb-3 text-sm font-bold text-amber-700">⚡ Responde esta reserva</h2>
            <AccionesReservaVendedor
              operacionId={operacion.id}
              reservaExpiraEn={operacion.reservaExpiraEn.toISOString()}
            />
          </div>
        )}

        {/* Acción urgente: subir evidencia de transferencia */}
        {necesitaEvidencia && (
          <div className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
              Acción requerida
            </h2>
            <EvidenciaTransferenciaForm operacionId={operacion.id} />
          </div>
        )}

        {/* Disputa activa */}
        {operacion.estado === "EN_DISPUTA" && disputa && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-orange-800">⚠ Disputa abierta por el comprador</h2>
              <p className="mt-1 text-xs text-orange-700">
                Estado: <span className="font-semibold">{DISPUTA_ESTADO_LABELS[disputa.estado] ?? disputa.estado}</span>
              </p>
              <p className="mt-1 text-xs text-orange-600">
                Los fondos están retenidos mientras el equipo de Transfiero revisa el caso.
              </p>
            </div>

            <div className="rounded-lg bg-white border border-orange-100 p-3 text-sm text-gray-700">
              <p className="text-xs font-semibold text-gray-500 mb-1">Motivo del comprador:</p>
              <p className="leading-relaxed">{disputa.motivo}</p>
            </div>

            {/* Evidencias enviadas */}
            {disputa.evidencias.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Evidencias enviadas ({disputa.evidencias.length})</p>
                <div className="grid grid-cols-2 gap-2">
                  {disputa.evidencias.map((ev) => (
                    <a key={ev.id} href={ev.url} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ev.url} alt="evidencia" className="w-full aspect-video object-cover rounded-lg border border-orange-100" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Subir evidencia de defensa si la disputa sigue activa */}
            {(disputa.estado === "ABIERTA" || disputa.estado === "EN_REVISION") && (
              <div className="rounded-xl border border-orange-100 bg-white p-4">
                <p className="text-xs text-orange-700 mb-3">
                  Puedes subir evidencia para defender tu caso. El administrador la revisará.
                </p>
                <EvidenciaDisputaForm
                  disputaId={disputa.id}
                  operacionId={operacion.id}
                  label="Subir evidencia de defensa"
                />
              </div>
            )}

            {/* Resolución */}
            {(disputa.estado === "RESUELTA_VENDEDOR" || disputa.estado === "RESUELTA_COMPRADOR") && (
              <div className={`rounded-lg border p-3 text-sm ${
                disputa.estado === "RESUELTA_VENDEDOR"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-gray-200 bg-gray-50 text-gray-700"
              }`}>
                <p className="font-semibold">{DISPUTA_ESTADO_LABELS[disputa.estado]}</p>
              </div>
            )}
          </div>
        )}

        {/* Estado informativo */}
        {operacion.estado === "PAGO_PENDIENTE" && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
            <p className="font-semibold">Esperando pago del comprador</p>
            <p className="mt-1 text-xs">El comprador tiene instrucciones para realizar el pago. Recibirás una notificación cuando el administrador confirme el pago.</p>
          </div>
        )}

        {operacion.estado === "PAGO_RECIBIDO" && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
            <p className="font-semibold">Pago confirmado</p>
            <p className="mt-1 text-xs">El pago fue recibido. Pronto el administrador te pedirá que realices la transferencia oficial de la entrada.</p>
          </div>
        )}

        {operacion.estado === "TRANSFERENCIA_EN_PROCESO" && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
            <p className="font-semibold">Evidencia enviada — en revisión</p>
            <p className="mt-1 text-xs">El administrador está revisando la evidencia de transferencia.</p>
          </div>
        )}

        {operacion.estado === "TRANSFERENCIA_EN_PROCESO" && !necesitaEvidencia && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
            <p className="font-semibold">Esperando confirmación del comprador</p>
            <p className="mt-1 text-xs">El equipo de Transfiero está verificando la transferencia. El comprador confirmará la recepción en breve.</p>
          </div>
        )}

        {operacion.estado === "COMPRADOR_CONFIRMADO" && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <p className="font-semibold">✓ Comprador confirmó la recepción</p>
            <p className="mt-1 text-xs">El administrador liberará tus fondos en breve.</p>
          </div>
        )}

        {operacion.estado === "FONDOS_LIBERADOS" && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <p className="font-semibold">✓ ¡Fondos liberados!</p>
            <p className="mt-1 text-xs">Los fondos fueron transferidos a tu cuenta. ¡Gracias por vender con Transfiero!</p>
          </div>
        )}

        {operacion.estado === "CANCELADA" && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            <p className="font-semibold">Operación cancelada</p>
          </div>
        )}

        {operacion.estado === "REEMBOLSADA" && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            <p className="font-semibold">Operación reembolsada al comprador</p>
          </div>
        )}

        {/* Datos del comprador */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">Comprador</h2>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1E4799] text-sm font-bold text-white">
              {operacion.comprador.nombre.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{operacion.comprador.nombre}</p>
              <p className="text-xs text-gray-400">
                {operacion.comprador.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")}
              </p>
            </div>
          </div>

          {/* Cuenta de destino — visible solo tras confirmación de pago */}
          {cuentaDestinoComprador && (
            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                {labelCuentaDestino(ticketeraEnum)}
              </p>
              <p className="text-sm font-semibold text-gray-900">{cuentaDestinoComprador}</p>
              <p className="mt-1 text-xs text-blue-600">
                Usa esta cuenta para realizar la transferencia oficial de la entrada en la ticketera.
              </p>
            </div>
          )}
        </div>

        {/* Resumen financiero */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">Lo que recibirás</h2>
          <ResumenFinanciero
            precioVentaCentimos={operacion.precioVentaCentimos}
            comisionCompradorCentimos={operacion.comisionCompradorCentimos}
            montoCompradorCentimos={operacion.montoCompradorCentimos}
            modoVendedor
            comisionVendedorCentimos={operacion.comisionVendedorCentimos}
            montoVendedorCentimos={operacion.montoVendedorCentimos}
          />
        </div>

        {/* Detalles de la entrada */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">Entrada</h2>
          <dl className="divide-y divide-gray-100 text-sm">
            {pub.zona && (
              <div className="flex justify-between py-2">
                <dt className="text-gray-500">Zona</dt>
                <dd className="font-semibold">{pub.zona}</dd>
              </div>
            )}
            {pub.asiento && (
              <div className="flex justify-between py-2">
                <dt className="text-gray-500">Asiento</dt>
                <dd className="font-semibold">{pub.asiento}</dd>
              </div>
            )}
            {pub.ticketera && (
              <div className="flex justify-between py-2">
                <dt className="text-gray-500">Ticketera</dt>
                <dd className="font-semibold">{pub.ticketera}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  )
}
