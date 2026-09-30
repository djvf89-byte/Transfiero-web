/**
 * Asigna venueSlug y zona a las publicaciones del seed demo ya existentes.
 * Idempotente: usa UPDATE WHERE "venueSlug" IS NULL para no sobreescribir
 * publicaciones editadas manualmente.
 */
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
if (!connectionString) {
  console.log('No DATABASE_URL — skipping venue patch')
  process.exit(0)
}

const pool = new Pool({ connectionString })

const PATCHES = [
  { nombre: 'Bad Bunny — Most Wanted Tour',                         venueSlug: 'estadio-nacional',    zona: 'Tribuna Norte'    },
  { nombre: 'Coldplay — Music of the Spheres World Tour',           venueSlug: 'estadio-nacional',    zona: 'Campo / Piso'     },
  { nombre: 'Alianza Lima vs. Universitario — Clásico del Fútbol Peruano', venueSlug: 'estadio-villanueva', zona: 'Tribuna Sur'  },
  { nombre: 'Selección Peruana vs. Argentina — Eliminatorias 2026', venueSlug: 'estadio-nacional',    zona: 'Tribuna Norte'    },
  { nombre: 'Reggaeton Lima Festival',                              venueSlug: 'arena-1',             zona: 'Preferencial'     },
  { nombre: 'Hamilton — El Musical (Gira Latinoamérica)',           venueSlug: 'gran-teatro-nacional', zona: 'Platea Central'  },
]

let actualizadas = 0
for (const p of PATCHES) {
  const res = await pool.query(
    `UPDATE publicaciones
     SET "venueSlug" = $1, zona = $2
     WHERE "nombreEvento" = $3 AND "venueSlug" IS NULL`,
    [p.venueSlug, p.zona, p.nombre]
  )
  if (res.rowCount > 0) {
    console.log(`✓ ${p.nombre} → ${p.venueSlug} / ${p.zona}`)
    actualizadas += res.rowCount
  }
}

if (actualizadas === 0) {
  console.log('✓ Venues ya estaban asignados (nada que actualizar)')
} else {
  console.log(`✓ ${actualizadas} publicaciones actualizadas con venueSlug`)
}

await pool.end()
