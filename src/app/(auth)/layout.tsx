import Image from "next/image"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#05091A] px-4 py-12">
      {/* Grid sutil — igual que el home */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Radial glows — igual que el hero */}
      <div className="pointer-events-none fixed right-0 top-0 h-[600px] w-[600px] translate-x-1/3 -translate-y-1/4 rounded-full bg-amber-500/5 blur-[100px]" />
      <div className="pointer-events-none fixed left-0 bottom-0 h-72 w-72 -translate-x-1/4 translate-y-1/4 rounded-full bg-indigo-600/5 blur-[80px]" />

      {/* Logo */}
      <Link href="/" className="relative z-10 mb-8">
        <Image
          src="/logo-dark.png"
          alt="Transfiero"
          width={180}
          height={45}
          className="h-10 w-auto"
          priority
        />
      </Link>

      {/* Card glassmorphism */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/8 bg-white/4 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        {children}
      </div>

      <p className="relative z-10 mt-8 text-xs text-white/20">
        © {new Date().getFullYear()} Transfiero · Transferencias seguras en Perú
      </p>
    </div>
  )
}
