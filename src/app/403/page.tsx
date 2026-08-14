import Link from "next/link"
import { logoutAction } from "@/app/actions/auth.actions"
import { buttonVariants } from "@/components/ui/button"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AccesoDenegadoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-gray-50">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-5xl font-bold text-gray-300">403</span>
        <h1 className="text-2xl font-semibold text-gray-800">Acceso denegado</h1>
        <p className="text-muted-foreground max-w-sm">
          No tienes permisos para acceder a esta sección.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "default" }))}>
          Volver al dashboard
        </Link>

        <form action={logoutAction}>
          <Button type="submit" variant="outline" className="w-full sm:w-auto">
            Cerrar sesión
          </Button>
        </form>
      </div>

      <p className="text-xs text-muted-foreground">
        <Link href="/" className="underline underline-offset-4">
          Transfiero
        </Link>
      </p>
    </div>
  )
}
