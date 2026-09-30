-- Migración de datos: asignar fotos referenciales a publicaciones de prueba
-- Solo actualiza registros que aún no tienen imagen de portada

UPDATE "Publicacion" SET "imagenPortadaUrl" = 'https://images.unsplash.com/photo-1540039155733-5bb30b4ac843?w=800&q=80&fit=crop'
WHERE "nombreEvento" = 'Bad Bunny — Most Wanted Tour' AND "imagenPortadaUrl" IS NULL;

UPDATE "Publicacion" SET "imagenPortadaUrl" = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80&fit=crop'
WHERE "nombreEvento" = 'Coldplay — Music of the Spheres World Tour' AND "imagenPortadaUrl" IS NULL;

UPDATE "Publicacion" SET "imagenPortadaUrl" = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80&fit=crop'
WHERE "nombreEvento" = 'Karol G — Mañana Será Bonito Tour' AND "imagenPortadaUrl" IS NULL;

UPDATE "Publicacion" SET "imagenPortadaUrl" = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80&fit=crop'
WHERE "nombreEvento" = 'Alianza Lima vs. Universitario — Clásico del Fútbol Peruano' AND "imagenPortadaUrl" IS NULL;

UPDATE "Publicacion" SET "imagenPortadaUrl" = 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80&fit=crop'
WHERE "nombreEvento" = 'Selección Peruana vs. Argentina — Eliminatorias 2026' AND "imagenPortadaUrl" IS NULL;

UPDATE "Publicacion" SET "imagenPortadaUrl" = 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80&fit=crop'
WHERE "nombreEvento" = 'Liga Nacional de Vóley — Final Temporada 2026' AND "imagenPortadaUrl" IS NULL;

UPDATE "Publicacion" SET "imagenPortadaUrl" = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80&fit=crop'
WHERE "nombreEvento" = 'Vivo x el Rock 2026' AND "imagenPortadaUrl" IS NULL;

UPDATE "Publicacion" SET "imagenPortadaUrl" = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80&fit=crop'
WHERE "nombreEvento" = 'Reggaeton Lima Festival' AND "imagenPortadaUrl" IS NULL;

UPDATE "Publicacion" SET "imagenPortadaUrl" = 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80&fit=crop'
WHERE "nombreEvento" = 'Lima Jazz Festival 2026' AND "imagenPortadaUrl" IS NULL;

UPDATE "Publicacion" SET "imagenPortadaUrl" = 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&q=80&fit=crop'
WHERE "nombreEvento" = 'Hamilton — El Musical (Gira Latinoamérica)' AND "imagenPortadaUrl" IS NULL;

UPDATE "Publicacion" SET "imagenPortadaUrl" = 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&q=80&fit=crop'
WHERE "nombreEvento" = 'El Rey León — Producción Broadway' AND "imagenPortadaUrl" IS NULL;

UPDATE "Publicacion" SET "imagenPortadaUrl" = 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80&fit=crop'
WHERE "nombreEvento" = 'Los Monólogos de la Vagina — Edición 20 Aniversario' AND "imagenPortadaUrl" IS NULL;

UPDATE "Publicacion" SET "imagenPortadaUrl" = 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80&fit=crop'
WHERE "nombreEvento" = 'TEDxLima 2026 — El Futuro que Construimos' AND "imagenPortadaUrl" IS NULL;

UPDATE "Publicacion" SET "imagenPortadaUrl" = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80&fit=crop'
WHERE "nombreEvento" = 'Cirque du Soleil — KOOZA Lima' AND "imagenPortadaUrl" IS NULL;

UPDATE "Publicacion" SET "imagenPortadaUrl" = 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80&fit=crop'
WHERE "nombreEvento" = 'World Padel Tour — Lima Open 2026' AND "imagenPortadaUrl" IS NULL;
