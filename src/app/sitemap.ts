import { MetadataRoute } from "next"
import { listarPublicacionesSitemap } from "@/services/publicacion.service"

const BASE_URL = process.env.AUTH_URL ?? "https://transfiero.pe"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let publicaciones: Awaited<ReturnType<typeof listarPublicacionesSitemap>> = []
  try {
    publicaciones = await listarPublicacionesSitemap()
  } catch {
    // DB no disponible durante el build — el sitemap solo incluye páginas estáticas
  }

  const estaticas: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,               lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/entradas`,        lastModified: new Date(), changeFrequency: "hourly",  priority: 0.9 },
    { url: `${BASE_URL}/como-funciona`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/seguridad`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/terminos`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/privacidad`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/cookies`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ]

  const dinamicas: MetadataRoute.Sitemap = publicaciones.map((pub) => ({
    url: `${BASE_URL}/entradas/${pub.id}`,
    lastModified: pub.actualizadoEn,
    changeFrequency: "daily",
    priority: 0.8,
  }))

  return [...estaticas, ...dinamicas]
}
