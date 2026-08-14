import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/auth/login")
  if (session.user.rolPrincipal !== "ADMINISTRADOR") redirect("/403")

  return (
    <div className="relative flex min-h-screen bg-[#05091A]">
      {/* Grid sutil */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:60px_60px]" />
      {/* Radial glows */}
      <div className="pointer-events-none fixed right-0 top-0 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/4 rounded-full bg-amber-500/5 blur-[120px]" />
      <div className="pointer-events-none fixed left-52 bottom-0 h-72 w-72 -translate-x-1/2 translate-y-1/4 rounded-full bg-indigo-600/5 blur-[100px]" />
      <AdminSidebar />
      <div className="relative z-10 flex-1 overflow-auto">{children}</div>
    </div>
  )
}
