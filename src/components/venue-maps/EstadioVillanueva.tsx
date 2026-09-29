"use client"

import { useState } from "react"
import type { VenueMapProps } from "./types"

const COLORS: Record<string, string> = {
  norte: "#3b82f6",
  sur: "#8b5cf6",
  "tribuna-este": "#f59e0b",
  "tribuna-oeste": "#10b981",
}

function zs(
  id: string,
  selected: string | null | undefined,
  hovered: string | null,
  mode: "select" | "display",
  availableZones?: string[]
) {
  const c = COLORS[id] ?? "#6b7280"
  const sel = selected === id
  const hov = hovered === id && mode === "select"
  const avail = !availableZones || availableZones.includes(id)
  return {
    fill: sel ? `${c}33` : hov ? `${c}22` : `${c}14`,
    stroke: sel || hov ? c : avail ? `${c}66` : "#334155",
    strokeWidth: sel ? 2.5 : 1.5,
    opacity: avail ? 1 : 0.45,
  }
}

export default function EstadioVillanueva({
  mode,
  selectedZone,
  onZoneSelect,
  availableZones,
}: VenueMapProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  function click(id: string, label: string) {
    if (mode === "select") onZoneSelect?.(id, label)
  }

  const tc = (id: string) =>
    selectedZone === id ? COLORS[id] : `${COLORS[id]}aa`

  return (
    <svg
      viewBox="0 0 520 420"
      className="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Contorno — más compacto y rectangular (Matute) */}
      <rect
        x={8}
        y={8}
        width={504}
        height={404}
        rx={28}
        fill="#0d1224"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={2}
      />

      {/* Cancha (no-interactive) */}
      <rect
        x={120}
        y={100}
        width={280}
        height={220}
        rx={6}
        fill="#0a1f12"
        stroke="rgba(34,197,94,0.2)"
        strokeWidth={1}
      />
      <text
        x={260}
        y={218}
        textAnchor="middle"
        fill="rgba(34,197,94,0.3)"
        fontSize={12}
        fontFamily="system-ui, sans-serif"
        fontWeight={600}
        letterSpacing="0.08em"
      >
        CANCHA
      </text>

      {/* ESCENARIO — arriba del estadio */}
      <rect
        x={160}
        y={16}
        width={200}
        height={36}
        rx={6}
        fill="#080b14"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={1}
      />
      <text
        x={260}
        y={38}
        textAnchor="middle"
        fill="rgba(255,255,255,0.35)"
        fontSize={10}
        fontFamily="system-ui, sans-serif"
        fontWeight={700}
        letterSpacing="0.1em"
      >
        ESCENARIO
      </text>

      {/* NORTE — arriba */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("norte")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("norte", "Tribuna Norte")}
      >
        <rect
          x={120}
          y={58}
          width={280}
          height={36}
          rx={5}
          {...zs("norte", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={260}
          y={81}
          textAnchor="middle"
          fill={tc("norte")}
          fontSize={10}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.08em"
          style={{ pointerEvents: "none" }}
        >
          NORTE
        </text>
      </g>

      {/* TRIBUNA ESTE — derecha */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("tribuna-este")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("tribuna-este", "Tribuna Este")}
      >
        <rect
          x={408}
          y={58}
          width={96}
          height={304}
          rx={5}
          {...zs("tribuna-este", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={456}
          y={210}
          textAnchor="middle"
          fill={tc("tribuna-este")}
          fontSize={10}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.06em"
          transform="rotate(90,456,210)"
          style={{ pointerEvents: "none" }}
        >
          TRIBUNA ESTE
        </text>
      </g>

      {/* TRIBUNA OESTE — izquierda */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("tribuna-oeste")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("tribuna-oeste", "Tribuna Oeste")}
      >
        <rect
          x={16}
          y={58}
          width={96}
          height={304}
          rx={5}
          {...zs("tribuna-oeste", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={64}
          y={210}
          textAnchor="middle"
          fill={tc("tribuna-oeste")}
          fontSize={10}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.06em"
          transform="rotate(-90,64,210)"
          style={{ pointerEvents: "none" }}
        >
          TRIBUNA OESTE
        </text>
      </g>

      {/* SUR — abajo */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("sur")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("sur", "Tribuna Sur")}
      >
        <rect
          x={120}
          y={326}
          width={280}
          height={80}
          rx={5}
          {...zs("sur", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={260}
          y={372}
          textAnchor="middle"
          fill={tc("sur")}
          fontSize={10}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.08em"
          style={{ pointerEvents: "none" }}
        >
          SUR
        </text>
      </g>
    </svg>
  )
}
