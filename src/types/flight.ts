export interface Airport {
  code: string
  name: string
  city: string
  country: string
  timezone: string
}

export interface FlightLeg {
  id: string
  from: Airport
  to: Airport
  departure: string // ISO datetime
  arrival: string // ISO datetime
  duration: number // minutes
  aircraft: string
  flightNumber: string
  terminal?: string
  gate?: string
}

export interface Airline {
  id: string
  name: string
  code: string
  logo: string
  rating?: number
}

export interface FlightPrice {
  base: number
  taxes: number
  fees: number
  total: number
  currency: string
}

export interface FlightSeats {
  available: number
  cabinClass: 'economy' | 'premium-economy' | 'business' | 'first'
  seatMap?: SeatMapLayout
}

export interface SeatMapLayout {
  rows: SeatRow[]
  layout: string[] // e.g., ['A', 'B', 'C', '-', 'D', 'E', 'F']
}

export interface SeatRow {
  number: number
  seats: Seat[]
}

export interface Seat {
  id: string
  number: string
  type: 'regular' | 'exit-row' | 'window' | 'aisle' | 'bulkhead' | 'extra-legroom'
  available: boolean
  price: number
  features?: string[]
}

export interface Flight {
  id: string
  airline: Airline
  legs: FlightLeg[]
  price: FlightPrice
  seats: FlightSeats
  amenities: string[]
  carbonEmission: number // kg CO2
  isEcoFriendly: boolean
  stops: number
  totalDuration: number // total minutes
  layovers?: Layover[]
}

export interface Layover {
  airport: Airport
  duration: number // minutes
  terminal?: string
  gate?: string
}

export interface FlightSearch {
  tripType: 'one-way' | 'round-trip' | 'multi-city'
  passengers: {
    adults: number
    children: number
    infants: number
  }
  cabinClass: 'economy' | 'premium-economy' | 'business' | 'first'
  flights: Array<{
    from: string // Airport code
    to: string // Airport code
    departureDate: string // ISO date
    returnDate?: string // For round-trip
  }>
  flexible: {
    enabled: boolean
    days: number // +/- days
  }
  filters: {
    maxStops?: number
    airlines?: string[]
    maxPrice?: number
    maxDuration?: number
    departureTimeRanges?: TimeRange[]
    arrivalTimeRanges?: TimeRange[]
    airports?: string[]
  }
}

export interface TimeRange {
  label: string
  start: string // HH:MM
  end: string // HH:MM
}

export interface FlightFilters {
  priceRange: [number, number]
  airlines: string[]
  stops: number[]
  durationRange: [number, number]
  departureTimeRanges: TimeRange[]
  arrivalTimeRanges: TimeRange[]
  airports: string[]
  directFlightsOnly: boolean
  ecoFriendlyOnly: boolean
}

export type SortOption =
  | 'best'
  | 'price-low'
  | 'price-high'
  | 'duration'
  | 'departure-early'
  | 'departure-late'
  | 'arrival-early'
  | 'arrival-late'

export interface FlightSearchResponse {
  success: boolean
  message?: string
  errors?: Array<{ msg: string; path?: string }>
  flights: Flight[]
  pagination: {
    total: number
    page: number
    limit: number
    hasNext: boolean
    hasPrevious: boolean
  }
  filters: {
    priceRange: [number, number]
    airlines: string[]
    airports: string[]
  }
  suggestions?: {
    alternativeDates: string[]
    alternativeAirports: {
      from: Airport[]
      to: Airport[]
    }
  }
}