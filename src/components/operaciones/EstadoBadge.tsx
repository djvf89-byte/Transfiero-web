import type { EstadoOperacion, EstadoPublicacion } from "@prisma/client"

type EstadoCombinado = EstadoOperacion | EstadoPublicacion

interface Config {
  label: string
  dot: string
  classes: string
}

// Labels para el panel admin y mis-publicaciones (técnicos/completos)
const CONFIGS_ADMIN: Partial<Record<string, Config>> = {
  DISPONIBLE:                        { label: "Disponible",            dot: "bg-green-400",  classes: "border border-green-500/30 bg-green-500/10 text-green-400" },
  PENDIENTE_VENDEDOR:                { label: "Esperando vendedor",    dot: "bg-amber-400",  classes: "border border-amber-500/30 bg-amber-500/10 text-amber-400" },
  RESERVADA:                         { label: "Reservada",             dot: "bg-orange-400", classes: "border border-orange-500/30 bg-orange-500/10 text-orange-400" },
  PENDIENTE_REVISION:                { label: "En revisión",           dot: "bg-yellow-400", classes: "border border-yellow-500/30 bg-yellow-500/10 text-yellow-400" },
  BORRADOR:                          { label: "Borrador",              dot: "bg-white/40",   classes: "border border-white/15 bg-white/8 text-white/50" },
  EN_TRANSFERENCIA:                  { label: "En transferencia",      dot: "bg-violet-400", classes: "border border-violet-500/30 bg-violet-500/10 text-violet-400" },
  TRANSFERIDA:                       { label: "Transferida",           dot: "bg-violet-400", classes: "border border-violet-500/30 bg-violet-500/10 text-violet-400" },
  COMPLETADA:                        { label: "Completada",            dot: "bg-blue-400",   classes: "border border-blue-500/30 bg-blue-500/10 text-blue-400" },
  CANCELADA:                         { label: "Cancelada",             dot: "bg-red-400",    classes: "border border-red-500/30 bg-red-500/10 text-red-400" },
  EN_DISPUTA:                        { label: "En disputa",            dot: "bg-red-400",    classes: "border border-red-500/30 bg-red-500/10 text-red-400" },
  ESPERANDO_VENDEDOR:                { label: "Esperando respuesta",   dot: "bg-amber-400",  classes: "border border-amber-500/30 bg-amber-500/10 text-amber-400" },
  PAGO_PENDIENTE:                    { label: "Pendiente de pago",     dot: "bg-amber-400",  classes: "border border-amber-500/30 bg-amber-500/10 text-amber-400" },
  PAGO_RECIBIDO:                     { label: "Pago recibido",         dot: "bg-blue-400",   classes: "border border-blue-500/30 bg-blue-500/10 text-blue-400" },
  VENDEDOR_NOTIFICADO:               { label: "Vendedor notificado",   dot: "bg-violet-400", classes: "border border-violet-500/30 bg-violet-500/10 text-violet-400" },
  TRANSFERENCIA_EN_PROCESO:          { label: "En transferencia",      dot: "bg-violet-400", classes: "border border-violet-500/30 bg-violet-500/10 text-violet-400" },
  PENDIENTE_CONFIRMACION_COMPRADOR:  { label: "Pendiente confirmación",dot: "bg-orange-400", classes: "border border-orange-500/30 bg-orange-500/10 text-orange-400" },
  COMPRADOR_CONFIRMADO:              { label: "Confirmado",            dot: "bg-blue-400",   classes: "border border-blue-500/30 bg-blue-500/10 text-blue-400" },
  FONDOS_LIBERADOS:                  { label: "Fondos liberados",      dot: "bg-green-400",  classes: "border border-green-500/30 bg-green-500/10 text-green-400" },
  REEMBOLSADA:                       { label: "Reembolsada",           dot: "bg-blue-400",   classes: "border border-blue-500/30 bg-blue-500/10 text-blue-400" },
}

// Labels simplificados para la vista del comprador
const CONFIGS_COMPRADOR: Partial<Record<string, Config>> = {
  ...CONFIGS_ADMIN,
  ESPERANDO_VENDEDOR:                { label: "Reserva enviada",             dot: "bg-amber-400",  classes: "border border-amber-500/30 bg-amber-500/10 text-amber-400" },
  PAGO_PENDIENTE:                    { label: "Realiza tu pago",             dot: "bg-amber-400",  classes: "border border-amber-500/30 bg-amber-500/10 text-amber-400" },
  PAGO_RECIBIDO:                     { label: "Esperando transferencia",     dot: "bg-amber-400",  classes: "border border-amber-500/30 bg-amber-500/10 text-amber-400" },
  VENDEDOR_NOTIFICADO:               { label: "Esperando transferencia",     dot: "bg-amber-400",  classes: "border border-amber-500/30 bg-amber-500/10 text-amber-400" },
  TRANSFERENCIA_EN_PROCESO:          { label: "Esperando transferencia",     dot: "bg-amber-400",  classes: "border border-amber-500/30 bg-amber-500/10 text-amber-400" },
  PENDIENTE_CONFIRMACION_COMPRADOR:  { label: "Confirma si recibiste",       dot: "bg-orange-400", classes: "border border-orange-500/30 bg-orange-500/10 text-orange-400" },
  COMPRADOR_CONFIRMADO:              { label: "Entrada recibida",            dot: "bg-green-400",  classes: "border border-green-500/30 bg-green-500/10 text-green-400" },
  FONDOS_LIBERADOS:                  { label: "Operación completada",        dot: "bg-green-400",  classes: "border border-green-500/30 bg-green-500/10 text-green-400" },
  EN_DISPUTA:                        { label: "Disputa en proceso",          dot: "bg-red-400",    classes: "border border-red-500/30 bg-red-500/10 text-red-400" },
  CANCELADA:                         { label: "Cancelada",                   dot: "bg-white/40",   classes: "border border-white/15 bg-white/8 text-white/40" },
  REEMBOLSADA:                       { label: "Reembolsada",                 dot: "bg-blue-400",   classes: "border border-blue-500/30 bg-blue-500/10 text-blue-400" },
}

// Labels simplificados para la vista del vendedor
const CONFIGS_VENDEDOR: Partial<Record<string, Config>> = {
  ...CONFIGS_ADMIN,
  ESPERANDO_VENDEDOR:                { label: "Nueva reserva",               dot: "bg-amber-400",  classes: "border border-amber-500/30 bg-amber-500/10 text-amber-400" },
  PAGO_PENDIENTE:                    { label: "Esperando pago",              dot: "bg-amber-400",  classes: "border border-amber-500/30 bg-amber-500/10 text-amber-400" },
  PAGO_RECIBIDO:                     { label: "Pago confirmado",             dot: "bg-blue-400",   classes: "border border-blue-500/30 bg-blue-500/10 text-blue-400" },
  VENDEDOR_NOTIFICADO:               { label: "Debes transferir la entrada", dot: "bg-orange-400", classes: "border border-orange-500/30 bg-orange-500/10 text-orange-400" },
  TRANSFERENCIA_EN_PROCESO:          { label: "Transferencia enviada",       dot: "bg-violet-400", classes: "border border-violet-500/30 bg-violet-500/10 text-violet-400" },
  PENDIENTE_CONFIRMACION_COMPRADOR:  { label: "Esperando confirmación",      dot: "bg-amber-400",  classes: "border border-amber-500/30 bg-amber-500/10 text-amber-400" },
  COMPRADOR_CONFIRMADO:              { label: "Pago por liberar",            dot: "bg-blue-400",   classes: "border border-blue-500/30 bg-blue-500/10 text-blue-400" },
  FONDOS_LIBERADOS:                  { label: "Operación completada",        dot: "bg-green-400",  classes: "border border-green-500/30 bg-green-500/10 text-green-400" },
  EN_DISPUTA:                        { label: "Disputa en proceso",          dot: "bg-red-400",    classes: "border border-red-500/30 bg-red-500/10 text-red-400" },
  CANCELADA:                         { label: "Cancelada",                   dot: "bg-white/40",   classes: "border border-white/15 bg-white/8 text-white/40" },
}

type Vista = "comprador" | "vendedor" | "admin"

const MAPA: Record<Vista, Partial<Record<string, Config>>> = {
  comprador: CONFIGS_COMPRADOR,
  vendedor:  CONFIGS_VENDEDOR,
  admin:     CONFIGS_ADMIN,
}

export function EstadoBadge({
  estado,
  vista = "admin",
}: {
  estado: EstadoCombinado
  vista?: Vista
}) {
  const configs = MAPA[vista]
  const config = configs[estado] ?? CONFIGS_ADMIN[estado] ?? {
    label: estado,
    dot: "bg-white/30",
    classes: "border border-white/15 bg-white/8 text-white/50",
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.classes}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
