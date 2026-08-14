import type { Ticketera } from "@prisma/client"

interface Instruccion {
  titulo: string
  pasos: string[]
  nivel: string
  nivelClase: string
  advertencia: string
}

const INSTRUCCIONES: Record<Ticketera, Instruccion> = {
  JOINNUS: {
    titulo: "Transferencia en Joinnus",
    pasos: [
      "Ingresa a tu cuenta de Joinnus.",
      'Ve a "Mis entradas".',
      "Selecciona la entrada correspondiente.",
      "Revisa si el evento permite cambio de participante o cambio de titular.",
      "Realiza el cambio con los datos del comprador cuando Transfiero te lo indique.",
      "Sube evidencia del cambio realizado dentro de Transfiero.",
    ],
    nivel: "Media / Alta",
    nivelClase: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    advertencia:
      "Algunos eventos pueden no permitir cambio de participante. Confirma que la entrada es transferible antes de enviarla a revisión.",
  },
  TELETICKET: {
    titulo: "Transferencia en Teleticket",
    pasos: [
      "Ingresa a tu cuenta de Teleticket.",
      "Revisa si tu e-ticket permite nominación, cambio de titularidad o transferencia.",
      "Si el evento es nominado, sigue el proceso oficial indicado por Teleticket.",
      "Si solo cuentas con PDF o QR, Transfiero lo marcará como mayor riesgo.",
      "Sube evidencia clara del proceso realizado o del ticket entregado.",
    ],
    nivel: "Media",
    nivelClase: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    advertencia:
      "Algunos eventos dependen del PDF o QR original. Esto puede implicar mayor riesgo si no existe cambio oficial de titularidad.",
  },
  TICKETMASTER: {
    titulo: "Transferencia en Ticketmaster",
    pasos: [
      "Ingresa a tu cuenta de Ticketmaster.",
      "Ve a tus entradas.",
      "Selecciona la opción de transferencia o cambio de titularidad si está disponible.",
      "Ingresa los datos del comprador cuando Transfiero te lo indique.",
      "Espera confirmación de aceptación por parte del comprador.",
      "Sube evidencia de la transferencia completada.",
    ],
    nivel: "Alta",
    nivelClase: "border-green-500/30 bg-green-500/10 text-green-300",
    advertencia:
      "No todos los eventos permiten transferencia. Confirma que la opción está disponible para esa entrada antes de publicarla.",
  },
}

interface Props {
  ticketera: Ticketera
}

export function InstruccionesTicketera({ ticketera }: Props) {
  const { titulo, pasos, nivel, nivelClase, advertencia } = INSTRUCCIONES[ticketera]

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.04] p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm font-semibold text-white/80">📋 {titulo}</p>
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${nivelClase}`}>
          Seguridad {nivel}
        </span>
      </div>

      <ol className="space-y-2">
        {pasos.map((paso, i) => (
          <li key={i} className="flex gap-2.5 text-xs text-white/55">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white/60 mt-0.5">
              {i + 1}
            </span>
            {paso}
          </li>
        ))}
      </ol>

      <div className="rounded-lg border border-amber-500/20 bg-amber-500/8 px-3 py-2">
        <p className="text-xs text-amber-300/80">
          <span className="font-semibold text-amber-300">⚠ Aviso:</span> {advertencia}
        </p>
      </div>
    </div>
  )
}
