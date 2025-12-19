import { Address } from './user'

export interface PaymentInfo {
  id: string
  method: PaymentMethod
  amount: number
  currency: string
  status: PaymentStatus
  transactionId?: string
  authorizationCode?: string
  processor: 'stripe' | 'paypal' | 'apple-pay' | 'google-pay' | 'bank-transfer'
  fees: PaymentFees
  installments?: InstallmentPlan
  billingAddress?: Address
  metadata: PaymentMetadata
  createdAt: string // ISO datetime
  processedAt?: string // ISO datetime
  confirmedAt?: string // ISO datetime
  failedAt?: string // ISO datetime
  refundedAt?: string // ISO datetime
  refunds: PaymentRefund[]
}

export type PaymentMethod =
  | 'card'
  | 'apple-pay'
  | 'google-pay'
  | 'paypal'
  | 'bank-transfer'
  | 'crypto'
  | 'buy-now-pay-later'

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'requires-action'
  | 'requires-capture'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'partially-refunded'
  | 'refunded'
  | 'disputed'

export interface PaymentFees {
  processing: number
  currency: number
  service: number
  taxes: number
  total: number
}

export interface InstallmentPlan {
  id: string
  provider: 'affirm' | 'klarna' | 'afterpay' | 'zip'
  totalAmount: number
  installmentAmount: number
  duration: number // months
  interestRate: number
  apr: number
  firstPaymentDue: string // ISO date
  schedule: InstallmentPayment[]
}

export interface InstallmentPayment {
  dueDate: string // ISO date
  amount: number
  status: 'pending' | 'paid' | 'failed'
  paidAt?: string // ISO datetime
}

export interface PaymentMetadata {
  bookingId: string
  userId: string
  userAgent?: string
  ip: string
  device: string
  location?: {
    country: string
    city: string
    timezone: string
  }
  riskScore?: number
  verificationRequired: boolean
  verificationLevel: 'none' | 'basic' | 'enhanced'
  threeDSecure: {
    required: boolean
    completed: boolean
    version?: string
    authenticationId?: string
  }
  fraudDetection: {
    riskScore: number
    riskLevel: 'low' | 'medium' | 'high'
    flagged: boolean
    reasons: string[]
  }
}

export interface PaymentCard {
  brand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'jcb' | 'unionpay' | 'diners' | 'maestro'
  number: string // masked, e.g., "**** **** **** 1234"
  last4: string
  expiry: string // MM/YY
  holderName: string
  cvv?: string // only for forms, never stored
  funding: 'credit' | 'debit' | 'prepaid'
  country: string
  fingerprint: string
  token?: string // for secure storage
  isExpired: boolean
  isValid: boolean
}

export interface PaymentProcessing {
  gateway: 'stripe' | 'paypal' | 'adyen' | 'braintree'
  merchantAccount: string
  intentId: string
  clientSecret?: string
  publicKey?: string
  webhookSecret?: string
  environment: 'test' | 'live'
}

export interface PaymentRequest {
  method: PaymentMethod
  amount: number
  currency: string
  description?: string
  card?: PaymentCard
  billingAddress?: Address
  shippingAddress?: Address
  saveCard: boolean
  installmentPlan?: boolean
  rememberMe: boolean
  returnUrl?: string
  cancelUrl?: string
  metadata?: Record<string, any>
}

export interface PaymentResponse {
  success: boolean
  paymentId: string
  status: PaymentStatus
  clientSecret?: string
  redirectUrl?: string
  verificationRequired: boolean
  nextAction?: PaymentNextAction
  error?: PaymentError
  processingTime?: number // milliseconds
}

export interface PaymentNextAction {
  type: 'redirect_to_url' | 'verify_with_microdeposits' | 'use_stripe_sdk' | 'verify_with_sms_code'
  redirectToUrl?: {
    url: string
    returnUrl: string
  }
  useStripeSdk?: {
    type: 'three_d_secure_redirect' | 'three_d_secure_popup'
    merchantDomain?: string
  }
  verifyWithMicrodeposits?: {
    amounts: number[]
    arrivalDate: string // ISO date
  }
  verifyWithSmsCode?: {
    phoneNumber: string
    attempts: number
  }
}

export interface PaymentError {
  code: string
  type: 'card_error' | 'validation_error' | 'api_error' | 'authentication_error' | 'rate_limit_error'
  message: string
  param?: string
  declineCode?: string
  paymentIntent?: {
    id: string
    status: PaymentStatus
  }
}

export interface PaymentRefund {
  id: string
  paymentId: string
  amount: number
  reason?: string
  status: 'pending' | 'succeeded' | 'failed' | 'canceled'
  requestId: string
  metadata?: Record<string, any>
  createdAt: string // ISO datetime
  processedAt?: string // ISO datetime
  receiptUrl?: string
}

export interface PaymentState {
  current: PaymentInfo | null
  processing: boolean
  error: string | null
  method: PaymentMethod | null
  card: PaymentCard | null
  billingAddress: Address | null
  savedCards: PaymentCard[]
  isThreeDSecureRequired: boolean
  threeDSecureResult?: ThreeDSecureResult
  verificationRequired: boolean
  verificationMethod: 'sms' | 'email' | 'app'
}

export interface ThreeDSecureResult {
  authenticated: boolean
  liabilityShift: boolean
  version: string
  enrollmentStatus: 'Y' | 'N' | 'U' | 'B'
  authenticationStatus: 'Y' | 'N' | 'A' | 'U' | 'C' | 'R'
  challengeRequired: boolean
  challengeCompleted: boolean
}

export interface PaymentMethodOption {
  id: string
  type: PaymentMethod
  name: string
  description: string
  icon: string
  enabled: boolean
  fees?: {
    fixed: number
    percentage: number
  }
  maxAmount?: number
  minAmount?: number
  currencies: string[]
  countries: string[]
  requirements?: string[]
  features: string[]
}

export interface BuyNowPayLaterOption {
  provider: 'affirm' | 'klarna' | 'afterpay' | 'zip'
  name: string
  description: string
  logo: string
  minAmount: number
  maxAmount: number
  installmentPeriods: number[]
  apr: number
  lateFees: string
  eligibility: {
    minAge: number
    residency: string[]
    creditCheck: boolean
  }
}

export interface PaymentAnalytics {
  totalRevenue: number
  transactionCount: number
  averageOrderValue: number
  conversionRate: number
  paymentMethodBreakdown: Record<PaymentMethod, {
    count: number
    amount: number
    percentage: number
  }>
  failedTransactions: number
  refundRate: number
  chargebackRate: number
  fraudDetection: {
    blockedTransactions: number
    falsePositives: number
    totalLoss: number
  }
  processingTimes: {
    average: number
    median: number
    p95: number
    p99: number
  }
}