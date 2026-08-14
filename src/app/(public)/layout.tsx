import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#05091A] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <Navbar />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
    </div>
  )
}
