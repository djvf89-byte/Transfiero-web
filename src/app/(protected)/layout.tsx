import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/auth/login")
  if (session.user.estadoCuenta !== "ACTIVO") redirect("/auth/login")

  return (
    <div className="relative flex min-h-screen flex-col bg-[#05091A]">
      {/* Grid sutil */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:60px_60px]" />
      {/* Radial glows */}
      <div className="pointer-events-none fixed right-0 top-0 h-[600px] w-[600px] translate-x-1/3 -translate-y-1/4 rounded-full bg-amber-500/5 blur-[120px]" />
      <div className="pointer-events-none fixed left-0 bottom-0 h-80 w-80 -translate-x-1/4 translate-y-1/4 rounded-full bg-indigo-600/5 blur-[100px]" />
      <Navbar />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
    </div>
  )
}
