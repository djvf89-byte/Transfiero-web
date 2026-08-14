import Link from "next/link"

interface Props {
  searchParams: Promise<{ external_reference?: string }>
}

export default async function PagoErrorPage({ searchParams }: Props) {
  const params = await searchParams
  const operacionId = params.external_reference

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-4xl">
          ❌
        </div>
      </div>
      <h1 className="mb-3 text-2xl font-extrabold text-white">Pago no completado</h1>
      <p className="mb-8 text-sm leading-relaxed text-white/50">
        El pago no pudo procesarse. Tu reserva sigue activa — puedes intentarlo nuevamente o usar otro método de pago.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row justify-center">
        <Link
          href={operacionId ? `/mis-compras/${operacionId}` : "/mis-compras"}
          className="inline-flex rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 px-6 py-3 text-sm font-bold text-gray-900 hover:opacity-90 transition-opacity"
        >
          Intentar de nuevo →
        </Link>
        <Link
          href="/mis-compras"
          className="inline-flex rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/60 hover:bg-white/8 hover:text-white transition-colors"
        >
          Mis compras
        </Link>
      </div>
    </div>
  )
}
