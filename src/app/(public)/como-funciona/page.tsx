import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Cómo funciona Transfiero — Compra y vende entradas sin riesgos",
  description:
    "Conoce el proceso de compraventa segura de entradas en Transfiero. Escrow, verificación, confirmación y protección total. Sin estafas.",
  alternates: { canonical: "/como-funciona" },
  openGraph: {
    title: "Cómo funciona Transfiero",
    description: "Proceso de compraventa segura de entradas con custodia de fondos. Paso a paso.",
    url: "/como-funciona",
  },
}

const PASOS = [
  {
    numero: "01",
    titulo: "Encuentra tu entrada",
    descripcion: "Explora el marketplace y elige la entrada que buscas. Todas han pasado por revisión manual del equipo Transfiero.",
    icono: "🔍",
  },
  {
    numero: "02",
    titulo: "Reserva y paga a Transfiero",
    descripcion: "Tu dinero queda en custodia (escrow). El vendedor no lo recibe aún. Puedes pagar por Yape, Plin o transferencia bancaria.",
    icono: "🔒",
  },
  {
    numero: "03",
    titulo: "El vendedor transfiere la entrada",
    descripcion: "Recibes la entrada directamente del vendedor. Tienes un plazo para verificar que sea válida y auténtica.",
    icono: "🎟",
  },
  {
    numero: "04",
    titulo: "Confirmas y liberamos el pago",
    descripcion: "Si todo está correcto, confirmas la recepción y liberamos el dinero al vendedor. Si hay un problema, abrimos una disputa.",
    icono: "✅",
  },
]

export default function ComoFuncionaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-400">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B]" />
          Simple, seguro y transparente
        </div>
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Cómo funciona<br />
          <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
            Transfiero
          </span>
        </h1>
        <p className="mx-auto max-w-xl text-base leading-relaxed text-white/45">
          Un proceso de 4 pasos diseñado para proteger tanto al comprador como al vendedor en cada operación.
        </p>
      </div>

      {/* Pasos */}
      <div className="space-y-4">
        {PASOS.map((paso) => (
          <div key={paso.numero} className="flex gap-5 rounded-2xl border border-white/8 bg-white/[0.04] p-6 backdrop-blur-xl">
            <div className="shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-2xl border border-amber-500/20">
                {paso.icono}
              </div>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-amber-500/70">Paso {paso.numero}</p>
              <h2 className="mb-2 text-lg font-extrabold text-white">{paso.titulo}</h2>
              <p className="text-sm leading-relaxed text-white/50">{paso.descripcion}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Garantías */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { icono: "🛡️", label: "Fondos protegidos" },
          { icono: "👁️", label: "Revisión manual" },
          { icono: "⚖️", label: "Resolución de disputas" },
        ].map((g) => (
          <div key={g.label} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <span className="text-xl">{g.icono}</span>
            <span className="text-sm font-semibold text-white/60">{g.label}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10 rounded-2xl border border-amber-500/20 bg-amber-500/6 p-8 text-center">
        <p className="mb-2 text-lg font-extrabold text-white">¿Listo para empezar?</p>
        <p className="mb-6 text-sm text-white/45">Explora las entradas disponibles ahora mismo.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 px-6 py-3 text-sm font-bold text-gray-900 shadow-[0_4px_24px_rgba(245,158,11,0.3)] hover:opacity-90 transition-opacity"
          >
            Ver entradas →
          </Link>
          <Link
            href="/seguridad"
            className="inline-flex rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/70 hover:bg-white/8 hover:text-white transition-colors"
          >
            Nuestra seguridad
          </Link>
        </div>
      </div>
    </div>
  )
}
