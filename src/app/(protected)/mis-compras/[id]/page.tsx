import { notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { obtenerOperacionComprador } from "@/services/operacion.service"
import { EstadoBadge } from "@/components/operaciones/EstadoBadge"
import { ResumenFinanciero } from "@/components/operaciones/ResumenFinanciero"
import { TimelineOperacion } from "@/components/operaciones/TimelineOperacion"
import { AccionesCompradorPago } from "@/components/operaciones/AccionesCompradorPago"
import { BotonPagarMP } from "@/components/operaciones/BotonPagarMP"
import { AccionesCompradorConfirmacion } from "@/components/operaciones/AccionesCompradorConfirmacion"
import { AbrirDisputaForm } from "@/components/disputas/AbrirDisputaForm"
import { EvidenciaDisputaForm } from "@/components/disputas/EvidenciaDisputaForm"
import { CuentaDestinoForm } from "@/components/operaciones/CuentaDestinoForm"

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
  ABIERTA: "Abierta — en revisión",
  EN_REVISION: "En revisión por el equipo",
  RESUELTA_VENDEDOR: "Resuelta a favor del vendedor",
  RESUELTA_COMPRADOR: "Resuelta a favor del comprador",
}

export default async function DetalleCompraPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()

  const { operacion } = await obtenerOperacionComprador(id, session!.user.id)
  if (!operacion) notFound()

  const pub = operacion.publicacion

  // Detectar si ya tiene comprobante enviado
  type PagoResumen = { estado: string }
  const pagos = (operacion as { pagos?: PagoResumen[] }).pagos
  const yaSubioComprobante = Array.isArray(pagos) && pagos.some((p) => p.estado === "PENDIENTE" || p.estado === "RECIBIDO")

  const mostraAccionesPago = operacion.estado === "PAGO_PENDIENTE"
  const cuentaDestinoComprador = operacion.cuentaDestinoComprador ?? null
  const ticketeraEnum = (operacion.publicacion as { ticketeraEnum?: string | null }).ticketeraEnum ?? null

  // Comprador puede confirmar en el nuevo estado (con plazo) o en el estado legacy (sin plazo)
  const mostraConfirmacion =
    operacion.estado === "PENDIENTE_CONFIRMACION_COMPRADOR" ||
    (operacion.estado === "TRANSFERENCIA_EN_PROCESO" && operacion.publicacion.estado === "TRANSFERIDA")

  const puedeAbrirDisputa =
    operacion.estado === "PENDIENTE_CONFIRMACION_COMPRADOR" ||
    operacion.estado === "TRANSFERENCIA_EN_PROCESO"

  // Calcular tiempo restante si hay plazo activo
  type OperacionConPlazo = typeof operacion & { fechaLimiteConfirmacion?: string | Date | null }
  const fechaLimite = (operacion as OperacionConPlazo).fechaLimiteConfirmacion
    ? new Date((operacion as OperacionConPlazo).fechaLimiteConfirmacion as string)
    : null
  const horasRestantes = fechaLimite
    ? Math.max(0, Math.floor((fechaLimite.getTime() - Date.now()) / (1000 * 60 * 60)))
    : null

  const estadosFinales: string[] = ["FONDOS_LIBERADOS", "CANCELADA", "REEMBOLSADA"]
  const esEstadoFinal = estadosFinales.includes(operacion.estado)

  // Tipado de disputa
  type DisputaResumen = {
    id: string; estado: string; motivo: string; creadoEn: Date
    resolucionNota: string | null; resueltaEn: Date | null
    evidencias: { id: string; url: string; subidoPorId: string; creadoEn: Date }[]
  }
  const disputa = (operacion as { disputa?: DisputaResumen | null }).disputa

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/mis-compras" className="mb-5 inline-block text-sm text-gray-400 hover:text-gray-600 transition-colors">
        ← Mis Compras
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start gap-4 rounded-2xl bg-[#0C1B3F] p-5">
        <div>
          <div className="mb-2">
            <EstadoBadge estado={operacion.estado} vista="comprador" />
          </div>
          <h1 className="text-xl font-extrabold text-white leading-tight">{pub.nombreEvento}</h1>
          <p className="mt-1 text-sm text-gray-400">
            📅 {formatFecha(pub.fechaEvento)} · 📍 {pub.lugarEvento}
          </p>
          <p className="mt-1 text-xs text-gray-500">Operación #{operacion.id.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Columna izquierda */}
        <div className="space-y-4">
          {/* Timeline */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-gray-500">Seguimiento</h2>
            <TimelineOperacion
              estado={operacion.estado}
              creadoEn={operacion.creadoEn}
              vendedorAceptoEn={operacion.vendedorAceptoEn}
            />
          </div>

          {/* Detalles de la entrada */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">Detalles</h2>
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
              <div className="flex justify-between py-2">
                <dt className="text-gray-500">Vendedor</dt>
                <dd className="font-semibold">{operacion.vendedor.nombre}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="space-y-4">
          {/* Resumen financiero */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">Resumen de pago</h2>
            <ResumenFinanciero
              precioVentaCentimos={operacion.precioVentaCentimos}
              comisionCompradorCentimos={operacion.comisionCompradorCentimos}
              montoCompradorCentimos={operacion.montoCompradorCentimos}
            />
          </div>

          {/* Acciones según estado */}
          {mostraAccionesPago && (
            <div className="space-y-3">
              {/* Paso 1: cuenta de destino */}
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Paso 1 — Tu cuenta en la ticketera</p>
                <CuentaDestinoForm
                  operacionId={operacion.id}
                  ticketeraEnum={ticketeraEnum}
                  valorActual={cuentaDestinoComprador}
                />
              </div>

              {/* Paso 2: Pago con MercadoPago — primario */}
              <div className={`rounded-xl border border-[#009EE3]/20 bg-[#009EE3]/5 p-5 ${!cuentaDestinoComprador ? "opacity-50 pointer-events-none" : ""}`}>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#009EE3]/70">Paso 2 — Pagar en línea</p>
                {!cuentaDestinoComprador && (
                  <p className="mb-3 text-xs text-gray-400">Completa el Paso 1 primero</p>
                )}
                <BotonPagarMP
                  operacionId={operacion.id}
                  monto={(operacion.montoCompradorCentimos / 100).toFixed(2)}
                />
              </div>

              {/* Pago manual — alternativo */}
              <div className={`rounded-xl border border-gray-100 bg-white p-5 shadow-sm ${!cuentaDestinoComprador ? "opacity-50 pointer-events-none" : ""}`}>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">O envía el comprobante manual</p>
                {!cuentaDestinoComprador && (
                  <p className="mb-3 text-xs text-gray-400">Completa el Paso 1 primero</p>
                )}
                <AccionesCompradorPago
                  operacionId={operacion.id}
                  montoCompradorCentimos={operacion.montoCompradorCentimos}
                  yaSubioComprobante={yaSubioComprobante}
                />
              </div>
            </div>
          )}

          {mostraConfirmacion && (
            <div className="space-y-3">
              {/* Plazo activo */}
              {fechaLimite && horasRestantes !== null && (
                <div className={`rounded-xl border px-4 py-3 text-sm ${
                  horasRestantes <= 24
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-amber-100 bg-amber-50 text-amber-700"
                }`}>
                  <p className="font-semibold">
                    {horasRestantes <= 24 ? "⚠ " : "⏱ "}
                    {horasRestantes === 0
                      ? "El plazo está por vencer"
                      : `Tienes ${horasRestantes}h para confirmar`}
                  </p>
                  <p className="mt-0.5 text-xs">
                    Plazo límite:{" "}
                    {new Intl.DateTimeFormat("es-PE", {
                      weekday: "short", day: "numeric", month: "short",
                      hour: "2-digit", minute: "2-digit",
                    }).format(fechaLimite)}
                    {" "}· Si no actúas, los fondos se liberarán automáticamente al vendedor.
                  </p>
                </div>
              )}
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <AccionesCompradorConfirmacion operacionId={operacion.id} />
              </div>
            </div>
          )}

          {/* Disputa activa */}
          {operacion.estado === "EN_DISPUTA" && disputa && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-5 shadow-sm space-y-4">
              <div>
                <h2 className="text-sm font-bold text-orange-800">Disputa en proceso</h2>
                <p className="mt-1 text-xs text-orange-700">
                  Estado: <span className="font-semibold">{DISPUTA_ESTADO_LABELS[disputa.estado] ?? disputa.estado}</span>
                </p>
              </div>
              <div className="rounded-lg bg-white border border-orange-100 p-3 text-sm text-gray-700">
                <p className="text-xs font-semibold text-gray-500 mb-1">Tu motivo registrado:</p>
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

              {/* Subir más evidencia si la disputa sigue abierta */}
              {(disputa.estado === "ABIERTA" || disputa.estado === "EN_REVISION") && (
                <EvidenciaDisputaForm
                  disputaId={disputa.id}
                  operacionId={operacion.id}
                  label="Añadir más evidencia"
                />
              )}

              {/* Resultado si ya fue resuelta */}
              {(disputa.estado === "RESUELTA_VENDEDOR" || disputa.estado === "RESUELTA_COMPRADOR") && (
                <div className="rounded-lg border border-orange-200 bg-white p-3 text-sm">
                  <p className="font-semibold text-gray-700 mb-1">Resolución del administrador:</p>
                  {disputa.resolucionNota && <p className="text-gray-600">{disputa.resolucionNota}</p>}
                </div>
              )}
            </div>
          )}

          {/* Abrir disputa — solo en TRANSFERENCIA_EN_PROCESO */}
          {puedeAbrirDisputa && !disputa && (
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <AbrirDisputaForm operacionId={operacion.id} />
            </div>
          )}

          {operacion.estado === "TRANSFERENCIA_EN_PROCESO" && !mostraConfirmacion && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
              <p className="font-semibold">Transferencia en proceso</p>
              <p className="mt-1 text-xs">El vendedor subió la evidencia. El equipo de Transfiero está verificando la transferencia.</p>
            </div>
          )}

          {operacion.estado === "COMPRADOR_CONFIRMADO" && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
              <p className="font-semibold">✓ Recepción confirmada</p>
              <p className="mt-1 text-xs">El administrador liberará los fondos al vendedor en breve.</p>
            </div>
          )}

          {operacion.estado === "FONDOS_LIBERADOS" && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <p className="font-semibold">✓ Operación completada</p>
              <p className="mt-1 text-xs">Los fondos fueron liberados al vendedor. ¡Disfruta el evento!</p>
            </div>
          )}

          {operacion.estado === "REEMBOLSADA" && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
              <p className="font-semibold">Operación reembolsada</p>
              <p className="mt-1 text-xs">El monto pagado será devuelto a tu método de pago original.</p>
            </div>
          )}

          {operacion.estado === "CANCELADA" && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              <p className="font-semibold">Operación cancelada</p>
            </div>
          )}

          {!mostraAccionesPago && !mostraConfirmacion && !esEstadoFinal && operacion.estado !== "EN_DISPUTA" && !puedeAbrirDisputa && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-500 text-center">
              Esperando la siguiente acción. Recibirás una notificación cuando haya novedades.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
