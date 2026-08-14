"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { subirEvidenciaDisputaAction } from "@/app/actions/disputa.actions"

interface Props {
  disputaId: string
  operacionId: string
  label?: string
}

export function EvidenciaDisputaForm({ disputaId, operacionId, label = "Subir evidencia" }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setError(null)
    setOk(false)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("tipo", "disputas")

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      if (!uploadRes.ok) {
        const data = await uploadRes.json()
        throw new Error(data.error ?? "Error al subir imagen")
      }
      const { url, public_id } = await uploadRes.json()

      const res = await subirEvidenciaDisputaAction(disputaId, operacionId, {
        url,
        cloudinaryId: public_id,
      })
      if (res?.error) throw new Error(res.error)

      setOk(true)
      setFile(null)
      setPreview(null)
      if (inputRef.current) inputRef.current.value = ""
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-700">{label}</p>

      {ok && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Evidencia enviada correctamente. Puedes subir otra si lo necesitas.
        </div>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-6 hover:border-[#1B3A6B] hover:bg-blue-50 transition-colors"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="max-h-40 rounded-lg object-contain" />
        ) : (
          <>
            <span className="text-2xl">📎</span>
            <p className="mt-2 text-xs text-gray-500">Haz clic para seleccionar una imagen</p>
            <p className="text-xs text-gray-400">JPG, PNG o WEBP · máx. 5 MB</p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full rounded-xl bg-[#1B3A6B] py-2.5 text-sm font-bold text-white hover:bg-[#152d54] transition-colors disabled:opacity-50"
        >
          {uploading ? "Subiendo..." : "Enviar evidencia"}
        </button>
      )}
    </div>
  )
}
