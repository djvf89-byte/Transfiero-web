import { z } from "zod"

export const registroSchema = z
  .object({
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export type RegistroInput = z.infer<typeof registroSchema>
