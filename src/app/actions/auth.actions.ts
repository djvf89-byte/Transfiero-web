"use server"

import { signIn, signOut } from "@/lib/auth"
import { registroSchema } from "@/lib/validators/registro.schema"
import {
  buscarUsuarioPorEmail,
  crearUsuario,
  crearTokenRecuperacion,
  validarTokenRecuperacion,
  consumirTokenYActualizarPassword,
} from "@/services/usuario.service"
import { enviarEmailRecuperacion, enviarEmail, htmlBienvenida } from "@/lib/email"
import { getClientIp, limitarLogin, limitarRegistro, limitarRecuperacion } from "@/lib/rate-limiter"
import { AuthError } from "next-auth"
import { z } from "zod"

export async function loginAction(formData: FormData) {
  const ip = await getClientIp()
  const limitError = await limitarLogin(ip)
  if (limitError) return { error: limitError }

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const callbackUrl = (formData.get("callbackUrl") as string) || "/dashboard"

  try {
    await signIn("credentials", { email, password, redirectTo: callbackUrl })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email o contraseña incorrectos." }
        default:
          return { error: "Ocurrió un error al iniciar sesión. Intenta de nuevo." }
      }
    }
    throw error
  }
}

export async function registroAction(formData: FormData) {
  if (!formData.get("terminos")) {
    return { error: "Debes aceptar los términos y condiciones para continuar." }
  }

  const ip = await getClientIp()
  const limitError = await limitarRegistro(ip)
  if (limitError) return { error: limitError }

  const datos = {
    nombre: formData.get("nombre") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  }

  const parsed = registroSchema.safeParse(datos)
  if (!parsed.success) {
    const mensaje = parsed.error.issues[0]?.message ?? "Datos inválidos."
    return { error: mensaje }
  }

  const existente = await buscarUsuarioPorEmail(parsed.data.email)
  if (existente) {
    return { error: "Este email ya está registrado." }
  }

  try {
    await crearUsuario({
      nombre: parsed.data.nombre,
      email: parsed.data.email,
      password: parsed.data.password,
    })

    // Email de bienvenida — no bloquea el registro si falla
    await enviarEmail(
      parsed.data.email,
      "¡Bienvenido a Transfiero!",
      htmlBienvenida(parsed.data.nombre)
    )

    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Registro exitoso, pero no se pudo iniciar sesión automáticamente." }
    }
    throw error
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/auth/login" })
}

const nuevaPasswordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")

export async function recuperarContrasenaAction(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase()
  if (!email) return { error: "Ingresa tu email." }

  const ip = await getClientIp()
  const limitError = await limitarRecuperacion(ip, email)
  if (limitError) return { error: limitError }

  // Devuelve éxito aunque el email no exista (evitar enumeración de usuarios)
  const token = await crearTokenRecuperacion(email)
  if (token) {
    await enviarEmailRecuperacion(email, token)
  }

  return { ok: true }
}

export async function nuevaContrasenaAction(formData: FormData) {
  const token = formData.get("token") as string | null
  const password = formData.get("password") as string | null
  const confirmPassword = formData.get("confirmPassword") as string | null

  if (!token) return { error: "Token inválido." }

  const parsedPass = nuevaPasswordSchema.safeParse(password)
  if (!parsedPass.success) return { error: parsedPass.error.issues[0]?.message ?? "Contraseña inválida." }

  if (password !== confirmPassword) return { error: "Las contraseñas no coinciden." }

  const registro = await validarTokenRecuperacion(token)
  if (!registro) return { error: "El enlace de recuperación expiró o es inválido." }

  const ok = await consumirTokenYActualizarPassword(token, registro.identifier, password!)
  if (!ok) return { error: "No se pudo actualizar la contraseña. Intenta de nuevo." }

  return { ok: true }
}
