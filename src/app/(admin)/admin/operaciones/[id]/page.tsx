"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  confirmarPagoYNotificarAction,
  notificarVendedorAction,
  marcarTransferidaAction,
  liberarFondosAction,
  cancelarOperacionAdminAction,
} from "@/app/actions/operacion.actions"
import { resolverDisputaAction } from "@/app/actions/disputa.actions"

type EstadoOp =
  | "ESPERANDO_VENDEDOR" | "PAGO_PENDIENTE" | "PAGO_RECIBIDO" | "VENDEDOR_NOTIFICADO"
  | "TRANSFERENCIA_EN_PROCESO" | "PENDIENTE_CONFIRMACION_COMPRADOR" | "COMPRADOR_CONFIRMADO"
  | "FONDOS_LIBERADOS" | "REEMBOLSADA" | "EN_DISPUTA" | "CANCELADA"

interface Pago {
  id: string; tipo: string; estado: string; montoCentimos: number; referenciaExterna: string | null; creadoEn: string
}
interface Evidencia {
  id: string; tipo: string; url: string; creadoEn: string
}
interface Disputa {
  id: string; numero: number; estado: string; motivo: string; creadoEn: string
  resolucionNota: string | null; resueltaEn: string | null
  evidencias: Evidencia[]
}
interface Operacion {
  id: string; estado: EstadoOp; creadoEn: string; vendedorAceptoEn: string | null
  precioVentaCentimos: number; montoCompradorCentimos: number; montoVendedorCentimos: number
  comisionCompradorCentimos: number; comisionVendedorCentimos: number
  fechaLimiteConfirmacion: string | null
  cuentaDestinoComprador: string | null
  publicacion: { id: string; nombreEvento: string; fechaEvento: string; lugarEvento: string; zona: string | null; asiento: string | null; ticketera: string | null; ticketeraEnum: string | null; imagenPortadaUrl: string | null; estado: string }
  comprador: { id: string; nombre: string; email: string; telefono: string | null }
  vendedor: {
    id: string; nombre: string; nombres: string | null; apellidos: string | null
    dni: string | null; email: string; telefono: string | null
    cuentasBancarias: {
      id: string; banco: string; tipoCuenta: string
      numeroCuenta: string; cci: string | null; titular: string; documentoTitular: string
    }[]
  }
  pagos: Pago[]
  evidencias: Evidencia[]
  disputa: Disputa | null
}

const ESTADO_LABELS: Record<EstadoOp, string> = {
  ESPERANDO_VENDEDOR: "Esperando vendedor",
  PAGO_PENDIENTE: "Pago pendiente",
  PAGO_RECIBIDO: "Pago recibido",
  VENDEDOR_NOTIFICADO: "Vendedor notificado",
  TRANSFERENCIA_EN_PROCESO: "Transferencia en proceso",
  PENDIENTE_CONFIRMACION_COMPRADOR: "Pendiente confirmación",
  COMPRADOR_CONFIRMADO: "Comprador confirmó",
  FONDOS_LIBERADOS: "Fondos liberados",
  REEMBOLSADA: "Reembolsada",
  EN_DISPUTA: "En disputa",
  CANCELADA: "Cancelada",
}

const DISPUTA_ESTADO_LABELS: Record<string, string> = {
  ABIERTA: "Abierta",
  EN_REVISION: "En revisión",
  RESUELTA_VENDEDOR: "Resuelta — vendedor",
  RESUELTA_COMPRADOR: "Resuelta — comprador",
}

function fmt(centimos: number) { return `S/ ${(centimos / 100).toFixed(2)}` }
function fmtFecha(d: string) {
  return new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d))
}

function AccionButton({ label, onClick, color, disabled }: { label: string; onClick: () => void; color: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-xl px-4 py-3 text-sm font-bold transition-colors disabled:opacity-50 ${color}`}
    >
      {label}
    </button>
  )
}

export default function AdminOperacionDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [op, setOp] = useState<Operacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [opId, setOpId] = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [notaResolucion, setNotaResolucion] = useState("")
  const [confirmDisputa, setConfirmDisputa] = useState<"VENDEDOR" | "COMPRADOR" | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  useEffect(() => {
    params.then(({ id }) => {
      setOpId(id)
      fetch(`/api/admin/operaciones/${id}`)
        .then((r) => r.json())
        .then((data) => { setOp(data); setLoading(false) })
        .catch(() => setLoading(false))
    })
  }, [params])

  async function run(action: () => Promise<{ ok?: boolean; error?: string; warning?: string } | undefined>) {
    setSubmitting(true)
    setError(null)
    setWarning(null)
    try {
      const res = await action()
      if (res?.error) { setError(res.error) }
      else {
        if (res?.warning) setWarning(res.warning)
        if (opId) {
          const data = await fetch(`/api/admin/operaciones/${opId}`).then(r => r.json())
          setOp(data)
        }
        router.refresh()
      }
    } catch { setError("Error inesperado") }
    finally { setSubmitting(false) }
  }

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-gray-400">Cargando operación...</div>
  if (!op || !opId) return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center text-gray-400">
      Operación no encontrada.{" "}
      <Link href="/admin/operaciones" className="text-[#1B3A6B] underline">Volver</Link>
    </div>
  )

  const pagosPendientes = op.pagos.filter((p) => p.estado === "PENDIENTE")
  const evidenciasTransferencia = op.evidencias.filter((e) => e.tipo === "TRANSFERENCIA")
  const evidenciasPago = op.evidencias.filter((e) => e.tipo === "PAGO")

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/admin/operaciones" className="mb-6 inline-block text-sm text-gray-400 hover:text-gray-600">
        ← Volver a operaciones
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">{op.publicacion.nombreEvento}</h1>
          <p className="mt-0.5 text-xs text-gray-400">Op. #{op.id.slice(-8).toUpperCase()} · {fmtFecha(op.creadoEn)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${op.estado === "EN_DISPUTA" ? "bg-orange-600" : "bg-[#1B3A6B]"}`}>
          {ESTADO_LABELS[op.estado]}
        </span>
      </div>

      <div className="space-y-4">
        {/* Partes */}
        <div className="grid grid-cols-2 gap-4">
          {/* Comprador */}
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Comprador</p>
            <p className="font-semibold text-gray-900">{op.comprador.nombre}</p>
            <p className="text-xs text-gray-500">{op.comprador.email}</p>
            {op.comprador.telefono && <p className="text-xs text-gray-500">{op.comprador.telefono}</p>}
          </div>

          {/* Vendedor */}
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Vendedor</p>
            <p className="font-semibold text-gray-900">{op.vendedor.nombre}</p>
            <p className="text-xs text-gray-500">{op.vendedor.email}</p>
            {op.vendedor.telefono && <p className="text-xs text-gray-500">{op.vendedor.telefono}</p>}
            {op.vendedor.dni && <p className="text-xs text-gray-400 mt-1">DNI: {op.vendedor.dni}</p>}
          </div>
        </div>

        {/* Cuenta bancaria del vendedor — dato para realizar el pago */}
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-600">Cuenta bancaria del vendedor</p>
          {op.vendedor.cuentasBancarias.length > 0 ? (() => {
            const cb = op.vendedor.cuentasBancarias[0]
            return (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                <div className="flex justify-between col-span-2 border-b border-blue-100 pb-1.5">
                  <dt className="text-blue-700/70">Banco</dt>
                  <dd className="font-bold text-blue-900">{cb.banco} — {cb.tipoCuenta === "AHORROS" ? "Ahorros" : "Corriente"}</dd>
                </div>
                <div className="flex justify-between col-span-2 border-b border-blue-100 pb-1.5">
                  <dt className="text-blue-700/70">N° cuenta</dt>
                  <dd className="font-bold font-mono text-blue-900">{cb.numeroCuenta}</dd>
                </div>
                {cb.cci && (
                  <div className="flex justify-between col-span-2 border-b border-blue-100 pb-1.5">
                    <dt className="text-blue-700/70">CCI</dt>
                    <dd className="font-bold font-mono text-blue-900">{cb.cci}</dd>
                  </div>
                )}
                <div className="flex justify-between col-span-2 border-b border-blue-100 pb-1.5">
                  <dt className="text-blue-700/70">Titular</dt>
                  <dd className="font-semibold text-blue-900">{cb.titular}</dd>
                </div>
                <div className="flex justify-between col-span-2">
                  <dt className="text-blue-700/70">DNI titular</dt>
                  <dd className="font-semibold font-mono text-blue-900">{cb.documentoTitular}</dd>
                </div>
              </dl>
            )
          })() : (
            <p className="text-sm text-amber-600 font-semibold">⚠ El vendedor no tiene cuenta bancaria registrada.</p>
          )}
        </div>

        {/* Cuenta de destino del comprador */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Cuenta de destino (comprador)</p>
          {op.cuentaDestinoComprador ? (
            <div>
              <p className="text-xs text-gray-500 mb-1">
                {op.publicacion.ticketeraEnum === "JOINNUS" && "Correo o usuario Joinnus"}
                {op.publicacion.ticketeraEnum === "TELETICKET" && "Correo Teleticket"}
                {op.publicacion.ticketeraEnum === "TICKETMASTER" && "Correo Ticketmaster"}
                {!op.publicacion.ticketeraEnum && "Cuenta ticketera"}
              </p>
              <p className="font-semibold text-gray-900">{op.cuentaDestinoComprador}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">El comprador aún no ha registrado su cuenta de destino.</p>
          )}
        </div>

        {/* Resumen financiero */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Montos</p>
          <div className="divide-y divide-gray-100 text-sm">
            <div className="flex justify-between py-2"><span className="text-gray-500">Precio de venta</span><span className="font-semibold">{fmt(op.precioVentaCentimos)}</span></div>
            <div className="flex justify-between py-2"><span className="text-gray-500">Comisión comprador (7%)</span><span className="font-semibold">+{fmt(op.comisionCompradorCentimos)}</span></div>
            <div className="flex justify-between py-2"><span className="text-gray-500">Comprador paga</span><span className="font-bold text-gray-900">{fmt(op.montoCompradorCentimos)}</span></div>
            <div className="flex justify-between py-2"><span className="text-gray-500">Comisión vendedor (3%)</span><span className="font-semibold text-red-600">-{fmt(op.comisionVendedorCentimos)}</span></div>
            <div className="flex justify-between py-2"><span className="text-gray-500">Vendedor recibe</span><span className="font-bold text-green-700">{fmt(op.montoVendedorCentimos)}</span></div>
          </div>
        </div>

        {/* Comprobantes de pago */}
        {(evidenciasPago.length > 0 || pagosPendientes.length > 0) && (
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Comprobante de pago</p>
            {pagosPendientes.map((p) => (
              <div key={p.id} className="mb-2 flex items-center gap-3 rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs">
                <span className="font-semibold text-amber-700">{p.tipo.replace("_", " ")}</span>
                {p.referenciaExterna && <span className="text-gray-500">Ref: {p.referenciaExterna}</span>}
                <span className="ml-auto font-bold text-amber-800">{fmt(p.montoCentimos)}</span>
              </div>
            ))}
            {evidenciasPago.map((e) => (
              <div key={e.id} className="relative mt-2 aspect-video max-h-48 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                <Image src={e.url} alt="comprobante" fill className="object-contain" />
              </div>
            ))}
            {evidenciasPago.map((e) => (
              <a key={e.id + "-link"} href={e.url} target="_blank" rel="noopener noreferrer" className="mt-1 block text-center text-xs text-[#1B3A6B] hover:underline">
                Ver comprobante completo ↗
              </a>
            ))}
          </div>
        )}

        {/* Evidencias de transferencia */}
        {evidenciasTransferencia.length > 0 && (
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Evidencia de transferencia</p>
            {evidenciasTransferencia.map((e) => (
              <div key={e.id}>
                <div className="relative aspect-video max-h-48 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                  <Image src={e.url} alt="evidencia transferencia" fill className="object-contain" />
                </div>
                <a href={e.url} target="_blank" rel="noopener noreferrer" className="mt-1 block text-center text-xs text-[#1B3A6B] hover:underline">
                  Ver evidencia completa ↗
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Panel de disputa */}
        {op.estado === "EN_DISPUTA" && op.disputa && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-700">Disputa activa</p>
                <p className="mt-0.5 text-base font-extrabold text-orange-900 font-mono tracking-tight">
                  DIS-{String(op.disputa.numero).padStart(4, "0")}
                </p>
              </div>
              <span className="rounded-full bg-orange-200 px-2 py-0.5 text-xs font-semibold text-orange-800">
                {DISPUTA_ESTADO_LABELS[op.disputa.estado] ?? op.disputa.estado}
              </span>
            </div>

            <div className="rounded-lg bg-white border border-orange-100 p-3 text-sm text-gray-700">
              <p className="text-xs font-semibold text-gray-500 mb-1">Motivo del comprador:</p>
              <p className="leading-relaxed">{op.disputa.motivo}</p>
              <p className="mt-2 text-xs text-gray-400">Abierta: {fmtFecha(op.disputa.creadoEn)}</p>
            </div>

            {/* Evidencias de disputa */}
            {op.disputa.evidencias.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-600">Evidencias subidas ({op.disputa.evidencias.length})</p>
                <div className="grid grid-cols-2 gap-2">
                  {op.disputa.evidencias.map((e) => (
                    <div key={e.id}>
                      <div className="relative aspect-video overflow-hidden rounded-lg border border-orange-100 bg-gray-50">
                        <Image src={e.url} alt="evidencia disputa" fill className="object-cover" />
                      </div>
                      <a href={e.url} target="_blank" rel="noopener noreferrer" className="block text-center text-xs text-[#1B3A6B] hover:underline mt-0.5">
                        Ver ↗
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botones de resolución */}
            {(op.disputa.estado === "ABIERTA" || op.disputa.estado === "EN_REVISION") && (
              <div className="space-y-3">
                {confirmDisputa === null && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setConfirmDisputa("VENDEDOR")}
                      disabled={submitting}
                      className="rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-500 transition-colors disabled:opacity-50"
                    >
                      ✓ A favor del vendedor
                    </button>
                    <button
                      onClick={() => setConfirmDisputa("COMPRADOR")}
                      disabled={submitting}
                      className="rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-500 transition-colors disabled:opacity-50"
                    >
                      ↩ A favor del comprador
                    </button>
                  </div>
                )}

                {confirmDisputa !== null && (
                  <div className="rounded-xl border border-orange-300 bg-white p-4 space-y-3">
                    <p className="text-sm font-semibold text-gray-800">
                      Resolviendo a favor del {confirmDisputa === "VENDEDOR" ? "vendedor (fondos liberados)" : "comprador (reembolso)"}
                    </p>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Nota de resolución (opcional)
                      </label>
                      <textarea
                        value={notaResolucion}
                        onChange={(e) => setNotaResolucion(e.target.value)}
                        placeholder="Explica brevemente la decisión..."
                        rows={3}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { setConfirmDisputa(null); setNotaResolucion("") }}
                        disabled={submitting}
                        className="rounded-xl border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => run(() => resolverDisputaAction(
                          op.disputa!.id,
                          opId,
                          confirmDisputa,
                          notaResolucion.trim() || undefined
                        ))}
                        disabled={submitting}
                        className="rounded-xl bg-orange-600 py-2 text-sm font-bold text-white hover:bg-orange-500 transition-colors disabled:opacity-50"
                      >
                        {submitting ? "Resolviendo..." : "Confirmar resolución"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Acciones admin */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Acciones</p>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {warning && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-semibold mb-0.5">⚠ Pago confirmado — acción pendiente</p>
              <p>{warning}</p>
            </div>
          )}

          {/* Paso fusionado: confirmar pago + notificar vendedor en un solo click */}
          {op.estado === "PAGO_PENDIENTE" && (
            <AccionButton
              label="✓ Confirmar pago y notificar al vendedor"
              color="bg-green-600 text-white hover:bg-green-500"
              disabled={submitting || pagosPendientes.length === 0}
              onClick={() => run(() => confirmarPagoYNotificarAction(opId))}
            />
          )}

          {/* Fallback: solo aparece si el perfil del vendedor estaba incompleto al confirmar el pago */}
          {op.estado === "PAGO_RECIBIDO" && (
            <AccionButton
              label="📢 Notificar al vendedor para transferir"
              color="bg-[#1B3A6B] text-white hover:bg-[#152d54]"
              disabled={submitting}
              onClick={() => run(() => notificarVendedorAction(opId))}
            />
          )}

          {op.estado === "TRANSFERENCIA_EN_PROCESO" && (
            <AccionButton
              label="✓ Marcar transferencia como válida"
              color="bg-green-600 text-white hover:bg-green-500"
              disabled={submitting || evidenciasTransferencia.length === 0}
              onClick={() => run(() => marcarTransferidaAction(opId))}
            />
          )}

          {op.estado === "PENDIENTE_CONFIRMACION_COMPRADOR" && (
            <>
              {op.fechaLimiteConfirmacion && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                  <p className="font-semibold">⏱ Plazo de confirmación activo</p>
                  <p className="mt-0.5">El comprador tiene hasta el <strong>{fmtFecha(op.fechaLimiteConfirmacion)}</strong> para confirmar o disputar.</p>
                </div>
              )}
              <AccionButton
                label="💸 Liberar fondos anticipadamente"
                color="bg-amber-500 text-gray-900 hover:bg-amber-400"
                disabled={submitting}
                onClick={() => run(() => liberarFondosAction(opId))}
              />
            </>
          )}

          {/* COMPRADOR_CONFIRMADO: estado legado — las nuevas operaciones van directo a FONDOS_LIBERADOS */}
          {op.estado === "COMPRADOR_CONFIRMADO" && (
            <AccionButton
              label="💸 Liberar fondos al vendedor"
              color="bg-amber-500 text-gray-900 hover:bg-amber-400"
              disabled={submitting}
              onClick={() => run(() => liberarFondosAction(opId))}
            />
          )}

          {/* Cancelar / Reembolsar — disponible en todos los estados no finales y no en disputa (disputa tiene su propio flujo) */}
          {!(["FONDOS_LIBERADOS", "REEMBOLSADA", "CANCELADA", "EN_DISPUTA"] as EstadoOp[]).includes(op.estado) && (
            <>
              {!confirmCancel ? (
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
                >
                  Cancelar operación
                </button>
              ) : (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
                  <p className="text-sm font-semibold text-red-700">¿Cancelar con reembolso?</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setConfirmCancel(false); run(() => cancelarOperacionAdminAction(opId, true)) }}
                      disabled={submitting}
                      className="rounded-xl bg-red-600 py-2 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-50"
                    >
                      Con reembolso
                    </button>
                    <button
                      onClick={() => { setConfirmCancel(false); run(() => cancelarOperacionAdminAction(opId, false)) }}
                      disabled={submitting}
                      className="rounded-xl border border-red-300 py-2 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                    >
                      Sin reembolso
                    </button>
                  </div>
                  <button onClick={() => setConfirmCancel(false)} className="w-full text-xs text-gray-400 hover:text-gray-600">
                    Cancelar
                  </button>
                </div>
              )}
            </>
          )}

          {(["FONDOS_LIBERADOS", "REEMBOLSADA", "CANCELADA"] as EstadoOp[]).includes(op.estado) && (
            <p className="text-center text-sm text-gray-400">Operación en estado final — sin acciones disponibles</p>
          )}

          {op.estado === "EN_DISPUTA" && (
            <p className="text-center text-sm text-orange-500">Usa el panel de disputa para resolver</p>
          )}
        </div>
      </div>
    </div>
  )
}
