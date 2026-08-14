import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { obtenerPublicacion } from "@/services/publicacion.service"
import { EstadoBadge } from "@/components/publicaciones/EstadoBadge"
import { PublicacionForm } from "@/components/publicaciones/PublicacionForm"
import { AccionesPublicacion } from "@/components/publicaciones/AccionesPublicacion"
import { centimosToCurrency } from "@/utils/pricing"

interface Props {
  params: Promise<{ id: string }>
}

export default async function DetallePublicacionPage({ params }: Props) {
  const { id } = await params

  const session = await auth()
  if (!session) redirect("/auth/login")
  if (
    session.user.rolPrincipal !== "VENDEDOR" ||
    session.user.estadoVendedor !== "APROBADO"
  ) {
    redirect("/403")
  }

  const publicacion = await obtenerPublicacion(id)
  if (!publicacion || publicacion.vendedorId !== session.user.id) notFound()

  const puedeEditar = publicacion.estado === "BORRADOR"
  const puedeEnviar = publicacion.estado === "BORRADOR"
  const puedeCancelar = publicacion.estado === "BORRADOR" || publicacion.estado === "APROBADA"
  const imagenEvidencia = publicacion.evidencias.find((e) => e.tipo === "COMPRA_ENTRADA")
  const tieneImagen = !!imagenEvidencia

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
        <Link
          href="/mis-publicaciones"
          className="text-sm font-medium text-white/50 hover:text-white transition-colors"
        >
          ← Volver a mis publicaciones
        </Link>
        <EstadoBadge estado={publicacion.estado} />
      </div>

      {/* Motivo de rechazo */}
      {publicacion.motivoRechazo && (
        <div className="mb-6 rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-4">
          <p className="text-sm text-red-300">
            <span className="font-bold text-red-400">Motivo de rechazo:</span>{" "}
            {publicacion.motivoRechazo}
          </p>
        </div>
      )}

      {puedeEditar ? (
        <>
          <h1 className="mb-6 text-xl font-bold text-white">Editar publicación</h1>
          <PublicacionForm
            publicacion={{ ...publicacion, evidencias: publicacion.evidencias }}
            modo="editar"
          />
        </>
      ) : (
        <div className="space-y-4">
          <h1 className="text-2xl font-extrabold text-white">{publicacion.nombreEvento}</h1>

          <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-6">
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
              {publicacion.ticketera && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-white/35 mb-1">Ticketera</dt>
                  <dd className="font-semibold text-white">{publicacion.ticketera}</dd>
                </div>
              )}
            </dl>

            {publicacion.descripcion && (
              <p className="mt-5 border-t border-white/8 pt-4 text-sm leading-relaxed text-white/60">
                {publicacion.descripcion}
              </p>
            )}
          </div>
        </div>
      )}

      <AccionesPublicacion
        id={publicacion.id}
        puedeEnviar={puedeEnviar}
        puedeCancelar={puedeCancelar}
        tieneImagen={tieneImagen}
      />
    </main>
  )
}
