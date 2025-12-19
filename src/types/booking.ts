import { Seat, Flight } from './flight'
import { PaymentInfo } from './payment'

export interface Passenger {
  id: string
  firstName: string
  middleName?: string
  lastName: string
  dateOfBirth: string // ISO date
  gender: 'M' | 'F' | 'X'
  passport: {
    number: string
    expiry: string // ISO date
    country: string
    issuanceDate?: string // ISO date
  }
  contact: {
    email: string
    phone: string
    address?: Address
  }
  frequentFlyer: Array<{
    airline: string
    number: string
    tier?: string
  }>
  specialAssistance: string[]
  dietaryRestrictions?: string[]
  seatPreference?: string
  mealPreference?: string
}

export interface Address {
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode: string
  country: string
}

export interface SeatAssignment {
  id: string
  flightId: string
  legId?: string // For multi-leg flights
  passengerId: string
  seat: Seat
  price: number
  features: string[]
}

export interface FlightSegment {
  flightId: string
  flight: Flight
  passengers: string[] // Passenger IDs
  seats: SeatAssignment[]
  date: string // ISO date
}

export interface BookingExtras {
  baggage: BaggageAllowance[]
  meals: MealSelection[]
  insurance: TravelInsurance
  priorityBoarding: boolean
  extraLegroom: boolean
  wifiAccess: boolean
  loungeAccess: boolean
  seatSelection: boolean
}

export interface BaggageAllowance {
  passengerId: string
  type: 'carry-on' | 'checked' | 'overweight'
  weight: number // kg
  dimensions?: {
    length: number // cm
    width: number // cm
    height: number // cm
  }
  price: number
}

export interface MealSelection {
  passengerId: string
  type: 'standard' | 'vegetarian' | 'vegan' | 'gluten-free' | 'kosher' | 'halal' | 'child' | 'diabetic'
  meal: string
  price: number
  flightLegId?: string
}

export interface TravelInsurance {
  enabled: boolean
  provider?: string
  coverage: {
    tripCancellation: boolean
    tripInterruption: boolean
    medicalEmergency: boolean
    baggageLoss: boolean
    tripDelay: boolean
  }
  premium: number
  coverageAmount: number
}

export interface Booking {
  id: string
  confirmationCode: string
  pnr: string // Passenger Name Record
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'modified'
  bookingDate: string // ISO datetime
  lastModified: string // ISO datetime

  // Flight information
  segments: FlightSegment[]
  tripType: 'one-way' | 'round-trip' | 'multi-city'
  totalDuration: number // minutes

  // Passenger information
  passengers: Passenger[]
  primaryContact: {
    name: string
    email: string
    phone: string
  }

  // Pricing
  basePrice: number
  taxes: number
  fees: number
  insurance: number
  totalAmount: number
  currency: string

  // Payment
  payment: PaymentInfo

  // Status and timeline
  timeline: BookingTimeline[]
  checkInAvailable: boolean
  boardingPassesReady: boolean
  seatSelectionRequired: boolean

  // Additional services
  extras: BookingExtras

  // Metadata
  userAgent?: string
  ip?: string
  referralCode?: string
  promoCode?: string
}

export interface BookingTimeline {
  step: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  timestamp: string // ISO datetime
  details?: string
  agent?: string // Who performed the action
}

export interface BookingConfirmation {
  bookingId: string
  confirmationCode: string
  pnr: string
  status: 'confirmed' | 'pending' | 'failed'
  flights: Flight[]
  passengers: Passenger[]
  totalAmount: number
  currency: string
  payment: {
    status: string
    transactionId: string
    timestamp: string
    method: string
  }
  timeline: BookingTimeline[]
  nextSteps: string[]
  importantInfo: string[]
}

export interface BookingModification {
  id: string
  bookingId: string
  type: 'change-flight' | 'add-baggage' | 'seat-change' | 'meal-change' | 'cancel'
  status: 'pending' | 'confirmed' | 'rejected'
  requestDate: string // ISO datetime
  processedDate?: string // ISO datetime
  changes: any
  fee: number
  reason?: string
}

export interface BookingState {
  selectedFlights: Flight[]
  passengers: Partial<Passenger>[]
  seats: SeatAssignment[]
  extras: Partial<BookingExtras>
  payment: Partial<PaymentInfo>
  currentStep: number
  completedSteps: number[]
  validationErrors: Record<string, string[]>
  isDraft: boolean
  draftId?: string
  lastSaved?: string // ISO datetime
}

export type BookingStep =
  | 'flights'
  | 'passengers'
  | 'seats'
  | 'extras'
  | 'payment'
  | 'review'
  | 'confirmation'