/**
 * Fotos referenciales para eventos conocidos.
 * Se usa como fallback cuando imagenPortadaUrl es null en la BD.
 * Todas las imágenes son de Unsplash (uso libre para demos).
 */
const EVENT_PHOTOS: Record<string, string> = {
  "Bad Bunny — Most Wanted Tour":
    "https://images.unsplash.com/photo-1540039155733-5bb30b4ac843?w=800&q=80&fit=crop",
  "Coldplay — Music of the Spheres World Tour":
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80&fit=crop",
  "Karol G — Mañana Será Bonito Tour":
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80&fit=crop",
  "Alianza Lima vs. Universitario — Clásico del Fútbol Peruano":
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80&fit=crop",
  "Selección Peruana vs. Argentina — Eliminatorias 2026":
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80&fit=crop",
  "Liga Nacional de Vóley — Final Temporada 2026":
    "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80&fit=crop",
  "Vivo x el Rock 2026":
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80&fit=crop",
  "Reggaeton Lima Festival":
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80&fit=crop",
  "Lima Jazz Festival 2026":
    "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80&fit=crop",
  "Hamilton — El Musical (Gira Latinoamérica)":
    "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&q=80&fit=crop",
  "El Rey León — Producción Broadway":
    "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&q=80&fit=crop",
  "Los Monólogos de la Vagina — Edición 20 Aniversario":
    "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80&fit=crop",
  "TEDxLima 2026 — El Futuro que Construimos":
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80&fit=crop",
  "Cirque du Soleil — KOOZA Lima":
    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80&fit=crop",
  "World Padel Tour — Lima Open 2026":
    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80&fit=crop",
}

export function getEventPhoto(nombreEvento: string): string | undefined {
  return EVENT_PHOTOS[nombreEvento]
}
