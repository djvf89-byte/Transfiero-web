import type { Ticketera } from "@prisma/client"

// variant "dark" → para fondos oscuros (form, admin, hero)
// variant "light" → para fondos blancos (página pública de detalle)
const CONFIG: Record<
  Ticketera,
  {
    label: string
    nivel: string
    dark: string
    light: string
    dot: string
  }
> = {
  TICKETMASTER: {
    label: "Ticketmaster",
    nivel: "Seguridad alta",
    dark: "border-green-500/30 bg-green-500/10 text-green-300",
    light: "border-green-200 bg-green-50 text-green-800",
    dot: "bg-green-400",
  },
  JOINNUS: {
    label: "Joinnus",
    nivel: "Seguridad media/alta",
    dark: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    light: "border-blue-200 bg-blue-50 text-blue-800",
    dot: "bg-blue-400",
  },
  TELETICKET: {
    label: "Teleticket",
    nivel: "Seguridad media",
    dark: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    light: "border-amber-200 bg-amber-50 text-amber-800",
    dot: "bg-amber-400",
  },
}

interface Props {
  ticketera: Ticketera
  showNivel?: boolean
  variant?: "dark" | "light"
}

export function TicketeraBadge({ ticketera, showNivel = false, variant = "light" }: Props) {
  const c = CONFIG[ticketera]
  const cls = variant === "dark" ? c.dark : c.light

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
      {showNivel && <span className="opacity-70">· {c.nivel}</span>}
    </span>
  )
}
