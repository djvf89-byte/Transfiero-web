import Link from "next/link"
import Image from "next/image"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { obtenerPublicacion } from "@/services/publicacion.service"
import { EstadoBadge } from "@/components/publicaciones/EstadoBadge"
import { AccionesAdmin } from "@/components/publicaciones/AccionesAdmin"
import { centimosToCurrency } from "@/utils/pricing"
import { TicketeraBadge } from "@/components/publicaciones/TicketeraBadge"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminDetallePublicacionPage({ params }: Props) {
  const { id } = await params

  const session = await auth()
  if (!session) redirect("/auth/login")
  if (session.user.rolPrincipal !== "ADMINISTRADOR") redirect("/403")

  const publicacion = await obtenerPublicacion(id)
  if (!publicacion) notFound()

  const enRevision = publicacion.estado === "PENDIENTE_REVISION"
  const imagenEvidencia = publicacion.evidencias.find((e) => e.tipo === "COMPRA_ENTRADA")

  const fecha = new Date(publicacion.fechaEvento).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/publicaciones" className="text-sm font-medium text-white/50 hover:text-white transition-colors">
          ← Volver a publicaciones
        </Link>
        <EstadoBadge estado={publicacion.estado} />
      </div>

      <h1 className="mb-1 text-2xl font-extrabold text-white">{publicacion.nombreEvento}</h1>
      <p className="mb-8 text-sm text-white/45">
        Vendedor: {publicacion.vendedor.nombre} ({publicacion.vendedor.email})
      </p>

      {/* Ficha de datos */}
      <div className="mb-6 rounded-2xl border border-white/8 bg-white/[0.04] p-6">
        <dl className="grid gap-y-4 text-sm sm:grid-cols-2 sm:gap-x-8">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-white/35 mb-1">Fecha</dt>
            <dd className="font-semibold text-white">{fecha}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-white/35 mb-1">Lugar</dt>
            <dd className="font-semibold text-white">{publicacion.lugarEvento}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-white/35 mb-1">Categoría</dt>
            <dd className="font-semibold text-white">{publicacion.categoria}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-white/35 mb-1">Ticketera</dt>
            <dd className="mt-1">
              {publicacion.ticketeraEnum ? (
                <TicketeraBadge ticketera={publicacion.ticketeraEnum} showNivel variant="dark" />
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
                  ⚠ Sin ticketera — no puede publicarse
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-white/35 mb-1">Precio original</dt>
            <dd className="font-semibold text-white">{centimosToCurrency(publicacion.precioOriginalCentimos)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-white/35 mb-1">Precio de venta</dt>
            <dd className="text-lg font-extrabold text-amber-400">{centimosToCurrency(publicacion.precioVentaCentimos)}</dd>
          </div>
          {publicacion.zona && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-white/35 mb-1">Zona</dt>
              <dd className="font-semibold text-white">{publicacion.zona}</dd>
            </div>
          )}
          {publicacion.asiento && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-white/35 mb-1">Asiento</dt>
              <dd className="font-semibold text-white">{publicacion.asiento}</dd>
            </div>
          )}
        </dl>

        {publicacion.descripcion && (
          <p className="mt-5 border-t border-white/8 pt-4 text-sm text-white/60 leading-relaxed">
            {publicacion.descripcion}
          </p>
        )}
      </div>

      {/* Imagen */}
      <div className="mb-8 rounded-2xl border border-white/8 bg-white/[0.04] p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/35">
          Imagen de la entrada
        </h2>
        {imagenEvidencia ? (
          <Image
            src={imagenEvidencia.url}
            alt="Evidencia de la entrada"
            width={500}
            height={320}
            className="rounded-xl border border-white/8 object-cover w-full"
          />
        ) : (
          <p className="text-sm font-medium text-amber-400">Sin imagen adjunta.</p>
        )}
      </div>

      {enRevision && <AccionesAdmin id={publicacion.id} />}

      {publicacion.motivoRechazo && (
        <div className="mt-6 rounded-xl border border-red-500/25 bg-red-500/8 p-4 text-sm text-red-300">
          <strong className="text-red-400">Motivo de rechazo registrado:</strong> {publicacion.motivoRechazo}
        </div>
      )}
    </main>
  )
}
