import { headers } from "next/headers"

interface Entry {
  count: number
  resetAt: number
}

// In-memory store — suficiente para V1 beta. Reemplazar con Upstash Redis para producción distribuida.
const store = new Map<string, Entry>()

function cleanup() {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key)
  }
}

export async function getClientIp(): Promise<string> {
  try {
    const hdrs = await headers()
    return (
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      hdrs.get("x-real-ip") ??
      "unknown"
    )
  } catch {
    return "unknown"
  }
}

export function checkRateLimit(
  key: string,
  options: { max: number; windowMs: number }
): { allowed: boolean; retryAfterSecs: number } {
  cleanup()
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + options.windowMs })
    return { allowed: true, retryAfterSecs: 0 }
  }

  entry.count++

  if (entry.count > options.max) {
    const retryAfterSecs = Math.ceil((entry.resetAt - now) / 1000)
    return { allowed: false, retryAfterSecs }
  }

  return { allowed: true, retryAfterSecs: 0 }
}

function minutosRestantes(secs: number): string {
  const mins = Math.ceil(secs / 60)
  return mins === 1 ? "1 minuto" : `${mins} minutos`
}

// ─── Helpers por endpoint ────────────────────────────────────────────────────

export async function limitarLogin(ip: string): Promise<string | null> {
  const { allowed, retryAfterSecs } = checkRateLimit(`login:${ip}`, {
    max: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
  })
  if (!allowed) {
    return `Demasiados intentos fallidos. Espera ${minutosRestantes(retryAfterSecs)} e inténtalo de nuevo.`
  }
  return null
}

export async function limitarRegistro(ip: string): Promise<string | null> {
  const { allowed, retryAfterSecs } = checkRateLimit(`registro:${ip}`, {
    max: 3,
    windowMs: 60 * 60 * 1000, // 1 hora
  })
  if (!allowed) {
    return `Demasiados registros desde tu red. Espera ${minutosRestantes(retryAfterSecs)} e inténtalo de nuevo.`
  }
  return null
}

export async function limitarRecuperacion(ip: string, email: string): Promise<string | null> {
  const porIp = checkRateLimit(`recuperar:ip:${ip}`, {
    max: 5,
    windowMs: 60 * 60 * 1000,
  })
  if (!porIp.allowed) {
    return `Demasiadas solicitudes. Espera ${minutosRestantes(porIp.retryAfterSecs)} e inténtalo de nuevo.`
  }

  const porEmail = checkRateLimit(`recuperar:email:${email}`, {
    max: 3,
    windowMs: 60 * 60 * 1000,
  })
  if (!porEmail.allowed) {
    return `Ya enviamos un enlace a este correo recientemente. Espera ${minutosRestantes(porEmail.retryAfterSecs)} antes de volver a intentarlo.`
  }

  return null
}
