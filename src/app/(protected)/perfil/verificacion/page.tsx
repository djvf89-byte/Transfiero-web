import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { VerificacionForm } from "@/components/perfil/VerificacionForm"

export default async function VerificacionPage() {
  const session = await auth()
  if (!session) redirect("/auth/login")

  const estadosPermitidos = ["NO_SOLICITADO", "RECHAZADO"]
  if (!estadosPermitidos.includes(session.user.estadoVendedor)) {
    redirect("/perfil")
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <Link href="/perfil" className="mb-6 inline-block text-sm text-gray-400 hover:text-gray-600 transition-colors">
        ← Volver a mi perfil
      </Link>

      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-3xl">
            🛡
          </div>
          <h1 className="text-xl font-extrabold text-gray-900">Verificación de identidad</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sube una foto clara de tu DNI peruano por ambas caras. Las imágenes son revisadas manualmente y no se comparten.
          </p>
        </div>

        <VerificacionForm />
      </div>
    </div>
  )
}
