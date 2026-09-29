export interface VenueMapProps {
  mode: 'select' | 'display'
  selectedZone?: string | null
  onZoneSelect?: (zoneId: string, zoneLabel: string) => void
  availableZones?: string[]
}
