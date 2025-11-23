export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
  pagination?: PaginationInfo
  metadata?: ResponseMetadata
}

export interface ApiError {
  code: string
  type: 'validation' | 'authentication' | 'authorization' | 'not_found' | 'server_error' | 'rate_limit' | 'payment' | 'external_service'
  message: string
  details?: Record<string, any>
  timestamp: string // ISO datetime
  requestId: string
  retryAfter?: number // seconds
  suggestions?: string[]
}

export interface PaginationInfo {
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrevious: boolean
  totalPages: number
  startIndex: number
  endIndex: number
}

export interface ResponseMetadata {
  requestId: string
  timestamp: string // ISO datetime
  version: string
  environment: 'development' | 'staging' | 'production'
  processingTime: number // milliseconds
  cache: {
    hit: boolean
    key?: string
    ttl?: number
  }
  rateLimit?: {
    limit: number
    remaining: number
    reset: number // timestamp
  }
}

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  params?: Record<string, string>
  timeout?: number
  retries?: number
  cache?: boolean
  signal?: AbortSignal
}

export interface FlightSearchParams {
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
  sortBy?: SortOption
  page?: number
  limit?: number
}

export interface TimeRange {
  label: string
  start: string // HH:MM
  end: string // HH:MM
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

export interface BookingCreateRequest {
  flights: string[] // Flight IDs from search
  passengers: Array<{
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: 'M' | 'F' | 'X'
    passport: {
      number: string
      expiry: string
      country: string
    }
    contact: {
      email: string
      phone: string
    }
  }>
  seats: Array<{
    flightId: string
    passengerId: string
    seatNumber: string
  }>
  extras: {
    baggage: Array<{
      passengerId: string
      weight: number
      price: number
    }>
    meals: Array<{
      passengerId: string
      type: string
      price: number
    }>
    insurance: boolean
  }
  payment: {
    method: string
    token: string
    saveCard: boolean
  }
}

export interface AuthLoginRequest {
  email: string
  password: string
  rememberMe?: boolean
  deviceFingerprint?: string
}

export interface AuthRegisterRequest {
  title: 'Mr' | 'Mrs' | 'Ms' | 'Mx' | 'Dr'
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
  dateOfBirth?: string
  marketingOptIn?: boolean
  termsAccepted: boolean
  privacyAccepted: boolean
  deviceFingerprint?: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    profile: {
      firstName: string
      lastName: string
      avatar?: string
    }
    isVerified: boolean
    twoFactorEnabled: boolean
  }
  tokens: {
    accessToken: string
    refreshToken: string
    expiresIn: number // seconds
    tokenType: 'Bearer'
  }
  session: {
    id: string
    expiresAt: string // ISO datetime
    device: string
    location?: {
      country: string
      city: string
    }
  }
}

export interface PasswordResetRequest {
  email: string
  resetToken?: string
}

export interface PasswordResetConfirmation {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface EmailVerificationRequest {
  token: string
}

export interface TwoFactorRequest {
  userId: string
  code: string
  backupCode?: string
}

export interface UserUpdateRequest {
  profile?: {
    title?: 'Mr' | 'Mrs' | 'Ms' | 'Mx' | 'Dr'
    firstName?: string
    lastName?: string
    dateOfBirth?: string
    phone?: string
    avatar?: string
  }
  preferences?: {
    language?: string
    timezone?: string
    currency?: string
    notifications?: any
    travel?: any
  }
  addresses?: any[]
  paymentMethods?: any[]
}

export interface BookingListParams {
  status?: ('pending' | 'confirmed' | 'cancelled' | 'completed' | 'modified')[]
  startDate?: string // ISO date
  endDate?: string // ISO date
  page?: number
  limit?: number
  sortBy?: 'bookingDate' | 'departureDate' | 'totalAmount'
  sortOrder?: 'asc' | 'desc'
}

export interface BookingModificationRequest {
  type: 'change-flight' | 'add-baggage' | 'seat-change' | 'meal-change' | 'cancel'
  details: any
  reason?: string
}

export interface ReviewSubmission {
  bookingId: string
  flightId: string
  rating: {
    overall: number // 1-5
    punctuality: number // 1-5
    comfort: number // 1-5
    service: number // 1-5
    value: number // 1-5
  }
  review: {
    title: string
    content: string
    pros: string[]
    cons: string[]
  }
  wouldRecommend: boolean
  tags: string[]
  images?: string[]
}

export interface SupportTicketRequest {
  category: 'booking' | 'payment' | 'technical' | 'general'
  subject: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  bookingId?: string
  attachments?: string[]
}

export interface NotificationPreference {
  type: 'email' | 'sms' | 'push' | 'in_app'
  category: 'booking' | 'flight' | 'payment' | 'account' | 'promotion'
  enabled: boolean
  frequency?: 'immediate' | 'daily' | 'weekly' | 'never'
}

export interface SearchSuggestion {
  type: 'airport' | 'city' | 'country'
  code: string
  name: string
  fullName: string
  country: string
  timezone: string
  popularity?: number
  recentSearch?: boolean
}

export interface PriceAlert {
  id: string
  route: {
    from: string
    to: string
  }
  dates: {
    departure?: string
    return?: string
    flexible?: boolean
  }
  targetPrice: number
  currentPrice?: number
  passengers: number
  cabinClass: string
  active: boolean
  createdAt: string // ISO datetime
  triggeredAt?: string // ISO datetime
}

export interface WishlistItem {
  id: string
  flight: any // Flight type
  notes?: string
  priceAlert: boolean
  targetPrice?: number
  createdAt: string // ISO datetime
  expiresAt?: string // ISO datetime
}