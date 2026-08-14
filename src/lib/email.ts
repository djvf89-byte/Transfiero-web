import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const BASE_URL = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"
const FROM = process.env.RESEND_FROM_EMAIL
  ? `Transfiero <${process.env.RESEND_FROM_EMAIL}>`
  : "Transfiero <noreply@transfiero.pe>"

// ─── Helper genérico ─────────────────────────────────────────────────────────

export async function enviarEmail(para: string, asunto: string, html: string): Promise<void> {
  if (!resend) {
    console.log(`[DEV email] Para: ${para} | Asunto: ${asunto}`)
    return
  }
  try {
    await resend.emails.send({ from: FROM, to: para, subject: asunto, html })
  } catch (err) {
    console.error("[email] Error enviando a", para, "|", asunto, "|", err)
  }
}

// ─── Bienvenida ──────────────────────────────────────────────────────────────

export function htmlBienvenida(nombre: string): string {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
      <div style="background:#0C1B3F;padding:20px 24px;border-radius:12px 12px 0 0">
        <span style="color:#FBBF24;font-size:20px;font-weight:700">Transfiero</span>
      </div>
      <div style="background:#fff;padding:28px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <h2 style="margin:0 0 12px">¡Bienvenido, ${nombre}!</h2>
        <p style="color:#4b5563">Tu cuenta en Transfiero fue creada correctamente. Ya puedes
           comprar y vender entradas de forma segura con nuestro sistema de escrow.</p>
        <a href="${BASE_URL}/dashboard"
           style="display:inline-block;background:#F59E0B;color:#111;font-weight:700;
                  padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">
          Ir a mi cuenta
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">
          Si no creaste esta cuenta, escríbenos a soporte@transfiero.pe.
        </p>
      </div>
    </div>`
}

// ─── Recuperación de contraseña ──────────────────────────────────────────────

export async function enviarEmailRecuperacion(email: string, token: string): Promise<void> {
  const url = `${BASE_URL}/auth/nueva-contrasena?token=${token}`

  if (!resend) {
    console.log("\n[DEV — recuperar contraseña] Abre esta URL en el navegador:")
    console.log(url + "\n")
    return
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Recupera tu contraseña — Transfiero",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
          <div style="background:#0C1B3F;padding:20px 24px;border-radius:12px 12px 0 0">
            <span style="color:#FBBF24;font-size:20px;font-weight:700">Transfiero</span>
          </div>
          <div style="background:#fff;padding:28px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
            <h2 style="margin:0 0 12px;font-size:18px">Recupera tu contraseña</h2>
            <p style="color:#4b5563;margin:0 0 20px">
              Haz clic en el botón para establecer una nueva contraseña.
              El enlace vence en <strong>1 hora</strong>.
            </p>
            <a href="${url}"
              style="display:inline-block;background:#F59E0B;color:#111;font-weight:700;
                     padding:12px 24px;border-radius:8px;text-decoration:none">
              Restablecer contraseña
            </a>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px">
              Si no solicitaste esto, ignora este correo. Tu contraseña no cambiará.
            </p>
          </div>
        </div>`,
    })
  } catch (err) {
    console.error("[email] Error enviando recuperación a", email, "|", err)
  }
}

// ─── Vendedor notificado: debe transferir ────────────────────────────────────

export function htmlVendedorNotificado(
  nombreVendedor: string,
  nombreEvento: string,
  urlOperacion: string
): string {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
      <div style="background:#0C1B3F;padding:20px 24px;border-radius:12px 12px 0 0">
        <span style="color:#FBBF24;font-size:20px;font-weight:700">Transfiero</span>
      </div>
      <div style="background:#fff;padding:28px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <h2 style="margin:0 0 12px;color:#1B3A6B">Acción requerida: transfiere la entrada</h2>
        <p style="color:#4b5563">Hola ${nombreVendedor}, el pago por <strong>${nombreEvento}</strong>
           fue confirmado por Transfiero. Tienes <strong>48 horas</strong> para realizar
           la transferencia oficial de la entrada al comprador y subir la evidencia.</p>
        <div style="background:#FEF3C7;border:1px solid #F59E0B;border-radius:8px;padding:12px 16px;margin:16px 0">
          <p style="margin:0;color:#92400E;font-size:13px;font-weight:600">
            ⚠ Si no transfieres dentro del plazo, la operación podrá ser cancelada.
          </p>
        </div>
        <a href="${BASE_URL}${urlOperacion}"
           style="display:inline-block;background:#1B3A6B;color:#fff;font-weight:700;
                  padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:8px">
          Ver mi venta
        </a>
      </div>
    </div>`
}

// ─── Plazo de confirmación (comprador) ───────────────────────────────────────

export function htmlPlazoConfirmacion(
  nombreComprador: string,
  nombreEvento: string,
  fechaLimite: Date,
  urlOperacion: string
): string {
  const limite = new Intl.DateTimeFormat("es-PE", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  }).format(fechaLimite)

  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
      <div style="background:#0C1B3F;padding:20px 24px;border-radius:12px 12px 0 0">
        <span style="color:#FBBF24;font-size:20px;font-weight:700">Transfiero</span>
      </div>
      <div style="background:#fff;padding:28px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <h2 style="margin:0 0 12px">¡Tu entrada fue transferida!</h2>
        <p style="color:#4b5563">Hola ${nombreComprador}, la entrada de <strong>${nombreEvento}</strong>
           fue validada por Transfiero. Tienes <strong>24 horas</strong> para confirmar
           que la recibiste o abrir una disputa.</p>
        <p style="color:#B45309;font-weight:bold;margin:16px 0">Plazo límite: ${limite}</p>
        <p style="color:#4b5563;font-size:13px">Si no actúas antes del plazo, los fondos serán
           liberados automáticamente al vendedor.</p>
        <a href="${BASE_URL}${urlOperacion}"
           style="display:inline-block;background:#F59E0B;color:#111;font-weight:700;
                  padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:8px">
          Ver mi compra
        </a>
      </div>
    </div>`
}

// ─── Aviso pocas horas (comprador) ───────────────────────────────────────────

export function htmlAviso24h(
  nombreComprador: string,
  nombreEvento: string,
  fechaLimite: Date,
  urlOperacion: string
): string {
  const limite = new Intl.DateTimeFormat("es-PE", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  }).format(fechaLimite)

  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
      <div style="background:#0C1B3F;padding:20px 24px;border-radius:12px 12px 0 0">
        <span style="color:#FBBF24;font-size:20px;font-weight:700">Transfiero</span>
      </div>
      <div style="background:#fff;padding:28px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <h2 style="margin:0 0 12px;color:#B45309">⏰ Quedan pocas horas para confirmar tu entrada</h2>
        <p style="color:#4b5563">Hola ${nombreComprador}, tu plazo para confirmar la entrada de
           <strong>${nombreEvento}</strong> vence en menos de 4 horas.</p>
        <p style="color:#B45309;font-weight:bold;margin:16px 0">Plazo límite: ${limite}</p>
        <a href="${BASE_URL}${urlOperacion}"
           style="display:inline-block;background:#B45309;color:#fff;font-weight:700;
                  padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:8px">
          Confirmar ahora
        </a>
      </div>
    </div>`
}

// ─── Liberación automática ────────────────────────────────────────────────────

export function htmlLiberacionAutomatica(
  nombreUsuario: string,
  nombreEvento: string,
  esVendedor: boolean,
  montoVendedorCentimos?: number
): string {
  if (esVendedor) {
    const monto = montoVendedorCentimos
      ? `S/ ${(montoVendedorCentimos / 100).toFixed(2)}`
      : "los fondos"
    return `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
        <div style="background:#0C1B3F;padding:20px 24px;border-radius:12px 12px 0 0">
          <span style="color:#FBBF24;font-size:20px;font-weight:700">Transfiero</span>
        </div>
        <div style="background:#fff;padding:28px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="margin:0 0 12px;color:#15803D">✓ Fondos liberados</h2>
          <p style="color:#4b5563">Hola ${nombreUsuario}, el comprador no confirmó ni abrió disputa
             en el plazo acordado. Los fondos de <strong>${nombreEvento}</strong> (${monto})
             fueron liberados a tu favor.</p>
        </div>
      </div>`
  }

  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
      <div style="background:#0C1B3F;padding:20px 24px;border-radius:12px 12px 0 0">
        <span style="color:#FBBF24;font-size:20px;font-weight:700">Transfiero</span>
      </div>
      <div style="background:#fff;padding:28px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <h2 style="margin:0 0 12px;color:#6B7280">Plazo de confirmación vencido</h2>
        <p style="color:#4b5563">Hola ${nombreUsuario}, el plazo de 24 horas para confirmar tu entrada
           de <strong>${nombreEvento}</strong> venció sin que realizaras ninguna acción.
           Los fondos fueron liberados al vendedor.</p>
        <p style="color:#9ca3af;font-size:13px">Si crees que esto fue un error, contáctanos en
           soporte@transfiero.pe.</p>
      </div>
    </div>`
}
