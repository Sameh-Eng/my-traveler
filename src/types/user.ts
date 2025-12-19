import { Booking } from './booking'

export interface User {
  id: string
  email: string
  profile: UserProfile
  preferences: UserPreferences
  loyalty: LoyaltyProgram
  paymentMethods: PaymentMethod[]
  addresses: Address[]
  documents: TravelDocuments[]
  createdAt: string // ISO datetime
  lastLogin: string // ISO datetime
  isActive: boolean
  isVerified: boolean
  twoFactorEnabled: boolean
}

export interface UserProfile {
  title: 'Mr' | 'Mrs' | 'Ms' | 'Mx' | 'Dr'
  firstName: string
  middleName?: string
  lastName: string
  dateOfBirth: string // ISO date
  gender: 'M' | 'F' | 'X'
  nationality: string
  passport?: {
    number: string
    expiry: string // ISO date
    country: string
  }
  phone: string
  avatar?: string
  bio?: string
  occupation?: string
  company?: string
}

export interface UserPreferences {
  language: string
  timezone: string
  currency: string
  notifications: NotificationPreferences
  travel: TravelPreferences
  privacy: PrivacyPreferences
  accessibility: AccessibilityPreferences
}

export interface NotificationPreferences {
  email: {
    bookingConfirmations: boolean
    flightReminders: boolean
    gateChanges: boolean
    delays: boolean
    cancellations: boolean
    checkInReminders: boolean
    promotions: boolean
    newsletter: boolean
    priceAlerts: boolean
  }
  sms: {
    bookingConfirmations: boolean
    flightReminders: boolean
    gateChanges: boolean
    delays: boolean
    cancellations: boolean
    checkInReminders: boolean
    promotions: boolean
  }
  push: {
    bookingConfirmations: boolean
    flightReminders: boolean
    gateChanges: boolean
    delays: boolean
    cancellations: boolean
    checkInReminders: boolean
  }
  inApp: {
    bookingUpdates: boolean
    flightStatus: boolean
    recommendations: boolean
    tips: boolean
  }
}

export interface TravelPreferences {
  seatPreference: 'window' | 'aisle' | 'middle' | 'any'
  mealPreference: 'standard' | 'vegetarian' | 'vegan' | 'gluten-free' | 'kosher' | 'halal' | 'child' | 'diabetic'
  cabinClass: 'economy' | 'premium-economy' | 'business' | 'first'
  airlinePreferences: string[]
  airportPreferences: {
    departure: string[]
    arrival: string[]
  }
  tripTypes: ('business' | 'leisure' | 'family')[]
  specialAssistance: string[]
  frequentFlyerPrograms: Array<{
    airline: string
    number: string
    tier: string
  }>
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'friends' | 'private'
  shareTravelHistory: boolean
  allowRecommendations: boolean
  dataSharing: {
    marketing: boolean
    analytics: boolean
    thirdParty: boolean
  }
  cookieConsent: {
    necessary: boolean
    functional: boolean
    analytics: boolean
    marketing: boolean
  }
}

export interface AccessibilityPreferences {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  highContrast: boolean
  reducedMotion: boolean
  screenReader: boolean
  keyboardNavigation: boolean
  voiceControl: boolean
}

export interface LoyaltyProgram {
  tier: 'basic' | 'silver' | 'gold' | 'platinum' | 'diamond'
  points: number
  miles: number
  statusCredits: number
  segmentsFlown: number
  memberSince: string // ISO date
  tierStatus: {
    current: string
    next?: string
    progress: number
    required: number
    expiresAt: string // ISO date
  }
  benefits: string[]
  nextFlightBonus?: {
    bonusType: string
    value: number
    expiresAt: string // ISO date
  }
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'paypal' | 'apple-pay' | 'google-pay' | 'bank-transfer'
  isDefault: boolean
  card?: {
    brand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'jcb' | 'unionpay'
    last4: string
    expiry: string // MM/YY
    holderName: string
    billingAddress: Address
  }
  paypal?: {
    email: string
    accountId: string
  }
  applePay?: {
    deviceId: string
  }
  googlePay?: {
    deviceId: string
  }
  createdAt: string // ISO datetime
  lastUsed?: string // ISO datetime
  isExpired: boolean
}

export interface Address {
  id: string
  type: 'home' | 'work' | 'billing' | 'shipping'
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  isDefault: boolean
}

export interface TravelDocuments {
  passports: Passport[]
  visas: Visa[]
  medicalCertificates: MedicalCertificate[]
  otherDocuments: OtherDocument[]
}

export interface Passport {
  id: string
  number: string
  country: string
  issuingCountry: string
  issueDate: string // ISO date
  expiryDate: string // ISO date
  placeOfIssue: string
  type: 'regular' | 'diplomatic' | 'official'
  isPrimary: boolean
}

export interface Visa {
  id: string
  country: string
  type: 'tourist' | 'business' | 'student' | 'work' | 'transit'
  issueDate: string // ISO date
  expiryDate: string // ISO date
  entries: 'single' | 'multiple' | 'double'
  duration: string
  issuingAuthority: string
  documentNumber: string
}

export interface MedicalCertificate {
  id: string
  type: 'fitness-to-travel' | 'medication' | 'vaccination' | 'disability'
  issueDate: string // ISO date
  expiryDate?: string // ISO date
  issuingDoctor: string
  hospital: string
  conditions: string[]
  medications: string[]
  specialRequirements: string[]
}

export interface OtherDocument {
  id: string
  type: 'drivers-license' | 'national-id' | 'military-id' | 'other'
  number: string
  issuingCountry: string
  issueDate: string // ISO date
  expiryDate?: string // ISO date
  description?: string
}

export interface UserDashboard {
  user: User
  upcomingTrips: Booking[]
  pastTrips: Booking[]
  cancelledTrips: Booking[]
  stats: {
    totalTrips: number
    totalMiles: number
    countriesVisited: number
    favoriteAirline: string
    nextTrip: string
  }
  recommendations: {
    destinations: DestinationRecommendation[]
    flights: FlightRecommendation[]
    hotels: HotelRecommendation[]
  }
  notifications: UserNotification[]
  quickActions: QuickAction[]
}

export interface DestinationRecommendation {
  destination: string
  country: string
  reason: string
  price: number
  imageUrl: string
  season: string
  tags: string[]
}

export interface FlightRecommendation {
  from: string
  to: string
  airline: string
  price: number
  dates: string[]
  reason: string
  tags: string[]
}

export interface HotelRecommendation {
  name: string
  location: string
  rating: number
  price: number
  amenities: string[]
  imageUrl: string
  reason: string
}

export interface UserNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string // ISO datetime
  isRead: boolean
  action?: {
    label: string
    url: string
  }
  category: 'booking' | 'flight' | 'payment' | 'account' | 'promotion' | 'system'
}

export interface QuickAction {
  id: string
  label: string
  icon: string
  url: string
  color: string
  description: string
}