import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PublicacionForm } from "@/components/publicaciones/PublicacionForm"

export default async function NuevaPublicacionPage() {
  const session = await auth()
  if (!session) redirect("/auth/login")
  if (
    session.user.rolPrincipal !== "VENDEDOR" ||
    session.user.estadoVendedor !== "APROBADO"
  ) {
    redirect("/403")
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Nueva publicación</h1>
        <p className="mt-1 text-sm text-gray-500">
          Completa los datos de la entrada. Podrás agregarla imagen después de guardar.
        </p>
      </div>
      <PublicacionForm modo="crear" />
    </main>
  )
}
