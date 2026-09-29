"use client"

import { useState } from "react"
import type { VenueMapProps } from "./types"

const COLORS: Record<string, string> = {
  platea: "#22c55e",
  "platea-lateral": "#3b82f6",
  mezanine: "#f59e0b",
  anfiteatro: "#8b5cf6",
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

export default function GranTeatroNacional({
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
      viewBox="0 0 520 480"
      className="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Teatro exterior */}
      <rect
        x={8}
        y={8}
        width={504}
        height={464}
        rx={24}
        fill="#0d1224"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={2}
      />

      {/* Escenario */}
      <rect
        x={130}
        y={16}
        width={260}
        height={64}
        rx={8}
        fill="#080b14"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth={1.5}
      />
      <text
        x={260}
        y={48}
        textAnchor="middle"
        fill="rgba(255,255,255,0.38)"
        fontSize={12}
        fontFamily="system-ui, sans-serif"
        fontWeight={700}
        letterSpacing="0.1em"
      >
        ESCENARIO
      </text>
      <text
        x={260}
        y={66}
        textAnchor="middle"
        fill="rgba(255,255,255,0.2)"
        fontSize={9}
        fontFamily="system-ui, sans-serif"
      >
        Gran Teatro Nacional
      </text>

      {/* ANFITEATRO — nivel 3, banda más alta */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("anfiteatro")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("anfiteatro", "Anfiteatro")}
      >
        <rect
          x={16}
          y={86}
          width={488}
          height={38}
          rx={6}
          {...zs("anfiteatro", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={260}
          y={110}
          textAnchor="middle"
          fill={tc("anfiteatro")}
          fontSize={11}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.08em"
          style={{ pointerEvents: "none" }}
        >
          ANFITEATRO
        </text>
      </g>

      {/* MEZANINE — nivel 2 */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("mezanine")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("mezanine", "Mezanine")}
      >
        <rect
          x={30}
          y={130}
          width={460}
          height={46}
          rx={6}
          {...zs("mezanine", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={260}
          y={158}
          textAnchor="middle"
          fill={tc("mezanine")}
          fontSize={11}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.08em"
          style={{ pointerEvents: "none" }}
        >
          MEZANINE
        </text>
      </g>

      {/* PLATEA LATERAL — palcos laterales */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("platea-lateral")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("platea-lateral", "Platea Lateral")}
      >
        <rect
          x={16}
          y={182}
          width={80}
          height={260}
          rx={6}
          {...zs("platea-lateral", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={56}
          y={312}
          textAnchor="middle"
          fill={tc("platea-lateral")}
          fontSize={10}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.05em"
          transform="rotate(-90,56,312)"
          style={{ pointerEvents: "none" }}
        >
          PLATEA LATERAL
        </text>
        <rect
          x={424}
          y={182}
          width={80}
          height={260}
          rx={6}
          {...zs("platea-lateral", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={464}
          y={312}
          textAnchor="middle"
          fill={tc("platea-lateral")}
          fontSize={10}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.05em"
          transform="rotate(90,464,312)"
          style={{ pointerEvents: "none" }}
        >
          PLATEA LATERAL
        </text>
      </g>

      {/* PLATEA CENTRAL */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("platea")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("platea", "Platea Central")}
      >
        <rect
          x={102}
          y={182}
          width={316}
          height={260}
          rx={8}
          {...zs("platea", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={260}
          y={318}
          textAnchor="middle"
          fill={tc("platea")}
          fontSize={14}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.06em"
          style={{ pointerEvents: "none" }}
        >
          PLATEA
        </text>
        <text
          x={260}
          y={340}
          textAnchor="middle"
          fill={tc("platea")}
          fontSize={10}
          fontFamily="system-ui, sans-serif"
          fontWeight={500}
          style={{ pointerEvents: "none", opacity: 0.7 }}
        >
          CENTRAL
        </text>
      </g>

      <text
        x={260}
        y={462}
        textAnchor="middle"
        fill="rgba(255,255,255,0.18)"
        fontSize={9}
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.06em"
      >
        Gran Teatro Nacional · San Borja
      </text>
    </svg>
  )
}
