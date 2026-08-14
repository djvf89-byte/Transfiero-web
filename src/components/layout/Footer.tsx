import Link from "next/link"
import Image from "next/image"

const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://instagram.com/transfiero"
const TIKTOK_URL = process.env.NEXT_PUBLIC_TIKTOK_URL ?? "https://tiktok.com/@transfiero"

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function IconTikTok() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="bg-[#050E24] border-t border-white/5 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="mb-3 inline-block">
              <Image
                src="/logo-dark.png"
                alt="Transfiero"
                width={160}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              La plataforma peruana de transferencia segura de entradas entre particulares.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">
              🔒 Pagos con custodia escrow
            </div>
          </div>

          {/* Plataforma */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-300">
              Plataforma
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Marketplace" },
                { href: "/como-funciona", label: "Cómo funciona" },
                { href: "/mis-publicaciones/nueva", label: "Vender entradas" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-300">
              Soporte
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Centro de ayuda", href: "/como-funciona" },
                { label: "Disputas", href: "/seguridad" },
                { label: "Contacto", href: "mailto:soporte@transfiero.pe" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa + Redes */}
          <div className="space-y-6">
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-300">
                Empresa
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/como-funciona" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    Cómo funciona
                  </Link>
                </li>
                <li>
                  <Link href="/seguridad" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    Seguridad
                  </Link>
                </li>
              </ul>
            </div>

            {(INSTAGRAM_URL || TIKTOK_URL) && (
              <div>
                <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-300">
                  Redes
                </h4>
                <div className="flex items-center gap-3">
                  {INSTAGRAM_URL && (
                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-gray-500 transition-all hover:border-[#E1306C]/40 hover:bg-[#E1306C]/10 hover:text-[#E1306C]"
                    >
                      <IconInstagram />
                    </a>
                  )}
                  {TIKTOK_URL && (
                    <a
                      href={TIKTOK_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="TikTok"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-gray-500 transition-all hover:border-white/20 hover:bg-white/8 hover:text-white"
                    >
                      <IconTikTok />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row">
          <p className="text-xs text-gray-600">
            © 2026 Transfiero. Plataforma de intermediación registrada en Perú.
          </p>
          <div className="flex gap-5">
            {[
              { label: "Términos de uso", href: "/terminos" },
              { label: "Privacidad", href: "/privacidad" },
              { label: "Cookies", href: "/cookies" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
