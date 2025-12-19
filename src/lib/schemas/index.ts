import { z } from 'zod'

// Common validation schemas
const emailSchema = z.string().email('Please enter a valid email address')

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

const phoneSchema = z
  .string()
  .regex(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, 'Please enter a valid phone number')

const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters long')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date in YYYY-MM-DD format')

const iataCodeSchema = z
  .string()
  .length(3, 'Airport code must be exactly 3 characters')
  .regex(/^[A-Z]{3}$/, 'Airport code must be 3 uppercase letters')

// Flight Search Schemas
export const flightSearchSchema = z.object({
  tripType: z.enum(['roundtrip', 'oneway', 'multicity'], {
    required_error: 'Please select a trip type'
  }),
  from: iataCodeSchema,
  to: iataCodeSchema,
  departDate: dateSchema.refine(
    (date) => {
      const departDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return departDate >= today
    },
    'Departure date must be today or in the future'
  ),
  returnDate: dateSchema.optional().refine(
    (date) => {
      if (!date) return true
      const returnDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return returnDate >= today
    },
    'Return date must be today or in the future'
  ),
  passengers: z.object({
    adults: z.number().min(1, 'At least 1 adult is required').max(9, 'Maximum 9 adults allowed'),
    children: z.number().min(0, 'Children cannot be negative').max(8, 'Maximum 8 children allowed'),
    infants: z.number().min(0, 'Infants cannot be negative').max(4, 'Maximum 4 infants allowed')
  }),
  cabinClass: z.enum(['economy', 'premium_economy', 'business', 'first'], {
    required_error: 'Please select a cabin class'
  }),
  flexibleDates: z.boolean().default(false),
  directFlightsOnly: z.boolean().default(false),
  multicityLegs: z.array(
    z.object({
      from: iataCodeSchema,
      to: iataCodeSchema,
      departDate: dateSchema
    })
  ).optional()
}).refine(
  (data) => {
    if (data.tripType === 'roundtrip') {
      return data.returnDate !== undefined
    }
    if (data.tripType === 'multicity') {
      return data.multicityLegs && data.multicityLegs.length >= 2
    }
    return true
  },
  (data) => ({
    message: data.tripType === 'roundtrip'
      ? 'Return date is required for roundtrip flights'
      : 'At least 2 legs are required for multicity flights',
    path: data.tripType === 'roundtrip' ? ['returnDate'] : ['multicityLegs']
  })
).refine(
  (data) => {
    if (data.tripType === 'roundtrip' && data.returnDate) {
      const departDate = new Date(data.departDate)
      const returnDate = new Date(data.returnDate)
      return returnDate >= departDate
    }
    return true
  },
  'Return date must be after departure date'
)

// Passenger Information Schemas
export const passengerBasicInfoSchema = z.object({
  firstName: nameSchema,
  middleName: z.string().optional(),
  lastName: nameSchema,
  birthDate: dateSchema.refine(
    (date) => {
      const birthDate = new Date(date)
      const today = new Date()
      const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate())
      const maxDate = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate())
      return birthDate >= minDate && birthDate <= maxDate
    },
    'Please enter a valid birth date'
  ),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Please select a gender'
  }),
  email: emailSchema,
  phone: phoneSchema,
  nationality: z.string().min(1, 'Please select a nationality'),
  knownTravelerNumber: z.string().optional(),
  redressNumber: z.string().optional()
})

export const passengerDocumentSchema = z.object({
  documentType: z.enum(['passport', 'national_id', 'driver_license', 'military_id'], {
    required_error: 'Please select a document type'
  }),
  documentNumber: z.string().min(1, 'Document number is required'),
  issuingCountry: z.string().min(2, 'Please select issuing country'),
  expirationDate: dateSchema.refine(
    (date) => {
      const expirationDate = new Date(date)
      const today = new Date()
      const sixMonthsFromNow = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate())
      return expirationDate >= sixMonthsFromNow
    },
    'Document must be valid for at least 6 months from travel date'
  ),
  issueDate: dateSchema.refine(
    (date) => {
      const issueDate = new Date(date)
      const today = new Date()
      return issueDate <= today
    },
    'Issue date cannot be in the future'
  )
})

export const passengerSpecialNeedsSchema = z.object({
  requiresWheelchair: z.boolean().default(false),
  wheelchairType: z.enum(['none', 'manual', 'electric', 'aisle_chair', 'unknown']).default('none'),
  requiresSpecialAssistance: z.boolean().default(false),
  assistanceType: z.array(z.string()).default([]),
  dietaryRestrictions: z.array(z.string()).default([]),
  medicalEquipment: z.array(z.string()).default([]),
  specialRequests: z.string().optional()
})

export const passengerSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['adult', 'child', 'infant'], {
    required_error: 'Please select passenger type'
  }),
  basicInfo: passengerBasicInfoSchema,
  documents: passengerDocumentSchema,
  specialNeeds: passengerSpecialNeedsSchema,
  frequentFlyer: z.object({
    airline: z.string().optional(),
    number: z.string().optional()
  }).optional(),
  seatPreference: z.object({
    type: z.enum(['window', 'aisle', 'middle', 'no_preference']).default('no_preference'),
    position: z.enum(['front', 'middle', 'back', 'no_preference']).default('no_preference')
  }).optional()
})

// Booking Contact Schema
export const bookingContactSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    apartment: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State/Province is required'),
    zipCode: z.string().min(1, 'ZIP/Postal code is required'),
    country: z.string().min(1, 'Country is required')
  }),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    phone: phoneSchema
  })
})

// Payment Schema
export const paymentCardSchema = z.object({
  holderName: z.string().min(1, 'Cardholder name is required'),
  number: z.string().regex(/^\d{16,19}$/, 'Please enter a valid card number'),
  expirationMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Please select a valid month'),
  expirationYear: z.string().regex(/^\d{4}$/, 'Please select a valid year'),
  cvv: z.string().regex(/^\d{3,4}$/, 'Please enter a valid CVV'),
  billingAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    apartment: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State/Province is required'),
    zipCode: z.string().min(1, 'ZIP/Postal code is required'),
    country: z.string().min(1, 'Country is required')
  }),
  saveCard: z.boolean().default(false),
  cardNickname: z.string().optional()
})

export const paymentInfoSchema = z.object({
  paymentMethod: z.enum(['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay'], {
    required_error: 'Please select a payment method'
  }),
  card: paymentCardSchema.optional(),
  billingEmail: emailSchema.optional(),
  savePaymentMethod: z.boolean().default(false)
}).refine(
  (data) => {
    if (data.paymentMethod === 'credit_card' || data.paymentMethod === 'debit_card') {
      return data.card !== undefined
    }
    return true
  },
  {
    message: 'Card information is required for credit/debit card payments',
    path: ['card']
  }
).refine(
  (data) => {
    if ((data.paymentMethod === 'credit_card' || data.paymentMethod === 'debit_card') && data.card) {
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth() + 1
      const expYear = parseInt(data.card.expirationYear)
      const expMonth = parseInt(data.card.expirationMonth)

      return expYear > currentYear || (expYear === currentYear && expMonth >= currentMonth)
    }
    return true
  },
  {
    message: 'Card expiration date must be in the future',
    path: ['card']
  }
)

// User Authentication Schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false)
})

export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  phone: phoneSchema.optional(),
  dateOfBirth: dateSchema.refine(
    (date) => {
      const birthDate = new Date(date)
      const today = new Date()
      const minAge = 18
      const maxAge = 120
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= minAge && age <= maxAge
    },
    'You must be between 18 and 120 years old to register'
  ),
  nationality: z.string().min(1, 'Please select your nationality'),
  acceptTerms: z.boolean().refine(
    (val) => val === true,
    'You must accept the terms and conditions'
  ),
  acceptMarketing: z.boolean().default(false)
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  }
)

export const forgotPasswordSchema = z.object({
  email: emailSchema
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  }
)

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your new password')
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'New passwords do not match',
    path: ['confirmPassword']
  }
)

// User Profile Update Schema
export const profileUpdateSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: phoneSchema.optional(),
  dateOfBirth: dateSchema.optional(),
  nationality: z.string().optional(),
  preferences: z.object({
    language: z.string().optional(),
    currency: z.string().optional(),
    seatPreference: z.enum(['window', 'aisle', 'middle', 'no_preference']).optional(),
    mealPreference: z.string().optional(),
    notificationSettings: z.object({
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
      push: z.boolean().optional(),
      promotional: z.boolean().optional()
    }).optional()
  }).optional()
})

// Review Schema
export const reviewSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  overallRating: z.number().min(1, 'Please provide an overall rating').max(5, 'Rating cannot be more than 5'),
  flightRating: z.number().min(1, 'Please provide a flight rating').max(5, 'Flight rating cannot be more than 5'),
  serviceRating: z.number().min(1, 'Please provide a service rating').max(5, 'Service rating cannot be more than 5'),
  comfortRating: z.number().min(1, 'Please provide a comfort rating').max(5, 'Comfort rating cannot be more than 5'),
  valueRating: z.number().min(1, 'Please provide a value rating').max(5, 'Value rating cannot be more than 5'),
  title: z.string().min(1, 'Review title is required').max(100, 'Title must be less than 100 characters'),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(2000, 'Review must be less than 2000 characters'),
  recommend: z.boolean(),
  wouldFlyAgain: z.boolean()
})

// Newsletter Subscription Schema
export const newsletterSchema = z.object({
  email: emailSchema,
  preferences: z.object({
    flightDeals: z.boolean().default(true),
    travelTips: z.boolean().default(true),
    newRoutes: z.boolean().default(true),
    loyaltyUpdates: z.boolean().default(false)
  }).optional()
})

// Type exports
export type FlightSearchFormData = z.infer<typeof flightSearchSchema>
export type PassengerFormData = z.infer<typeof passengerSchema>
export type BookingContactFormData = z.infer<typeof bookingContactSchema>
export type PaymentFormData = z.infer<typeof paymentInfoSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
export type ReviewFormData = z.infer<typeof reviewSchema>
export type NewsletterFormData = z.infer<typeof newsletterSchema>