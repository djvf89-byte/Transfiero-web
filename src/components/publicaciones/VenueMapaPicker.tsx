"use client"

import { useState } from "react"
import { VENUES } from "@/lib/venues"
import VenueMapa from "@/components/venue-maps/VenueMapa"

const INPUT =
  "w-full rounded-xl border border-white/10 bg-white/6 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition"

const LABEL = "block text-sm font-medium text-white/60 mb-1.5"

interface Props {
  defaultVenueSlug?: string | null
  defaultZona?: string
  onZoneSelected: (zoneLabel: string) => void
  onVenueSelected?: (venueName: string) => void
}

export default function VenueMapaPicker({
  defaultVenueSlug,
  defaultZona,
  onZoneSelected,
  onVenueSelected,
}: Props) {
  const [venueSlug, setVenueSlug] = useState<string>(defaultVenueSlug ?? "")
  const [selectedZone, setSelectedZone] = useState<string | null>(null)

  function handleVenueChange(slug: string) {
    setVenueSlug(slug)
    setSelectedZone(null)
    if (slug) {
      const venue = VENUES.find((v) => v.slug === slug)
      if (venue) onVenueSelected?.(venue.name)
    }
  }

  function handleZoneSelect(zoneId: string, zoneLabel: string) {
    setSelectedZone(zoneId)
    onZoneSelected(zoneLabel)
  }

  const selectedVenue = VENUES.find((v) => v.slug === venueSlug)

  return (
    <div className="space-y-4">
      {/* Hidden input para venueSlug */}
      <input type="hidden" name="venueSlug" value={venueSlug} />

      {/* Dropdown de recinto */}
      <div>
        <label className={LABEL}>Recinto</label>
        <select
          value={venueSlug}
          onChange={(e) => handleVenueChange(e.target.value)}
          className={INPUT}
        >
          <option value="" className="bg-[#0d1224]">
            Selecciona el recinto (opcional)
          </option>
          {VENUES.map((v) => (
            <option key={v.slug} value={v.slug} className="bg-[#0d1224]">
              {v.name} — {v.location}
            </option>
          ))}
        </select>
      </div>

      {/* Mapa SVG */}
      {venueSlug && selectedVenue && (
        <div className="space-y-3">
          <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
            <div className="px-4 pt-3 pb-1 flex items-center justify-between">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                Selecciona tu zona
              </p>
              {selectedZone && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedZone(null)
                    onZoneSelected("")
                  }}
                  className="text-xs text-white/35 hover:text-white/60 transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>
            <div className="p-3">
              <VenueMapa
                venueSlug={venueSlug}
                mode="select"
                selectedZone={selectedZone}
                onZoneSelect={handleZoneSelect}
              />
            </div>
          </div>

          {/* Chips de zonas disponibles */}
          <div className="flex flex-wrap gap-2">
            {selectedVenue.zones.map((z) => (
              <button
                key={z.id}
                type="button"
                onClick={() => handleZoneSelect(z.id, z.label)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  selectedZone === z.id
                    ? "border-amber-500/60 bg-amber-500/12 text-amber-400"
                    : "border-white/10 bg-white/[0.04] text-white/50 hover:text-white/70 hover:border-white/20"
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>

          {selectedZone && (
            <p className="text-xs text-amber-400/80">
              ✓ Zona seleccionada:{" "}
              <span className="font-semibold">
                {selectedVenue.zones.find((z) => z.id === selectedZone)?.label}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
