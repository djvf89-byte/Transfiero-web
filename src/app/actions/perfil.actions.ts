"use server"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { datosPersonalesSchema, cuentaBancariaSchema } from "@/lib/validators/perfil.schema"
import { actualizarDatosPersonales } from "@/services/usuario.service"
import { crearCuentaBancaria, actualizarCuentaBancaria } from "@/services/cuenta-bancaria.service"

async function requireAuth() {
  const session = await auth()
  if (!session) redirect("/auth/login")
  return session.user
}

export async function actualizarDatosPersonalesAction(formData: {
  nombres: string
  apellidos: string
  dni: string
  telefono?: string | null
}) {
  const usuario = await requireAuth()

  const parsed = datosPersonalesSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" }
  }

  try {
    await actualizarDatosPersonales(usuario.id, parsed.data)
    revalidatePath("/perfil")
    return { ok: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al guardar los datos" }
  }
}

export async function guardarCuentaBancariaAction(
  datos: {
    banco: string; tipoCuenta: "AHORROS" | "CORRIENTE"
    numeroCuenta: string; cci?: string; titular: string; documentoTitular: string
  },
  cuentaExistenteId?: string
) {
  const usuario = await requireAuth()

  const parsed = cuentaBancariaSchema.safeParse(datos)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos de cuenta inválidos" }
  }

  try {
    if (cuentaExistenteId) {
      await actualizarCuentaBancaria(cuentaExistenteId, usuario.id, parsed.data)
    } else {
      await crearCuentaBancaria(usuario.id, parsed.data)
    }
    revalidatePath("/perfil")
    return { ok: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al guardar la cuenta" }
  }
}
