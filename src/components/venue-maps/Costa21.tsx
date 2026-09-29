"use client"

import { useState } from "react"
import type { VenueMapProps } from "./types"

const COLORS: Record<string, string> = {
  platinum: "#eab308",
  vip: "#f97316",
  "tribuna-izquierda": "#3b82f6",
  "tribuna-derecha": "#8b5cf6",
  "tribuna-general": "#64748b",
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

export default function Costa21({
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
      viewBox="0 0 500 520"
      className="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Recinto exterior */}
      <rect
        x={8}
        y={8}
        width={484}
        height={504}
        rx={14}
        fill="#0d1224"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={2}
      />

      {/* MAR (decorativo) */}
      <text
        x={250}
        y={26}
        textAnchor="middle"
        fill="rgba(59,130,246,0.3)"
        fontSize={9}
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.15em"
      >
        MAR
      </text>

      {/* ESCENARIO */}
      <rect
        x={80}
        y={32}
        width={340}
        height={52}
        rx={8}
        fill="#080b14"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth={1.5}
      />
      <text
        x={250}
        y={62}
        textAnchor="middle"
        fill="rgba(255,255,255,0.38)"
        fontSize={12}
        fontFamily="system-ui, sans-serif"
        fontWeight={700}
        letterSpacing="0.1em"
      >
        ESCENARIO
      </text>

      {/* TRIBUNA IZQUIERDA — franja izquierda */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("tribuna-izquierda")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("tribuna-izquierda", "Tribuna Izquierda Numerado")}
      >
        <rect
          x={16}
          y={90}
          width={58}
          height={310}
          rx={5}
          {...zs("tribuna-izquierda", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={45}
          y={245}
          textAnchor="middle"
          fill={tc("tribuna-izquierda")}
          fontSize={9}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.05em"
          transform="rotate(-90,45,245)"
          style={{ pointerEvents: "none" }}
        >
          TRIBUNA IZQUIERDA
        </text>
      </g>

      {/* TRIBUNA DERECHA — franja derecha */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("tribuna-derecha")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("tribuna-derecha", "Tribuna Derecha Numerado")}
      >
        <rect
          x={426}
          y={90}
          width={58}
          height={310}
          rx={5}
          {...zs("tribuna-derecha", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={455}
          y={245}
          textAnchor="middle"
          fill={tc("tribuna-derecha")}
          fontSize={9}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.05em"
          transform="rotate(90,455,245)"
          style={{ pointerEvents: "none" }}
        >
          TRIBUNA DERECHA
        </text>
      </g>

      {/* PLATINUM — bloque central superior (dorado) */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("platinum")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("platinum", "Platinum Asientos Numerados")}
      >
        <rect
          x={80}
          y={90}
          width={340}
          height={160}
          rx={6}
          {...zs("platinum", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={250}
          y={168}
          textAnchor="middle"
          fill={tc("platinum")}
          fontSize={15}
          fontFamily="system-ui, sans-serif"
          fontWeight={800}
          letterSpacing="0.06em"
          style={{ pointerEvents: "none" }}
        >
          PLATINUM
        </text>
        <text
          x={250}
          y={188}
          textAnchor="middle"
          fill={tc("platinum")}
          fontSize={9}
          fontFamily="system-ui, sans-serif"
          fontWeight={500}
          letterSpacing="0.05em"
          style={{ pointerEvents: "none", opacity: 0.8 }}
        >
          ASIENTOS NUMERADOS
        </text>
      </g>

      {/* VIP — bloque central inferior */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("vip")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("vip", "VIP Sin Asientos")}
      >
        <rect
          x={80}
          y={256}
          width={340}
          height={144}
          rx={6}
          {...zs("vip", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={250}
          y={332}
          textAnchor="middle"
          fill={tc("vip")}
          fontSize={15}
          fontFamily="system-ui, sans-serif"
          fontWeight={800}
          letterSpacing="0.06em"
          style={{ pointerEvents: "none" }}
        >
          VIP
        </text>
        <text
          x={250}
          y={352}
          textAnchor="middle"
          fill={tc("vip")}
          fontSize={9}
          fontFamily="system-ui, sans-serif"
          fontWeight={500}
          letterSpacing="0.05em"
          style={{ pointerEvents: "none", opacity: 0.8 }}
        >
          SIN ASIENTOS
        </text>
      </g>

      {/* TRIBUNA GENERAL — dos bloques inferiores */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("tribuna-general")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("tribuna-general", "Tribuna General Numerado")}
      >
        <rect
          x={80}
          y={406}
          width={158}
          height={90}
          rx={6}
          {...zs("tribuna-general", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={159}
          y={447}
          textAnchor="middle"
          fill={tc("tribuna-general")}
          fontSize={9}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.04em"
          style={{ pointerEvents: "none" }}
        >
          TRIBUNA GENERAL
        </text>
        <text
          x={159}
          y={462}
          textAnchor="middle"
          fill={tc("tribuna-general")}
          fontSize={8}
          fontFamily="system-ui, sans-serif"
          style={{ pointerEvents: "none", opacity: 0.7 }}
        >
          NUMERADO
        </text>

        <rect
          x={262}
          y={406}
          width={158}
          height={90}
          rx={6}
          {...zs("tribuna-general", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={341}
          y={447}
          textAnchor="middle"
          fill={tc("tribuna-general")}
          fontSize={9}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.04em"
          style={{ pointerEvents: "none" }}
        >
          TRIBUNA GENERAL
        </text>
        <text
          x={341}
          y={462}
          textAnchor="middle"
          fill={tc("tribuna-general")}
          fontSize={8}
          fontFamily="system-ui, sans-serif"
          style={{ pointerEvents: "none", opacity: 0.7 }}
        >
          NUMERADO
        </text>
      </g>

      <text
        x={250}
        y={504}
        textAnchor="middle"
        fill="rgba(255,255,255,0.18)"
        fontSize={9}
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.06em"
      >
        Costa 21 · Costa Verde, Lima
      </text>
    </svg>
  )
}
