"use client"

import { useState } from "react"
import type { VenueMapProps } from "./types"

const COLORS: Record<string, string> = {
  campo: "#22c55e",
  palcos: "#ec4899",
  norte: "#3b82f6",
  sur: "#8b5cf6",
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

export default function EstadioMonumental({
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
      viewBox="0 0 600 460"
      className="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Contorno estadio — más grande que el Nacional */}
      <ellipse
        cx={300}
        cy={232}
        rx={286}
        ry={218}
        fill="#0d1224"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={2}
      />

      {/* ESCENARIO */}
      <rect
        x={210}
        y={12}
        width={180}
        height={46}
        rx={8}
        fill="#080b14"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth={1.5}
      />
      <text
        x={300}
        y={40}
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
          x={110}
          y={64}
          width={380}
          height={54}
          rx={6}
          {...zs("palcos", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={300}
          y={96}
          textAnchor="middle"
          fill={tc("palcos")}
          fontSize={11}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.08em"
          style={{ pointerEvents: "none" }}
        >
          PALCOS
        </text>
      </g>

      {/* SUR — izquierda */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("sur")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("sur", "Tribuna Sur")}
      >
        <rect
          x={10}
          y={64}
          width={92}
          height={316}
          rx={6}
          {...zs("sur", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={56}
          y={222}
          textAnchor="middle"
          fill={tc("sur")}
          fontSize={11}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.08em"
          transform="rotate(-90,56,222)"
          style={{ pointerEvents: "none" }}
        >
          SUR
        </text>
      </g>

      {/* NORTE — derecha (El Cemento) */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("norte")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("norte", "Tribuna Norte — El Cemento")}
      >
        <rect
          x={498}
          y={64}
          width={92}
          height={316}
          rx={6}
          {...zs("norte", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={544}
          y={222}
          textAnchor="middle"
          fill={tc("norte")}
          fontSize={10}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.06em"
          transform="rotate(90,544,222)"
          style={{ pointerEvents: "none" }}
        >
          NORTE (EL CEMENTO)
        </text>
      </g>

      {/* ORIENTE — abajo */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("oriente")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("oriente", "Oriente")}
      >
        <rect
          x={110}
          y={396}
          width={380}
          height={52}
          rx={6}
          {...zs("oriente", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={300}
          y={427}
          textAnchor="middle"
          fill={tc("oriente")}
          fontSize={11}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.08em"
          style={{ pointerEvents: "none" }}
        >
          ORIENTE
        </text>
      </g>

      {/* CAMPO — centro */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("campo")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("campo", "Campo / Piso")}
      >
        <ellipse
          cx={300}
          cy={250}
          rx={168}
          ry={120}
          {...zs("campo", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={300}
          y={256}
          textAnchor="middle"
          fill={tc("campo")}
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
