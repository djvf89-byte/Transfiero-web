"use client"

import { useState } from "react"
import type { VenueMapProps } from "./types"

const COLORS: Record<string, string> = {
  piso: "#22c55e",
  vip: "#ec4899",
  "platea-baja": "#3b82f6",
  "platea-alta": "#8b5cf6",
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

export default function ArenaPeruCapital({
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
      viewBox="0 0 540 460"
      className="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Recinto exterior */}
      <rect
        x={8}
        y={8}
        width={524}
        height={444}
        rx={20}
        fill="#0d1224"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={2}
      />

      {/* ESCENARIO */}
      <rect
        x={150}
        y={14}
        width={240}
        height={54}
        rx={8}
        fill="#080b14"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth={1.5}
      />
      <text
        x={270}
        y={45}
        textAnchor="middle"
        fill="rgba(255,255,255,0.38)"
        fontSize={11}
        fontFamily="system-ui, sans-serif"
        fontWeight={700}
        letterSpacing="0.1em"
      >
        ESCENARIO
      </text>

      {/* PLATEA ALTA — banda superior (nivel 2) */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("platea-alta")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("platea-alta", "Platea Alta")}
      >
        <rect
          x={16}
          y={74}
          width={508}
          height={46}
          rx={6}
          {...zs("platea-alta", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={270}
          y={102}
          textAnchor="middle"
          fill={tc("platea-alta")}
          fontSize={11}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.07em"
          style={{ pointerEvents: "none" }}
        >
          PLATEA ALTA
        </text>
      </g>

      {/* VIP — laterales (izq y der) */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("vip")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("vip", "VIP")}
      >
        <rect
          x={16}
          y={126}
          width={90}
          height={276}
          rx={6}
          {...zs("vip", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={61}
          y={264}
          textAnchor="middle"
          fill={tc("vip")}
          fontSize={11}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.06em"
          transform="rotate(-90,61,264)"
          style={{ pointerEvents: "none" }}
        >
          VIP
        </text>
        <rect
          x={434}
          y={126}
          width={90}
          height={276}
          rx={6}
          {...zs("vip", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={479}
          y={264}
          textAnchor="middle"
          fill={tc("vip")}
          fontSize={11}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.06em"
          transform="rotate(90,479,264)"
          style={{ pointerEvents: "none" }}
        >
          VIP
        </text>
      </g>

      {/* PLATEA BAJA — banda inferior */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("platea-baja")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("platea-baja", "Platea Baja")}
      >
        <rect
          x={110}
          y={126}
          width={320}
          height={56}
          rx={6}
          {...zs("platea-baja", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={270}
          y={159}
          textAnchor="middle"
          fill={tc("platea-baja")}
          fontSize={11}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.07em"
          style={{ pointerEvents: "none" }}
        >
          PLATEA BAJA
        </text>
        {/* arco trasero */}
        <rect
          x={110}
          y={360}
          width={320}
          height={42}
          rx={6}
          {...zs("platea-baja", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={270}
          y={386}
          textAnchor="middle"
          fill={tc("platea-baja")}
          fontSize={11}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.07em"
          style={{ pointerEvents: "none" }}
        >
          PLATEA BAJA
        </text>
      </g>

      {/* PISO / FLOOR — centro */}
      <g
        style={{ cursor: mode === "select" ? "pointer" : "default" }}
        onMouseEnter={() => setHovered("piso")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => click("piso", "Piso / Floor")}
      >
        <rect
          x={110}
          y={188}
          width={320}
          height={166}
          rx={8}
          {...zs("piso", selectedZone, hovered, mode, availableZones)}
        />
        <text
          x={270}
          y={278}
          textAnchor="middle"
          fill={tc("piso")}
          fontSize={14}
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          letterSpacing="0.06em"
          style={{ pointerEvents: "none" }}
        >
          PISO
        </text>
        <text
          x={270}
          y={298}
          textAnchor="middle"
          fill={tc("piso")}
          fontSize={10}
          fontFamily="system-ui, sans-serif"
          fontWeight={500}
          style={{ pointerEvents: "none", opacity: 0.7 }}
        >
          FLOOR
        </text>
      </g>

      {/* Nivel 2 labels */}
      <text
        x={270}
        y={430}
        textAnchor="middle"
        fill="rgba(255,255,255,0.2)"
        fontSize={9}
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.06em"
      >
        Arena Perú Capital · La Molina
      </text>
    </svg>
  )
}
