import Link from "next/link"

interface Props {
  searchParams: Promise<{ external_reference?: string }>
}

export default async function PagoPendientePage({ searchParams }: Props) {
  const params = await searchParams
  const operacionId = params.external_reference

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-4xl">
          ⏳
        </div>
      </div>
      <h1 className="mb-3 text-2xl font-extrabold text-white">Pago en proceso</h1>
      <p className="mb-8 text-sm leading-relaxed text-white/50">
        Tu pago está siendo procesado por MercadoPago. Te notificaremos cuando sea confirmado. Puedes revisar el estado de tu compra en cualquier momento.
      </p>
      <Link
        href={operacionId ? `/mis-compras/${operacionId}` : "/mis-compras"}
        className="inline-flex rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-3 text-sm font-semibold text-amber-400 hover:bg-amber-500/15 transition-colors"
      >
        Revisar estado →
      </Link>
    </div>
  )
}
