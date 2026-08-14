import { defineConfig } from "prisma/config"
import { readFileSync } from "fs"
import { resolve } from "path"

// Prisma CLI no carga .env.local automáticamente (eso lo hace Next.js).
// Este bloque lo carga manualmente para que DATABASE_URL esté disponible.
try {
  const envFile = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8")
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIndex = trimmed.indexOf("=")
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    const raw = trimmed.slice(eqIndex + 1).trim()
    const value = raw.replace(/^["']|["']$/g, "")
    if (!process.env[key]) process.env[key] = value
  }
} catch {
  // .env.local no encontrado — se usan las variables de entorno del sistema
}

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
