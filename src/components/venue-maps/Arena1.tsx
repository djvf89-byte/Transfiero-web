"use client"

import { useState } from "react"
import type { VenueMapProps } from "./types"

// Arena 1 / Costa Verde: layout HORIZONTAL — Escenario a la DERECHA
// GENERAL (óvalo grande izquierda) | PREFERENCIAL (rectángulo centro) | PLATINUM (rectángulo derecha junto al escenario)

const COLORS: Record<string, string> = {
  general: "#22c55e",
  preferencial: "#f59e0b",
  platinum: "#ec4899",
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

export default function Arena1({
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
      viewBox="0 0 700 360"
      className="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Recinto exterior */}
      <rect
        x={8}
        y={8}
        width={684}
        height={344}
        rx={16}
        fill="#0d1224"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={2}
      />

      {/* Etiqueta MAR (Costa Verde) */}
      <text
        x={100}
        y={22}
        textAnchor="middle"
        fill="rgba(59,130,246,0.25)"
        fontSize={8}
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.12em"
      >
        MAR · COSTA VERDE
      </text>

      {/* ESCENARIO — derecha */}
      <rect
        x={598}
        y={40}
        width={92}
        height={280}
        rx={8}
        fill="#080b14"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth={1.5}
      />
      <text
        x={644}
        y={184}
        textAnchor="middle"
        fill="rgba(255,255,255,0.38)"
        fontSize={11}
        fontFamily="system-ui, sans-serif"
        fontWeight={700}
        letterSpacing="0.1em"
        transform="rotate(90,644,184)"
      >
        ESCENARIO
      </text>

      {/* PLATINUM — junto al escenario */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("platinum")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("platinum", "Platinum")}
      >
        <rect
          x={466}
          y={40}
          width={126}
          height={280}
          rx={6}
          {...zs("platinum", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={529}
          y={178}
          textAnchor="middle"
          fill={tc("platinum")}
          fontSize={13}
          fontFamily="system-ui, sans-serif"
          fontWeight={800}
          letterSpacing="0.06em"
          transform="rotate(90,529,178)"
          style={{ pointerEvents: "none" }}
        >
          PLATINUM
        </text>
      </g>

      {/* PREFERENCIAL — centro */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("preferencial")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("preferencial", "Preferencial")}
      >
        <rect
          x={310}
          y={40}
          width={150}
          height={280}
          rx={6}
          {...zs("preferencial", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={385}
          y={180}
          textAnchor="middle"
          fill={tc("preferencial")}
          fontSize={12}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.05em"
          transform="rotate(90,385,180)"
          style={{ pointerEvents: "none" }}
        >
          PREFERENCIAL
        </text>
      </g>

      {/* GENERAL — gran óvalo izquierda */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("general")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("general", "General")}
      >
        <ellipse
          cx={180}
          cy={180}
          rx={152}
          ry={130}
          {...zs("general", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={180}
          y={186}
          textAnchor="middle"
          fill={tc("general")}
          fontSize={16}
          fontFamily="system-ui, sans-serif"
          fontWeight={800}
          letterSpacing="0.06em"
          style={{ pointerEvents: "none" }}
        >
          GENERAL
        </text>
      </g>

      {/* Ingresos (decorativos) */}
      <text
        x={30}
        y={130}
        fill="rgba(255,255,255,0.2)"
        fontSize={7}
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.04em"
      >
        INGRESO GENERAL
      </text>
      <text
        x={30}
        y={240}
        fill="rgba(255,255,255,0.2)"
        fontSize={7}
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.04em"
      >
        INGRESO PREFERENCIAL
      </text>
      <text
        x={470}
        y={24}
        fill="rgba(255,255,255,0.2)"
        fontSize={7}
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.04em"
      >
        INGRESO PLATINUM IZQ.
      </text>
      <text
        x={470}
        y={348}
        fill="rgba(255,255,255,0.2)"
        fontSize={7}
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.04em"
      >
        INGRESO PLATINUM DER.
      </text>

      <text
        x={350}
        y={344}
        textAnchor="middle"
        fill="rgba(255,255,255,0.18)"
        fontSize={9}
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.06em"
      >
        Arena 1 · Costa Verde, Lima
      </text>
    </svg>
  )
}
