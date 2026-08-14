"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { logoutAction } from "@/app/actions/auth.actions"

const LINKS = [
  { href: "/admin",               label: "Dashboard",      exact: true  },
  { href: "/admin/publicaciones", label: "Publicaciones",  exact: false },
  { href: "/admin/vendedores",    label: "Vendedores",     exact: false },
  { href: "/admin/operaciones",   label: "Operaciones",    exact: false },
  { href: "/admin/usuarios",      label: "Usuarios",       exact: false },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="relative z-10 flex w-52 shrink-0 flex-col border-r border-white/8 bg-white/[0.03]">
      {/* Logo */}
      <div className="border-b border-white/8 px-4 py-4">
        <Link href="/">
          <Image
            src="/logo-dark.png"
            alt="Transfiero"
            width={130}
            height={33}
            className="h-[34px] w-auto"
          />
        </Link>
      </div>

      {/* Label panel */}
      <div className="px-4 py-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">
          Panel Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2">
        {LINKS.map((link) => {
          const activo = link.exact ? pathname === link.href : pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activo
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                  : "text-white/50 hover:bg-white/6 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/8 px-2 py-3 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/40 hover:bg-white/6 hover:text-white transition-colors"
        >
          <span className="text-xs">←</span>
          Volver al sitio
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors text-left"
          >
            <span className="text-xs">⏻</span>
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
