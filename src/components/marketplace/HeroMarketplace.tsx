import Image from "next/image"
import Link from "next/link"
import { auth } from "@/lib/auth"
import type { CategoriaEvento } from "@prisma/client"
import { SpotifyPlayer } from "@/components/publicaciones/SpotifyPlayer"

const ICONO_CATEGORIA: Record<CategoriaEvento, string> = {
  CONCIERTO: "🎵",
  DEPORTE: "⚽",
  FESTIVAL: "🎪",
  TEATRO: "🎭",
  OTRO: "🎟",
}

const LABEL_CATEGORIA: Record<CategoriaEvento, string> = {
  CONCIERTO: "Concierto",
  DEPORTE: "Deporte",
  FESTIVAL: "Festival",
  TEATRO: "Teatro",
  OTRO: "Evento",
}

const GRADIENTE_CATEGORIA: Record<CategoriaEvento, string> = {
  CONCIERTO: "from-indigo-950 via-blue-900 to-violet-900",
  DEPORTE: "from-emerald-950 via-green-900 to-teal-900",
  FESTIVAL: "from-purple-950 via-violet-900 to-fuchsia-900",
  TEATRO: "from-amber-950 via-orange-900 to-red-900",
  OTRO: "from-slate-900 via-slate-800 to-slate-700",
}

export interface FeaturedTicket {
  id: string
  nombreEvento: string
  fechaEvento: Date
  lugarEvento: string
  categoria: CategoriaEvento
  precioVentaCentimos: number
  imagenPortadaUrl?: string | null
  vendedor: { nombre: string }
}

const SPOTIFY_AMBIENTAL = "https://open.spotify.com/embed/artist/4q3ewBCX7sLwd24euuV69X"

function formatFecha(date: Date) {
  return new Intl.DateTimeFormat("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(date))
}

export async function HeroMarketplace({ featured }: { featured?: FeaturedTicket | null }) {
  const session = await auth()
  const esVendedor =
    session?.user.rolPrincipal === "VENDEDOR" &&
    session?.user.estadoVendedor === "APROBADO"

  const precio = featured ? (featured.precioVentaCentimos / 100).toFixed(2) : null

  return (
    <div className="relative overflow-hidden">
      {/* Radial glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[8%] top-1/2 h-[480px] w-[480px] -translate-y-1/2 rounded-full bg-amber-500/6 blur-[100px]" />
        <div className="absolute left-0 bottom-0 h-72 w-72 rounded-full bg-indigo-600/5 blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
        {/* ── Izquierda ─────────────────────────────────────────── */}
        <div>
          {/* Badge de prueba social */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B]" />
            327 entradas transferidas con seguridad
          </div>

          {/* Título */}
          <h1 className="mb-4 text-6xl font-extrabold leading-[1.05] tracking-[-2px] text-white lg:text-7xl">
            Compra entradas<br />
            con{" "}
            <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
              garantía real
            </span>
          </h1>

          <p className="mb-8 max-w-md text-lg leading-relaxed text-white/45">
            Tu dinero queda retenido hasta que compruebes que la entrada es válida.
            Sin riesgos, sin sorpresas.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <a
              href="#entradas"
              className="rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-bold text-gray-900 shadow-[0_4px_24px_rgba(245,158,11,0.35)] hover:opacity-90 transition-opacity"
            >
              Explorar entradas
            </a>
            {esVendedor ? (
              <Link
                href="/mis-publicaciones/nueva"
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white/75 hover:bg-white/8 hover:text-white transition-colors backdrop-blur-sm"
              >
                + Publicar entrada
              </Link>
            ) : (
              <Link
                href={session ? "/mis-publicaciones/nueva" : "/auth/registro"}
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white/75 hover:bg-white/8 hover:text-white transition-colors backdrop-blur-sm"
              >
                Vender mi entrada
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="mt-10 flex gap-7 border-t border-white/7 pt-7">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/30">
                Protegido
              </p>
              <p className="text-2xl font-extrabold tracking-tight text-white">S/ 48,000</p>
            </div>
            <div className="w-px bg-white/7" />
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/30">
                Vendedores
              </p>
              <p className="text-2xl font-extrabold tracking-tight text-white">127+</p>
            </div>
            <div className="w-px bg-white/7" />
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/30">
                Tasa de éxito
              </p>
              <p className="text-2xl font-extrabold tracking-tight text-white">99.2%</p>
            </div>
          </div>
        </div>

        {/* ── Derecha: tarjeta destacada ────────────────────────── */}
        <div className="hidden lg:flex justify-center">
          {featured && precio ? (
            <Link href={`/entradas/${featured.id}`} className="group block w-[360px]">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1E2850]/90 to-[#0F1432]/95 shadow-[0_0_0_1px_rgba(245,158,11,0.08),0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_0_0_1px_rgba(245,158,11,0.2),0_32px_70px_rgba(0,0,0,0.6)]">
                {/* Imagen */}
                <div
                  className={`relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br ${GRADIENTE_CATEGORIA[featured.categoria]}`}
                >
                  {featured.imagenPortadaUrl ? (
                    <Image
                      src={featured.imagenPortadaUrl}
                      alt={featured.nombreEvento}
                      fill
                      className="object-cover"
                      sizes="360px"
                    />
                  ) : (
                    <span className="text-6xl opacity-30">
                      {ICONO_CATEGORIA[featured.categoria]}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1432]/90 to-transparent" />
                  <div className="absolute left-3 top-3 rounded-md border border-amber-500/30 bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-400">
                    ⭐ Destacado
                  </div>
                  <div className="absolute right-3 top-3 rounded-md border border-green-500/30 bg-green-500/10 px-2 py-1 text-[10px] font-bold text-green-400">
                    ✓ Verificado
                  </div>
                </div>

                {/* Cuerpo */}
                <div className="p-5">
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-400">
                    {LABEL_CATEGORIA[featured.categoria]} · Lima
                  </p>
                  <h3 className="mb-3 line-clamp-2 text-[17px] font-extrabold leading-snug tracking-tight text-white">
                    {featured.nombreEvento}
                  </h3>
                  <div className="mb-4 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <span>📅</span>
                      <span>{formatFecha(featured.fechaEvento)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <span>📍</span>
                      <span className="truncate">{featured.lugarEvento}</span>
                    </div>
                  </div>

                  {/* Divisor estilo ticket */}
                  <div className="my-4 flex items-center gap-3">
                    <div className="h-px flex-1 border-t border-dashed border-white/10" />
                    <span className="text-[10px] text-white/20">✦</span>
                    <div className="h-px flex-1 border-t border-dashed border-white/10" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-white/30">Precio total</p>
                      <p className="text-2xl font-extrabold tracking-tight text-amber-400">
                        S/ {precio}
                      </p>
                    </div>
                    <span className="rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-bold text-gray-900 shadow-[0_4px_16px_rgba(245,158,11,0.3)] group-hover:opacity-90 transition-opacity">
                      Reservar →
                    </span>
                  </div>

                  {/* Vendedor */}
                  <div className="mt-4 flex items-center gap-2.5 border-t border-white/7 pt-4">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                      {featured.vendedor.nombre.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-white/40">
                      {featured.vendedor.nombre.split(" ")[0]}
                    </span>
                    <span className="ml-auto rounded-full border border-green-500/25 bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-400">
                      Verificado
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex w-[360px] items-center justify-center rounded-2xl border border-white/6 bg-white/2 p-12 text-center">
              <div>
                <div className="mb-3 text-5xl">🎟</div>
                <p className="text-sm font-semibold text-white/35">
                  Pronto habrá entradas disponibles
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Player Spotify ambiental — franja full-width debajo del hero */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <SpotifyPlayer spotifyEmbedUrl={SPOTIFY_AMBIENTAL} artista="Bad Bunny" />
      </div>
    </div>
  )
}
