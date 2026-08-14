import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { obtenerPublicacionPublica, contarVentasCompletadas, contarDisputasVendedor } from "@/services/publicacion.service"
import { ResumenFinancieroPublico } from "@/components/operaciones/ResumenFinanciero"
import { ReputacionVendedor } from "@/components/operaciones/ReputacionVendedor"
import { EstadoBadge } from "@/components/operaciones/EstadoBadge"
import { BotoneraReserva } from "@/components/marketplace/BotoneraReserva"
import { SpotifyPlayer } from "@/components/publicaciones/SpotifyPlayer"
import { RiesgoTicketera } from "@/components/publicaciones/RiesgoTicketera"
import { TicketeraBadge } from "@/components/publicaciones/TicketeraBadge"

const BASE_URL = process.env.AUTH_URL ?? "https://transfiero.pe"

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const pub = await obtenerPublicacionPublica(id)

  if (!pub) return { title: "Entrada no encontrada | Transfiero" }

  const precio = `S/ ${(pub.precioVentaCentimos / 100).toFixed(2)}`
  const ciudad = pub.lugarEvento.split(",")[0]?.trim() ?? pub.lugarEvento
  const imagen = pub.imagenPortadaUrl ?? pub.evidencias[0]?.url ?? `${BASE_URL}/logo-dark.png`
  const url = `${BASE_URL}/entradas/${pub.id}`

  return {
    title: `Entradas para ${pub.nombreEvento} en ${ciudad} | Transfiero`,
    description: `Compra de forma segura una entrada para ${pub.nombreEvento}. ${precio} — Transferencia protegida por escrow. Sin estafas.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${pub.nombreEvento} — ${precio}`,
      description: `Entrada disponible para ${pub.nombreEvento} en ${pub.lugarEvento}. Compra segura con custodia Transfiero.`,
      url,
      type: "website",
      images: [{ url: imagen, width: 1200, height: 630, alt: pub.nombreEvento }],
      locale: "es_PE",
      siteName: "Transfiero",
    },
    twitter: {
      card: "summary_large_image",
      title: `${pub.nombreEvento} — ${precio}`,
      description: `Entrada para ${pub.nombreEvento} en ${pub.lugarEvento}. Compra protegida por escrow.`,
      images: [imagen],
    },
  }
}

const GRADIENTE_CATEGORIA: Record<string, string> = {
  CONCIERTO: "from-blue-950 via-indigo-900 to-blue-900",
  DEPORTE: "from-green-950 via-emerald-900 to-teal-900",
  FESTIVAL: "from-purple-950 via-violet-900 to-pink-900",
  TEATRO: "from-amber-950 via-orange-900 to-red-900",
  OTRO: "from-slate-900 via-slate-800 to-slate-700",
}

function formatFecha(fecha: Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(fecha))
}

function diasHastaEvento(fecha: Date): number {
  return Math.ceil((new Date(fecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DetalleEntradaPage({ params }: PageProps) {
  const { id } = await params
  const [publicacion, session] = await Promise.all([
    obtenerPublicacionPublica(id),
    auth(),
  ])

  if (!publicacion) notFound()

  const [ventasVendedor, disputasVendedor] = await Promise.all([
    contarVentasCompletadas(publicacion.vendedor.id),
    contarDisputasVendedor(publicacion.vendedor.id),
  ])

  const gradiente = GRADIENTE_CATEGORIA[publicacion.categoria] ?? GRADIENTE_CATEGORIA.OTRO
  const imagenUrl = publicacion.imagenPortadaUrl ?? publicacion.evidencias[0]?.url
  const disponible = publicacion.estado === "DISPONIBLE"
  const autenticado = !!session
  const esPropioVendedor = session?.user.id === publicacion.vendedor.id
  const dias = diasHastaEvento(publicacion.fechaEvento)


  const precioNum = (publicacion.precioVentaCentimos / 100).toFixed(2)
  const urlCanonica = `${BASE_URL}/entradas/${publicacion.id}`
  const imagenOg = publicacion.imagenPortadaUrl ?? publicacion.evidencias[0]?.url

  const jsonLdEvent = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: publicacion.nombreEvento,
    startDate: new Date(publicacion.fechaEvento).toISOString(),
    location: {
      "@type": "Place",
      name: publicacion.lugarEvento,
      address: {
        "@type": "PostalAddress",
        addressCountry: "PE",
        addressLocality: publicacion.lugarEvento.split(",")[0]?.trim(),
      },
    },
    ...(imagenOg ? { image: imagenOg } : {}),
    ...(publicacion.artista ? { performer: { "@type": "PerformingGroup", name: publicacion.artista } } : {}),
    ...(publicacion.descripcion ? { description: publicacion.descripcion } : {}),
    url: urlCanonica,
    offers: {
      "@type": "Offer",
      url: urlCanonica,
      price: precioNum,
      priceCurrency: "PEN",
      availability: disponible
        ? "https://schema.org/InStock"
        : "https://schema.org/SoldOut",
    },
    organizer: {
      "@type": "Organization",
      name: "Transfiero",
      url: BASE_URL,
    },
  }

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio",   item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Entradas", item: `${BASE_URL}/entradas` },
      { "@type": "ListItem", position: 3, name: publicacion.nombreEvento, item: urlCanonica },
    ],
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdEvent) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      {/* Breadcrumb visible */}
      <nav aria-label="Ruta de navegación" className="mb-5">
        <ol className="flex items-center gap-1.5 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-gray-600 transition-colors">Inicio</Link></li>
          <li aria-hidden="true" className="text-gray-300">›</li>
          <li><Link href="/entradas" className="hover:text-gray-600 transition-colors">Entradas</Link></li>
          <li aria-hidden="true" className="text-gray-300">›</li>
          <li className="truncate max-w-[200px] text-gray-600" aria-current="page">{publicacion.nombreEvento}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Columna izquierda */}
        <div className="space-y-4">
          {/* Hero del evento */}
          <div className={`relative h-64 overflow-hidden rounded-2xl bg-gradient-to-br ${gradiente}`}>
            {imagenUrl && (
              <Image
                src={imagenUrl}
                alt={publicacion.nombreEvento}
                fill
                className="object-cover opacity-50"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <EstadoBadge estado={publicacion.estado} />
                {publicacion.ticketeraEnum && (
                  <TicketeraBadge ticketera={publicacion.ticketeraEnum} showNivel variant="dark" />
                )}
                {dias <= 7 && dias >= 0 && disponible && (
                  <span className="inline-flex items-center rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white">
                    ⚡ {dias === 0 ? "¡Hoy!" : dias === 1 ? "¡Mañana!" : `En ${dias} días`}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                {publicacion.nombreEvento}
              </h1>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs text-white backdrop-blur-sm">
                  📅 {formatFecha(publicacion.fechaEvento)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs text-white backdrop-blur-sm">
                  📍 {publicacion.lugarEvento}
                </span>
              </div>
            </div>
          </div>

          {/* Detalles */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
              Detalles de la entrada
            </h2>
            <dl className="divide-y divide-gray-100">
              {(
                [
                  { label: "Categoría", value: publicacion.categoria },
                  publicacion.zona ? { label: "Zona / Sector", value: publicacion.zona } : null,
                  publicacion.asiento ? { label: "Asiento", value: publicacion.asiento } : null,
                  { label: "Precio original", value: `S/ ${(publicacion.precioOriginalCentimos / 100).toFixed(2)}` },
                  publicacion.descripcion ? { label: "Descripción", value: publicacion.descripcion } : null,
                ] as Array<{ label: string; value: string } | null>
              )
                .filter((item): item is { label: string; value: string } => item !== null)
                .map((item) => (
                  <div key={item.label} className="flex justify-between py-2.5 text-sm">
                    <dt className="text-gray-500">{item.label}</dt>
                    <dd className="font-semibold text-gray-900 text-right max-w-[60%]">
                      {item.value}
                    </dd>
                  </div>
                ))}
            </dl>
          </div>

          {/* Guía de transferencia por ticketera */}
          {publicacion.ticketeraEnum && (
            <RiesgoTicketera ticketera={publicacion.ticketeraEnum} />
          )}

          {/* Spotify — solo conciertos con URL configurada */}
          {publicacion.categoria === "CONCIERTO" && publicacion.spotifyEmbedUrl && (
            <SpotifyPlayer
              publicacionId={publicacion.id}
              spotifyEmbedUrl={publicacion.spotifyEmbedUrl}
              artista={publicacion.artista}
            />
          )}

          {/* Cómo funciona */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
              ¿Cómo funciona Transfiero?
            </h2>
            <div className="space-y-3">
              {[
                { paso: "1", titulo: "Reservas y el vendedor acepta", desc: "Tiene 15 min para responder tu solicitud" },
                { paso: "2", titulo: "Pagas a Transfiero (en custodia)", desc: "Yape, Plin, transferencia o tarjeta" },
                { paso: "3", titulo: "Confirmas que recibiste tu entrada", desc: "Recién entonces el vendedor cobra" },
              ].map((item) => (
                <div key={item.paso} className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                    {item.paso}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.titulo}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha — Buy card */}
        <div className="lg:sticky lg:top-6 space-y-4 h-fit">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-lg overflow-hidden">
            <div className="p-6 pb-4">
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                Resumen de compra
              </p>
              <ResumenFinancieroPublico precioVentaCentimos={publicacion.precioVentaCentimos} />
              <div className="mt-5 space-y-3">
                <BotoneraReserva
                  publicacionId={publicacion.id}
                  disponible={disponible}
                  autenticado={autenticado}
                  esPropioVendedor={esPropioVendedor}
                />
              </div>
            </div>

            {/* Medios de pago */}
            <div className="border-t border-gray-100 px-6 py-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Acepta
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Yape", color: "bg-purple-50 border-purple-200 text-purple-700" },
                  { label: "Plin", color: "bg-green-50 border-green-200 text-green-700" },
                  { label: "Visa", color: "bg-blue-50 border-blue-200 text-blue-700" },
                  { label: "Mastercard", color: "bg-amber-50 border-amber-200 text-amber-700" },
                ].map((m) => (
                  <span
                    key={m.label}
                    className={`inline-flex items-center rounded border px-2.5 py-1 text-[11px] font-semibold ${m.color}`}
                  >
                    {m.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Escrow — 4 pasos */}
            <div className="border-t border-gray-100 px-6 py-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                ¿Cómo funciona?
              </p>
              <div className="flex items-start gap-1">
                {[
                  { num: "1", texto: "Reservas la entrada" },
                  { num: "2", texto: "Pagas a Transfiero" },
                  { num: "3", texto: "Recibes la entrada" },
                  { num: "4", texto: "El vendedor cobra" },
                ].map((paso, i, arr) => (
                  <div key={paso.num} className="flex items-start gap-1 flex-1 min-w-0">
                    <div className="flex flex-col items-center min-w-0 flex-1">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-700">
                        {paso.num}
                      </div>
                      <p className="mt-1.5 text-center text-[10px] leading-tight text-gray-500">
                        {paso.texto}
                      </p>
                    </div>
                    {i < arr.length - 1 && (
                      <span className="mt-1 shrink-0 text-gray-300 text-xs">›</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Trust mini */}
            <div className="border-t border-gray-100 px-6 py-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: "🔒", label: "Pago seguro" },
                  { icon: "↩️", label: "Reembolso" },
                  { icon: "⚡", label: "15 min" },
                ].map((t) => (
                  <div key={t.label} className="rounded-lg bg-gray-50 py-2 text-center">
                    <div className="text-base">{t.icon}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5 font-medium">{t.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reputación del vendedor */}
            <div className="border-t border-gray-100 px-6 py-4">
              <ReputacionVendedor
                nombre={publicacion.vendedor.nombre}
                ventasCompletadas={ventasVendedor}
                disputasAbiertas={disputasVendedor}
              />
            </div>
          </div>

          {/* Escasez */}
          {disponible && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold text-amber-700">
                👀 Varias personas están viendo esta entrada ahora
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
