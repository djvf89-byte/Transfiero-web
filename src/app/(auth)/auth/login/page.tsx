import { Suspense } from "react"
import { LoginForm } from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-white">Bienvenido de vuelta</h1>
        <p className="mt-1 text-sm text-white/50">Inicia sesión en tu cuenta</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  )
}
