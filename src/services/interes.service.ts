import { prisma } from "@/lib/prisma"
import type { TipoInteresConcierto } from "@prisma/client"

export async function registrarInteresConcierto(
  publicacionId: string,
  usuarioId: string | undefined,
  tipo: TipoInteresConcierto
): Promise<void> {
  try {
    await prisma.interesConcierto.create({
      data: { publicacionId, usuarioId, tipo },
    })
  } catch {
    // Silencioso — el tracking nunca interrumpe el flujo principal
  }
}
