import { z } from "zod"

const letrasYEspacios = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'-]+$/

export const datosPersonalesSchema = z.object({
  nombres:   z.string().min(2, "Mínimo 2 caracteres").max(80).regex(letrasYEspacios, "Solo letras y espacios"),
  apellidos: z.string().min(2, "Mínimo 2 caracteres").max(80).regex(letrasYEspacios, "Solo letras y espacios"),
  dni:       z.string().regex(/^\d{8}$/, "El DNI debe tener exactamente 8 dígitos"),
  telefono:  z.string().max(20).optional().nullable(),
})

export type DatosPersonalesInput = z.infer<typeof datosPersonalesSchema>

export const BANCOS_PERU = [
  "BCP",
  "BBVA",
  "Interbank",
  "Scotiabank",
  "BanBif",
  "Banco Pichincha",
  "Mibanco",
  "Banco de la Nación",
  "Caja Huancayo",
  "Caja Arequipa",
  "Otro",
] as const

export type BancoPeru = typeof BANCOS_PERU[number]

export const cuentaBancariaSchema = z.object({
  banco:             z.string().min(1, "Selecciona un banco"),
  tipoCuenta:        z.enum(["AHORROS", "CORRIENTE"]),
  numeroCuenta:      z.string().min(8, "Mínimo 8 dígitos").max(30).regex(/^\d+$/, "Solo dígitos"),
  cci:               z.string().regex(/^\d{20}$/, "El CCI debe tener 20 dígitos").optional().or(z.literal("")),
  titular:           z.string().min(3, "Nombre del titular requerido").max(120),
  documentoTitular:  z.string().regex(/^\d{8}$/, "El DNI del titular debe tener 8 dígitos"),
})

export type CuentaBancariaInput = z.infer<typeof cuentaBancariaSchema>
