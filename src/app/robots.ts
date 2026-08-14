import { MetadataRoute } from "next"

const BASE_URL = process.env.AUTH_URL ?? "https://transfiero.pe"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/auth/",
          "/perfil",
          "/perfil/",
          "/mis-compras",
          "/mis-compras/",
          "/mis-ventas",
          "/mis-ventas/",
          "/mis-publicaciones",
          "/mis-publicaciones/",
          "/api/",
          "/notificaciones",
          "/dashboard",
          "/pagos/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
