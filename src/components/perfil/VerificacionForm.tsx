"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { crearSolicitudAction } from "@/app/actions/solicitud.actions"

async function subirImagen(file: File): Promise<{ url: string; cloudinaryId: string }> {
  const fd = new FormData()
  fd.append("file", file)
  fd.append("tipo", "dni")
  const res = await fetch("/api/upload", { method: "POST", body: fd })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error ?? "Error al subir imagen")
  }
  return res.json()
}

function FilePreview({ label, onChange }: { label: string; onChange: (f: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    onChange(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  return (
    <div
      className="relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-4 cursor-pointer hover:border-[#1B3A6B] hover:bg-blue-50 transition-colors min-h-[140px]"
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt={label} className="max-h-24 rounded-lg object-contain" />
      ) : (
        <>
          <span className="text-2xl">📄</span>
          <span className="text-xs font-semibold text-gray-600">{label}</span>
          <span className="text-[10px] text-gray-400">JPG, PNG o WEBP · máx. 5MB</span>
        </>
      )}
    </div>
  )
}

export function VerificacionForm() {
  const router = useRouter()
  const [frontal, setFrontal] = useState<File | null>(null)
  const [posterior, setPosterior] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!frontal || !posterior) {
      setError("Debes subir ambas fotos del DNI.")
      return
    }
    setLoading(true)
    setError(null)

    try {
      const [frontalResult, posteriorResult] = await Promise.all([
        subirImagen(frontal),
        subirImagen(posterior),
      ])

      const res = await crearSolicitudAction({
        dniFrontalUrl: frontalResult.url,
        dniFrontalCloudinaryId: frontalResult.cloudinaryId,
        dniPosteriorUrl: posteriorResult.url,
        dniPosteriorCloudinaryId: posteriorResult.cloudinaryId,
      })

      if (res?.error) {
        setError(res.error)
      } else {
        router.push("/perfil?verificacion=enviada")
        router.refresh()
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">DNI — Parte frontal</p>
          <FilePreview label="Foto frontal del DNI" onChange={setFrontal} />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">DNI — Parte posterior</p>
          <FilePreview label="Foto posterior del DNI" onChange={setPosterior} />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !frontal || !posterior}
        className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-gray-900 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Enviando solicitud..." : "Enviar solicitud de verificación"}
      </button>

      <p className="text-center text-xs text-gray-400">
        Tus documentos son revisados manualmente por el equipo de Transfiero y no se comparten con terceros.
      </p>
    </form>
  )
}
