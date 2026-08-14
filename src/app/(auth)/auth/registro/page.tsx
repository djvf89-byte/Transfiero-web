import { RegistroForm } from "@/components/auth/RegistroForm"

export default function RegistroPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-white">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-white/50">Empieza a comprar y vender entradas de forma segura</p>
      </div>
      <RegistroForm />
    </>
  )
}
