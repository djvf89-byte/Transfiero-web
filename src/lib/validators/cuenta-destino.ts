const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UNSAFE_RE = /<[^>]+>|javascript:|on\w+\s*=/i

export function validarCuentaDestino(valor: string): string | null {
  const v = valor.trim()
  if (v.length < 5) return "Mínimo 5 caracteres"
  if (v.length > 120) return "Máximo 120 caracteres"
  if (UNSAFE_RE.test(v)) return "Dato inválido"
  if (v.includes("@") && !EMAIL_RE.test(v)) return "El correo no tiene un formato válido"
  return null
}

export const LABEL_TICKETERA: Record<string, string> = {
  JOINNUS:      "Correo o usuario de tu cuenta Joinnus",
  TELETICKET:   "Correo de tu cuenta Teleticket",
  TICKETMASTER: "Correo de tu cuenta Ticketmaster",
}

export const PLACEHOLDER_TICKETERA: Record<string, string> = {
  JOINNUS:      "usuario@correo.com o tu usuario de Joinnus",
  TELETICKET:   "correo@ejemplo.com registrado en Teleticket",
  TICKETMASTER: "correo@ejemplo.com registrado en Ticketmaster",
}

export function labelCuentaDestino(ticketera?: string | null): string {
  return ticketera ? (LABEL_TICKETERA[ticketera] ?? "Cuenta de destino en la ticketera") : "Cuenta de destino en la ticketera"
}

export function placeholderCuentaDestino(ticketera?: string | null): string {
  return ticketera ? (PLACEHOLDER_TICKETERA[ticketera] ?? "usuario o correo") : "usuario o correo"
}
