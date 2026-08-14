"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { subirComprobanteAction, cancelarReservaAction } from "@/app/actions/operacion.actions"

const METODOS = [
  { value: "YAPE", label: "Yape", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "PLIN", label: "Plin", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "TRANSFERENCIA_BANCARIA", label: "Transferencia bancaria", color: "bg-blue-100 text-blue-800 border-blue-200" },
] as const

type Metodo = typeof METODOS[number]["value"]

interface Props {
  operacionId: string
  montoCompradorCentimos: number
  yaSubioComprobante: boolean
}

async function subirImagen(file: File): Promise<{ url: string; cloudinaryId: string }> {
  const fd = new FormData()
  fd.append("file", file)
  fd.append("tipo", "pago")
  const res = await fetch("/api/upload", { method: "POST", body: fd })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error ?? "Error al subir imagen")
  }
  return res.json()
}

export function AccionesCompradorPago({ operacionId, montoCompradorCentimos, yaSubioComprobante }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [metodo, setMetodo] = useState<Metodo>("YAPE")
  const [referencia, setReferencia] = useState("")
  const [archivo, setArchivo] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [cancelando, setCancelando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmaCancelar, setConfirmaCancelar] = useState(false)

  const monto = (montoCompradorCentimos / 100).toFixed(2)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setArchivo(f)
    if (f) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!archivo) { setError("Selecciona el comprobante de pago."); return }
    setLoading(true)
    setError(null)
    try {
      const upload = await subirImagen(archivo)
      const res = await subirComprobanteAction(operacionId, {
        tipo: metodo,
        url: upload.url,
        cloudinaryId: upload.cloudinaryId,
        referencia: referencia.trim() || undefined,
      })
      if (res?.error) { setError(res.error) } else { router.refresh() }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelar() {
    setCancelando(true)
    const res = await cancelarReservaAction(operacionId)
    if (res?.error) { setError(res.error); setCancelando(false) }
    else { router.push("/mis-compras") }
  }

  return (
    <div className="space-y-5">
      {/* Instrucciones de pago */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
        <p className="text-sm font-bold text-amber-800">💳 Cómo realizar el pago</p>
        <p className="text-sm text-amber-700">
          Transfiere exactamente <span className="font-bold">S/ {monto}</span> a:
        </p>
        <div className="rounded-lg bg-white border border-amber-100 p-3 space-y-1 text-sm">
          <p><span className="text-gray-500">Yape / Plin:</span> <span className="font-semibold">+51 999 000 000</span></p>
          <p><span className="text-gray-500">BCP:</span> <span className="font-semibold">193-12345678-0-45</span></p>
          <p><span className="text-gray-500">A nombre de:</span> <span className="font-semibold">Transfiero SAC</span></p>
        </div>
        <p className="text-xs text-amber-600">Incluye tu nombre en el concepto del pago.</p>
      </div>

      {/* Form comprobante */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm font-bold text-gray-700">Subir comprobante de pago</p>

        {/* Método */}
        <div className="flex flex-wrap gap-2">
          {METODOS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMetodo(m.value)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                metodo === m.value ? m.color : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Referencia */}
        <input
          type="text"
          value={referencia}
          onChange={(e) => setReferencia(e.target.value)}
          placeholder="Número de operación o referencia (opcional)"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#1B3A6B] focus:outline-none"
        />

        {/* Imagen */}
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-4 cursor-pointer hover:border-[#1B3A6B] hover:bg-blue-50 transition-colors min-h-[120px]"
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="comprobante" className="max-h-32 rounded-lg object-contain" />
          ) : (
            <>
              <span className="text-2xl">📸</span>
              <span className="text-xs text-gray-500">Toca para seleccionar captura del comprobante</span>
            </>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading || !archivo}
          className="w-full rounded-xl bg-[#1B3A6B] px-4 py-3 text-sm font-bold text-white hover:bg-[#152d54] disabled:opacity-50 transition-colors"
        >
          {loading ? "Enviando..." : yaSubioComprobante ? "Reenviar comprobante" : "Enviar comprobante"}
        </button>
      </form>

      {/* Cancelar */}
      <div className="border-t border-gray-100 pt-4">
        {!confirmaCancelar ? (
          <button
            onClick={() => setConfirmaCancelar(true)}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Cancelar reserva →
          </button>
        ) : (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-red-700">¿Seguro que quieres cancelar?</p>
            <p className="text-xs text-red-600">La entrada volverá a estar disponible para otros compradores.</p>
            <div className="flex gap-2">
              <button
                onClick={handleCancelar}
                disabled={cancelando}
                className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
              >
                {cancelando ? "Cancelando..." : "Sí, cancelar"}
              </button>
              <button
                onClick={() => setConfirmaCancelar(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                No, volver
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
