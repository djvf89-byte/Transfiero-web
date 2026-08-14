import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Seguridad en Transfiero — Cómo protegemos tu dinero y tu entrada",
  description:
    "Transfiero usa un sistema de escrow para proteger compradores y vendedores. Fondos en custodia, verificación de identidad y resolución de disputas.",
  alternates: { canonical: "/seguridad" },
  openGraph: {
    title: "Seguridad en Transfiero",
    description: "Sistema de escrow, verificación de vendedores y protección total en cada operación.",
    url: "/seguridad",
  },
}

const SECCIONES = [
  {
    icono: "🔒",
    titulo: "Cómo funciona la custodia",
    contenido: [
      "Transfiero actúa como intermediario neutral entre comprador y vendedor.",
      "El dinero del comprador queda retenido en custodia (escrow) hasta que se confirme la validez de la entrada.",
      "Ninguna de las partes puede acceder a los fondos mientras la operación está en curso.",
      "Solo cuando el comprador confirma que la entrada es válida, se libera el pago al vendedor.",
    ],
  },
  {
    icono: "🛡️",
    titulo: "Protección contra estafas",
    contenido: [
      "Todo vendedor debe pasar por un proceso de verificación de identidad antes de publicar.",
      "Cada entrada publicada debe adjuntar evidencia visual (foto del ticket original).",
      "El equipo de Transfiero revisa manualmente cada publicación antes de aprobarla.",
      "Las publicaciones sin evidencia válida son rechazadas automáticamente.",
    ],
  },
  {
    icono: "✅",
    titulo: "Verificación de vendedores",
    contenido: [
      "Los vendedores son aprobados individualmente por el equipo de Transfiero.",
      "Se verifica identidad y capacidad de entregar la entrada antes de habilitar su cuenta.",
      "Los vendedores con historial de disputas pueden ser suspendidos de la plataforma.",
      "El badge 'Verificado' solo se muestra a vendedores con aprobación activa.",
    ],
  },
  {
    icono: "⚖️",
    titulo: "Gestión de disputas",
    contenido: [
      "Si el comprador reporta un problema, la operación entra en estado de disputa.",
      "Transfiero congela los fondos mientras se investiga el caso.",
      "Ambas partes pueden presentar evidencia durante el proceso de disputa.",
      "El equipo resuelve la disputa en un plazo máximo de 72 horas hábiles.",
    ],
  },
  {
    icono: "💸",
    titulo: "Liberación de fondos",
    contenido: [
      "Los fondos se liberan al vendedor solo tras confirmación explícita del comprador.",
      "El comprador tiene un plazo definido para confirmar o abrir disputa tras recibir la entrada.",
      "Si el plazo vence sin acción del comprador, Transfiero evalúa la liberación manualmente.",
      "En caso de reembolso aprobado, el dinero retorna al comprador sin costo adicional.",
    ],
  },
]

export default function SeguridadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B]" />
            Tu dinero siempre protegido
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Cómo protegemos<br />
            <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
              cada operación
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-white/45">
            Transfiero nació para eliminar el riesgo en la compraventa de entradas entre personas.
            Aquí explicamos exactamente cómo lo hacemos.
          </p>
        </div>

        {/* Secciones */}
        <div className="space-y-4">
          {SECCIONES.map((seccion) => (
            <div
              key={seccion.titulo}
              className="rounded-2xl border border-white/8 bg-white/[0.04] p-6 backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="text-2xl">{seccion.icono}</span>
                <h2 className="text-lg font-extrabold text-white">{seccion.titulo}</h2>
              </div>
              <ul className="space-y-2.5">
                {seccion.contenido.map((punto, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-white/55">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/60" />
                    {punto}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-amber-500/20 bg-amber-500/6 p-8 text-center">
          <p className="mb-2 text-lg font-extrabold text-white">¿Listo para comprar con seguridad?</p>
          <p className="mb-6 text-sm text-white/45">
            Explora las entradas disponibles y compra sin riesgo.
          </p>
          <Link
            href="/"
            className="inline-flex rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 px-6 py-3 text-sm font-bold text-gray-900 shadow-[0_4px_24px_rgba(245,158,11,0.3)] hover:opacity-90 transition-opacity"
          >
            Ver entradas disponibles →
          </Link>
        </div>
    </div>
  )
}
