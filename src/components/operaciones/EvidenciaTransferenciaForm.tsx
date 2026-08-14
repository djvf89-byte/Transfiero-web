"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { subirEvidenciaTransferenciaAction } from "@/app/actions/operacion.actions"

async function subirArchivo(file: File): Promise<{ url: string; cloudinaryId: string }> {
  const fd = new FormData()
  fd.append("file", file)
  fd.append("tipo", "evidencia")
  const res = await fetch("/api/upload", { method: "POST", body: fd })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error ?? "Error al subir archivo")
  }
  return res.json()
}

interface Props {
  operacionId: string
}

export function EvidenciaTransferenciaForm({ operacionId }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setArchivo(f)
    if (f && f.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!archivo) { setError("Selecciona la evidencia de transferencia."); return }
    setLoading(true)
    setError(null)
    try {
      const upload = await subirArchivo(archivo)
      const res = await subirEvidenciaTransferenciaAction(operacionId, {
        url: upload.url,
        cloudinaryId: upload.cloudinaryId,
      })
      if (res?.error) { setError(res.error) } else { router.refresh() }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-bold text-amber-800 mb-1">⚡ Sube la evidencia de transferencia</p>
        <p className="text-sm text-amber-700">
          Captura o descarga la confirmación de la transferencia oficial desde la ticketera y súbela aquí.
        </p>
      </div>

      <div
        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-5 cursor-pointer hover:border-[#1B3A6B] hover:bg-blue-50 transition-colors min-h-[130px]"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handleFile}
        />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="evidencia" className="max-h-28 rounded-lg object-contain" />
        ) : archivo ? (
          <div className="text-center">
            <span className="text-3xl">📄</span>
            <p className="mt-1 text-xs font-semibold text-gray-600">{archivo.name}</p>
          </div>
        ) : (
          <>
            <span className="text-3xl">📤</span>
            <span className="text-xs text-gray-500">Imagen o PDF de la confirmación</span>
          </>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading || !archivo}
        className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-gray-900 hover:bg-amber-400 disabled:opacity-50 transition-colors"
      >
        {loading ? "Subiendo..." : "Subir evidencia de transferencia"}
      </button>

      <p className="text-center text-xs text-gray-400">
        Tienes 48 horas desde que fuiste notificado para subir la evidencia.
      </p>
    </form>
  )
}
