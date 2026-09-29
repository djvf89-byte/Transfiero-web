"use client"

import type { VenueMapProps } from "./types"
import EstadioNacional from "./EstadioNacional"
import EstadioMonumental from "./EstadioMonumental"
import EstadioVillanueva from "./EstadioVillanueva"
import ArenaPeruCapital from "./ArenaPeruCapital"
import GranTeatroNacional from "./GranTeatroNacional"
import Costa21 from "./Costa21"
import Arena1 from "./Arena1"

const VENUE_COMPONENTS: Record<string, React.ComponentType<VenueMapProps>> = {
  "estadio-nacional": EstadioNacional,
  "estadio-monumental": EstadioMonumental,
  "estadio-villanueva": EstadioVillanueva,
  "arena-peru-capital": ArenaPeruCapital,
  "gran-teatro-nacional": GranTeatroNacional,
  "costa-21": Costa21,
  "arena-1": Arena1,
}

interface VenueMapaProps extends VenueMapProps {
  venueSlug: string
}

export default function VenueMapa({ venueSlug, ...props }: VenueMapaProps) {
  const Component = VENUE_COMPONENTS[venueSlug]
  if (!Component) return null
  return <Component {...props} />
}
