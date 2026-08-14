import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const BASE_URL = process.env.AUTH_URL ?? "https://transfiero.pe"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Transfiero — Entradas seguras en Perú",
    template: "%s | Transfiero",
  },
  description:
    "Compra y vende entradas entre personas con pago en custodia. Sin estafas, sin riesgos.",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: BASE_URL,
    siteName: "Transfiero",
    title: "Transfiero — Entradas seguras en Perú",
    description:
      "Compra y vende entradas entre personas con pago en custodia. Sin estafas, sin riesgos.",
    images: [
      {
        url: "/logo-dark.png",
        width: 1200,
        height: 630,
        alt: "Transfiero — Plataforma de entradas seguras",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Transfiero — Entradas seguras en Perú",
    description:
      "Compra y vende entradas entre personas con pago en custodia. Sin estafas, sin riesgos.",
    images: ["/logo-dark.png"],
  },
  icons: {
    icon: "/logo-dark.png",
    apple: "/logo-dark.png",
  },
  robots: {
    index: true,
    follow: true,
  },
}

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Transfiero",
  url: BASE_URL,
  logo: `${BASE_URL}/logo-dark.png`,
  sameAs: [
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://instagram.com/transfiero",
    process.env.NEXT_PUBLIC_TIKTOK_URL ?? "https://tiktok.com/@transfiero",
  ].filter(Boolean),
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "soporte@transfiero.pe",
    availableLanguage: "Spanish",
  },
}

const jsonLdWebsite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Transfiero",
  url: BASE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${BASE_URL}/entradas?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${geist.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        {children}
      </body>
    </html>
  )
}
