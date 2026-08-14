"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { aprobarSolicitudAction, rechazarSolicitudAction } from "@/app/actions/solicitud.actions"

interface Evidencia {
  id: string
  tipo: string
  url: string
}

interface CuentaBancaria {
  id: string; banco: string; tipoCuenta: string
  numeroCuenta: string; cci: string | null; titular: string; documentoTitular: string
}

interface Solicitud {
  id: string
  estado: string
  motivoRechazo: string | null
  creadoEn: string
  revisadoEn: string | null
  usuario: {
    id: string; nombre: string; nombres: string | null; apellidos: string | null
    dni: string | null; email: string; telefono: string | null
    cuentasBancarias: CuentaBancaria[]
  }
  evidencias: Evidencia[]
  revisadoPor: { nombre: string } | null
}

export default function AdminVendedorDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null)
  const [loading, setLoading] = useState(true)
  const [motivo, setMotivo] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [solicitudId, setSolicitudId] = useState<string | null>(null)

  useEffect(() => {
    params.then(({ id }) => {
      setSolicitudId(id)
      fetch(`/api/admin/vendedores/${id}`)
        .then((r) => r.json())
        .then((data) => { setSolicitud(data); setLoading(false) })
        .catch(() => setLoading(false))
    })
  }, [params])

  async function handleAprobar() {
    if (!solicitudId) return
    setSubmitting(true)
    setError(null)
    const res = await aprobarSolicitudAction(solicitudId)
    if (res?.error) {
      setError(res.error)
      setSubmitting(false)
    } else {
      router.push("/admin/vendedores")
      router.refresh()
    }
  }

  async function handleRechazar() {
    if (!solicitudId || !motivo.trim()) {
      setError("Escribe el motivo del rechazo.")
      return
    }
    setSubmitting(true)
    setError(null)
    const res = await rechazarSolicitudAction(solicitudId, motivo)
    if (res?.error) {
      setError(res.error)
      setSubmitting(false)
    } else {
      router.push("/admin/vendedores")
      router.refresh()
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-gray-400">
        Cargando solicitud...
      </div>
    )
  }

  if (!solicitud) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-gray-400">
        Solicitud no encontrada.{" "}
        <Link href="/admin/vendedores" className="text-[#1B3A6B] underline">
          Volver
        </Link>
      </div>
    )
  }

  const isPendiente = solicitud.estado === "PENDIENTE"

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/admin/vendedores" className="mb-6 inline-block text-sm text-gray-400 hover:text-gray-600">
        ← Volver a solicitudes
      </Link>

      <h1 className="mb-6 text-2xl font-extrabold text-gray-900">Revisar solicitud</h1>

      {/* Datos del usuario */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Datos del solicitante</h2>
        <dl className="divide-y divide-gray-100 text-sm">
          <div className="flex justify-between py-2">
            <dt className="text-gray-500">Nombre en cuenta</dt>
            <dd className="font-semibold text-gray-900">{solicitud.usuario.nombre}</dd>
          </div>
          {(solicitud.usuario.nombres || solicitud.usuario.apellidos) && (
            <div className="flex justify-between py-2">
              <dt className="text-gray-500">Nombres y apellidos</dt>
              <dd className="font-semibold text-gray-900">
                {[solicitud.usuario.nombres, solicitud.usuario.apellidos].filter(Boolean).join(" ")}
              </dd>
            </div>
          )}
          {solicitud.usuario.dni && (
            <div className="flex justify-between py-2">
              <dt className="text-gray-500">DNI</dt>
              <dd className="font-semibold font-mono text-gray-900">{solicitud.usuario.dni}</dd>
            </div>
          )}
          <div className="flex justify-between py-2">
            <dt className="text-gray-500">Correo</dt>
            <dd className="text-gray-700">{solicitud.usuario.email}</dd>
          </div>
          {solicitud.usuario.telefono && (
            <div className="flex justify-between py-2">
              <dt className="text-gray-500">Teléfono</dt>
              <dd className="text-gray-700">{solicitud.usuario.telefono}</dd>
            </div>
          )}
          <div className="flex justify-between py-2">
            <dt className="text-gray-500">Solicitud enviada</dt>
            <dd className="text-gray-500">
              {new Intl.DateTimeFormat("es-PE", {
                day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
              }).format(new Date(solicitud.creadoEn))}
            </dd>
          </div>
          {solicitud.revisadoPor && (
            <div className="flex justify-between py-2">
              <dt className="text-gray-500">Revisada por</dt>
              <dd className="text-gray-500">{solicitud.revisadoPor.nombre}</dd>
            </div>
          )}
        </dl>

        {/* Advertencias de datos faltantes */}
        {(!solicitud.usuario.nombres || !solicitud.usuario.apellidos || !solicitud.usuario.dni) && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            ⚠ El vendedor aún no completó sus datos personales en el perfil.
          </div>
        )}
      </div>

      {/* Cuenta bancaria del vendedor */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Cuenta bancaria para pagos</h2>
        {solicitud.usuario.cuentasBancarias.length > 0 ? (() => {
          const cb = solicitud.usuario.cuentasBancarias[0]
          return (
            <dl className="divide-y divide-gray-100 text-sm">
              <div className="flex justify-between py-2"><dt className="text-gray-500">Banco</dt><dd className="font-semibold text-gray-900">{cb.banco}</dd></div>
              <div className="flex justify-between py-2"><dt className="text-gray-500">Tipo</dt><dd className="font-semibold text-gray-900">{cb.tipoCuenta === "AHORROS" ? "Ahorros" : "Corriente"}</dd></div>
              <div className="flex justify-between py-2"><dt className="text-gray-500">N° cuenta</dt><dd className="font-semibold font-mono text-gray-900">{cb.numeroCuenta}</dd></div>
              {cb.cci && <div className="flex justify-between py-2"><dt className="text-gray-500">CCI</dt><dd className="font-semibold font-mono text-gray-900">{cb.cci}</dd></div>}
              <div className="flex justify-between py-2"><dt className="text-gray-500">Titular</dt><dd className="font-semibold text-gray-900">{cb.titular}</dd></div>
              <div className="flex justify-between py-2"><dt className="text-gray-500">DNI titular</dt><dd className="font-semibold font-mono text-gray-900">{cb.documentoTitular}</dd></div>
            </dl>
          )
        })() : (
          <p className="text-sm text-amber-600">⚠ Sin cuenta bancaria registrada.</p>
        )}
      </div>

      {/* DNI images */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Documentos subidos</h2>
        <div className="grid grid-cols-2 gap-4">
          {solicitud.evidencias.map((ev) => (
            <div key={ev.id}>
              <p className="mb-2 text-xs font-semibold text-gray-600">
                {ev.tipo === "DNI_FRONTAL" ? "DNI — Frontal" : "DNI — Posterior"}
              </p>
              <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                <Image src={ev.url} alt={ev.tipo} fill className="object-contain" />
              </div>
              <a
                href={ev.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-center text-xs text-[#1B3A6B] hover:underline"
              >
                Ver imagen completa ↗
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Acciones */}
      {isPendiente ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Decisión</h2>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleAprobar}
            disabled={submitting}
            className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
          >
            ✓ Aprobar solicitud
          </button>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-600">
              Motivo del rechazo <span className="text-red-500">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: La imagen del DNI no es legible. Por favor sube una foto más clara."
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#1B3A6B] focus:outline-none resize-none"
            />
            <button
              onClick={handleRechazar}
              disabled={submitting || !motivo.trim()}
              className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
            >
              ✕ Rechazar solicitud
            </button>
          </div>
        </div>
      ) : (
        <div className={`rounded-2xl border p-5 text-sm font-semibold ${
          solicitud.estado === "APROBADA"
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-red-200 bg-red-50 text-red-800"
        }`}>
          {solicitud.estado === "APROBADA" ? "✓ Solicitud aprobada" : "✕ Solicitud rechazada"}
          {solicitud.motivoRechazo && (
            <p className="mt-1 font-normal text-red-700 text-xs">{solicitud.motivoRechazo}</p>
          )}
        </div>
      )}
    </div>
  )
}
