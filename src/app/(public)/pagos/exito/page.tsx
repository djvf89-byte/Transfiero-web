import Link from "next/link"

interface Props {
  searchParams: Promise<{ external_reference?: string; payment_id?: string }>
}

export default async function PagoExitoPage({ searchParams }: Props) {
  const params = await searchParams
  const operacionId = params.external_reference

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10 text-4xl">
          ✅
        </div>
      </div>
      <h1 className="mb-3 text-2xl font-extrabold text-white">¡Pago recibido!</h1>
      <p className="mb-8 text-sm leading-relaxed text-white/50">
        Tu pago fue procesado exitosamente. El vendedor recibirá la notificación para iniciar la transferencia de la entrada.
      </p>
      {operacionId ? (
        <Link
          href={`/mis-compras/${operacionId}`}
          className="inline-flex rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 px-6 py-3 text-sm font-bold text-gray-900 shadow-[0_4px_24px_rgba(245,158,11,0.3)] hover:opacity-90 transition-opacity"
        >
          Ver estado de mi compra →
        </Link>
      ) : (
        <Link
          href="/mis-compras"
          className="inline-flex rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 px-6 py-3 text-sm font-bold text-gray-900 hover:opacity-90 transition-opacity"
        >
          Ir a mis compras →
        </Link>
      )}
    </div>
  )
}
