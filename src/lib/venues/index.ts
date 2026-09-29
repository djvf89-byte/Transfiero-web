export interface ZoneInfo {
  id: string
  label: string
  color: string
}

export interface VenueInfo {
  slug: string
  name: string
  shortName: string
  location: string
  type: 'estadio' | 'arena' | 'teatro' | 'recinto'
  zones: ZoneInfo[]
}

export const VENUES: VenueInfo[] = [
  {
    slug: 'estadio-nacional',
    name: 'Estadio Nacional',
    shortName: 'Estadio Nacional',
    location: 'Lima',
    type: 'estadio',
    zones: [
      { id: 'campo', label: 'Campo / Piso', color: '#22c55e' },
      { id: 'palcos', label: 'Palcos', color: '#ec4899' },
      { id: 'sur', label: 'Tribuna Sur', color: '#3b82f6' },
      { id: 'norte', label: 'Tribuna Norte', color: '#8b5cf6' },
      { id: 'oriente', label: 'Oriente', color: '#f59e0b' },
    ],
  },
  {
    slug: 'estadio-monumental',
    name: 'Estadio Monumental',
    shortName: 'Monumental',
    location: 'Ate, Lima',
    type: 'estadio',
    zones: [
      { id: 'campo', label: 'Campo / Piso', color: '#22c55e' },
      { id: 'palcos', label: 'Palcos', color: '#ec4899' },
      { id: 'norte', label: 'Tribuna Norte — El Cemento', color: '#3b82f6' },
      { id: 'sur', label: 'Tribuna Sur', color: '#8b5cf6' },
      { id: 'oriente', label: 'Oriente', color: '#f59e0b' },
    ],
  },
  {
    slug: 'estadio-villanueva',
    name: 'Estadio Alejandro Villanueva',
    shortName: 'Matute',
    location: 'La Victoria, Lima',
    type: 'estadio',
    zones: [
      { id: 'norte', label: 'Tribuna Norte', color: '#3b82f6' },
      { id: 'sur', label: 'Tribuna Sur', color: '#8b5cf6' },
      { id: 'tribuna-este', label: 'Tribuna Este', color: '#f59e0b' },
      { id: 'tribuna-oeste', label: 'Tribuna Oeste', color: '#10b981' },
    ],
  },
  {
    slug: 'arena-peru-capital',
    name: 'Arena Perú Capital',
    shortName: 'Arena Perú',
    location: 'La Molina, Lima',
    type: 'arena',
    zones: [
      { id: 'piso', label: 'Piso / Floor', color: '#22c55e' },
      { id: 'vip', label: 'VIP', color: '#ec4899' },
      { id: 'platea-baja', label: 'Platea Baja', color: '#3b82f6' },
      { id: 'platea-alta', label: 'Platea Alta', color: '#8b5cf6' },
    ],
  },
  {
    slug: 'gran-teatro-nacional',
    name: 'Gran Teatro Nacional',
    shortName: 'Gran Teatro Nacional',
    location: 'San Borja, Lima',
    type: 'teatro',
    zones: [
      { id: 'platea', label: 'Platea Central', color: '#22c55e' },
      { id: 'platea-lateral', label: 'Platea Lateral', color: '#3b82f6' },
      { id: 'mezanine', label: 'Mezanine', color: '#f59e0b' },
      { id: 'anfiteatro', label: 'Anfiteatro', color: '#8b5cf6' },
    ],
  },
  {
    slug: 'costa-21',
    name: 'Costa 21',
    shortName: 'Costa 21',
    location: 'Costa Verde, Lima',
    type: 'recinto',
    zones: [
      { id: 'platinum', label: 'Platinum Asientos Numerados', color: '#eab308' },
      { id: 'vip', label: 'VIP Sin Asientos', color: '#f97316' },
      { id: 'tribuna-izquierda', label: 'Tribuna Izquierda Numerado', color: '#3b82f6' },
      { id: 'tribuna-derecha', label: 'Tribuna Derecha Numerado', color: '#8b5cf6' },
      { id: 'tribuna-general', label: 'Tribuna General Numerado', color: '#64748b' },
    ],
  },
  {
    slug: 'arena-1',
    name: 'Arena 1',
    shortName: 'Arena 1',
    location: 'Costa Verde, Lima',
    type: 'recinto',
    zones: [
      { id: 'general', label: 'General', color: '#22c55e' },
      { id: 'preferencial', label: 'Preferencial', color: '#f59e0b' },
      { id: 'platinum', label: 'Platinum', color: '#ec4899' },
    ],
  },
]

export function getVenueBySlug(slug: string): VenueInfo | undefined {
  return VENUES.find((v) => v.slug === slug)
}

export function getZoneLabel(venueSlug: string, zoneId: string): string {
  const venue = getVenueBySlug(venueSlug)
  return venue?.zones.find((z) => z.id === zoneId)?.label ?? zoneId
}

export function getZoneIdByLabel(venueSlug: string, label: string): string | undefined {
  return getVenueBySlug(venueSlug)?.zones.find((z) => z.label === label)?.id
}
