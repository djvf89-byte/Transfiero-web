"use client"

import { useEffect, useRef, useState } from "react"
import { registrarInteresAction } from "@/app/actions/interes.actions"

interface Props {
  spotifyEmbedUrl: string
  artista?: string | null
  publicacionId?: string
}

export function SpotifyPlayer({ spotifyEmbedUrl, artista, publicacionId }: Props) {
  const [oculto, setOculto] = useState(false)
  const registrado = useRef(false)

  useEffect(() => {
    if (!publicacionId || registrado.current) return
    registrado.current = true
    void registrarInteresAction(publicacionId, "VISUALIZACION")
  }, [publicacionId])

  if (oculto) return null

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.04] p-5">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-white/35">
        Escucha al artista antes del evento
      </p>
      {artista && (
        <p className="mb-3 text-sm font-semibold text-white/55">{artista}</p>
      )}
      <iframe
        src={`${spotifyEmbedUrl}?utm_source=generator&theme=0`}
        width="100%"
        height="80"
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        className="rounded-xl border-0 block"
        onError={() => setOculto(true)}
      />
    </div>
  )
}
