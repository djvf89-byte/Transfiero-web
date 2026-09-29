"use client"

import { useState } from "react"
import type { VenueMapProps } from "./types"

const COLORS: Record<string, string> = {
  campo: "#22c55e",
  palcos: "#ec4899",
  sur: "#3b82f6",
  norte: "#8b5cf6",
  oriente: "#f59e0b",
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

export default function EstadioNacional({
  mode,
  selectedZone,
  onZoneSelect,
  availableZones,
}: VenueMapProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  function click(id: string, label: string) {
    if (mode === "select") onZoneSelect?.(id, label)
  }

  const textColor = (id: string) =>
    selectedZone === id ? COLORS[id] : `${COLORS[id]}aa`

  return (
    <svg
      viewBox="0 0 560 440"
      className="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Contorno estadio */}
      <ellipse
        cx={280}
        cy={222}
        rx={266}
        ry={202}
        fill="#0d1224"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={2}
      />

      {/* ESCENARIO (no-interactive) */}
      <rect
        x={196}
        y={12}
        width={168}
        height={44}
        rx={8}
        fill="#080b14"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth={1.5}
      />
      <text
        x={280}
        y={39}
        textAnchor="middle"
        fill="rgba(255,255,255,0.38)"
        fontSize={11}
        fontFamily="system-ui, sans-serif"
        fontWeight={700}
        letterSpacing="0.1em"
      >
        ESCENARIO
      </text>

      {/* PALCOS */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("palcos")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("palcos", "Palcos")}
      >
        <rect
          x={102}
          y={62}
          width={356}
          height={52}
          rx={6}
          {...zs("palcos", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={280}
          y={93}
          textAnchor="middle"
          fill={textColor("palcos")}
          fontSize={11}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.08em"
          style={{ pointerEvents: "none" }}
        >
          PALCOS
        </text>
      </g>

      {/* SUR (izquierda) */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("sur")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("sur", "Tribuna Sur")}
      >
        <rect
          x={12}
          y={62}
          width={82}
          height={298}
          rx={6}
          {...zs("sur", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={53}
          y={212}
          textAnchor="middle"
          fill={textColor("sur")}
          fontSize={11}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.08em"
          transform="rotate(-90,53,212)"
          style={{ pointerEvents: "none" }}
        >
          SUR
        </text>
      </g>

      {/* NORTE (derecha) */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("norte")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("norte", "Tribuna Norte")}
      >
        <rect
          x={466}
          y={62}
          width={82}
          height={298}
          rx={6}
          {...zs("norte", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={507}
          y={212}
          textAnchor="middle"
          fill={textColor("norte")}
          fontSize={11}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.08em"
          transform="rotate(90,507,212)"
          style={{ pointerEvents: "none" }}
        >
          NORTE
        </text>
      </g>

      {/* ORIENTE (abajo) */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("oriente")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("oriente", "Oriente")}
      >
        <rect
          x={102}
          y={374}
          width={356}
          height={52}
          rx={6}
          {...zs("oriente", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={280}
          y={405}
          textAnchor="middle"
          fill={textColor("oriente")}
          fontSize={11}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.08em"
          style={{ pointerEvents: "none" }}
        >
          ORIENTE
        </text>
      </g>

      {/* CAMPO (centro, encima de todo) */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("campo")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("campo", "Campo / Piso")}
      >
        <ellipse
          cx={280}
          cy={238}
          rx={152}
          ry={108}
          {...zs("campo", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={280}
          y={244}
          textAnchor="middle"
          fill={textColor("campo")}
          fontSize={13}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.06em"
          style={{ pointerEvents: "none" }}
        >
          CAMPO
        </text>
      </g>
    </svg>
  )
}
