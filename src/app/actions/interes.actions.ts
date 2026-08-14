"use server"

import { auth } from "@/lib/auth"
import { registrarInteresConcierto } from "@/services/interes.service"
import type { TipoInteresConcierto } from "@prisma/client"

export async function registrarInteresAction(
  publicacionId: string,
  tipo: TipoInteresConcierto
): Promise<void> {
  const session = await auth()
  await registrarInteresConcierto(publicacionId, session?.user.id, tipo)
}
