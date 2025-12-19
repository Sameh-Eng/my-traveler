// Export all types for easy imports
export * from './flight'
export * from './booking'
export * from './user'
export type { PaymentInfo, PaymentCard, PaymentStatus, PaymentRefund, PaymentMethod } from './payment'
export type { ApiResponse, ApiError, PaginationInfo, ResponseMetadata, RequestOptions, FlightSearchParams, BookingCreateRequest, AuthLoginRequest, AuthRegisterRequest, AuthResponse, PasswordResetRequest, PasswordResetConfirmation, EmailVerificationRequest, TwoFactorRequest, UserUpdateRequest, BookingListParams, BookingModificationRequest, ReviewSubmission, SupportTicketRequest, NotificationPreference, SearchSuggestion, PriceAlert, WishlistItem } from './api'

// Import types needed for cross-references
import { Flight } from './flight'
import { Passenger } from './booking'
import { PaymentCard } from './payment'

// Fix cross-references that were circular
export interface Seat {
  id: string
  number: string
  type: 'regular' | 'exit-row' | 'window' | 'aisle' | 'bulkhead' | 'extra-legroom'
  available: boolean
  price: number
  features?: string[]
}

export interface Address {
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode: string
  country: string
}