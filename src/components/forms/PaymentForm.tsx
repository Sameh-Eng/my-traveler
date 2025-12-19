'use client'

import React, { useState, useEffect } from 'react'
import {
  CreditCard,
  Shield,
  Lock,
  CheckCircle,
  AlertCircle,
  Clock,
  Truck,
  Calendar,
  Info,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Loading'
import { formatCurrency, getCardType, formatCardNumber, formatExpiryDate, validateCreditCard } from '@/lib/utils'
import { paymentInfoSchema, PaymentFormData } from '@/lib/schemas'

interface PaymentFormProps {
  amount: number
  currency?: string
  bookingId: string
  onSubmit: (paymentData: PaymentFormData) => Promise<void>
  loading?: boolean
  error?: string | null
  className?: string
}

interface SavedPaymentMethod {
  id: string
  type: 'card' | 'paypal' | 'apple_pay'
  last4: string
  expiryMonth: string
  expiryYear: string
  brand: string
  isDefault: boolean
}

interface BillingAddress {
  street: string
  apartment?: string
  city: string
  state: string
  zipCode: string
  country: string
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency = 'EGP',
  bookingId,
  onSubmit,
  loading = false,
  error = null,
  className = ''
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple_pay' | 'google_pay'>('card')
  const [useSavedMethod, setUseSavedMethod] = useState(false)
  const [selectedSavedMethod, setSelectedSavedMethod] = useState<string>('')
  const [savedMethods, setSavedMethods] = useState<SavedPaymentMethod[]>([])
  const [showDetails, setShowDetails] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(false)

  // Card state
  const [cardData, setCardData] = useState({
    holderName: '',
    number: '',
    expirationMonth: '',
    expirationYear: '',
    cvv: ''
  })

  // Billing address state
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  })

  // Additional options
  const [saveCard, setSaveCard] = useState(false)
  const [cardNickname, setCardNickname] = useState('')
  const [billingEmail, setBillingEmail] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  // Mock saved payment methods
  useEffect(() => {
    setSavedMethods([
      {
        id: 'pm_1',
        type: 'card',
        last4: '4242',
        expiryMonth: '12',
        expiryYear: '2025',
        brand: 'Visa',
        isDefault: true
      },
      {
        id: 'pm_2',
        type: 'card',
        last4: '5555',
        expiryMonth: '09',
        expiryYear: '2024',
        brand: 'Mastercard',
        isDefault: false
      }
    ])
  }, [])

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value)
    setCardData(prev => ({ ...prev, number: formatted }))
  }

  const handleExpiryMonthChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 2)
    setCardData(prev => ({ ...prev, expirationMonth: cleaned }))
  }

  const handleExpiryYearChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4)
    setCardData(prev => ({ ...prev, expirationYear: cleaned }))
  }

  const handleCVVChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4)
    setCardData(prev => ({ ...prev, cvv: cleaned }))
  }

  const validateCardForm = (): boolean => {
    if (useSavedMethod && selectedSavedMethod) {
      return acceptTerms
    }

    // For Paymob (card), just need to accept terms - card details entered on Paymob's secure page
    if (paymentMethod === 'card') {
      return acceptTerms
    }

    // For international card (paypal), require billing address
    if (paymentMethod === 'paypal') {
      return !!(
        billingAddress.street &&
        billingAddress.city &&
        billingAddress.state &&
        billingAddress.zipCode &&
        billingAddress.country &&
        acceptTerms
      )
    }

    return acceptTerms
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateCardForm()) {
      return
    }

    try {
      setProcessingPayment(true)

      let paymentData: PaymentFormData

      if (useSavedMethod && selectedSavedMethod) {
        paymentData = {
          paymentMethod: 'credit_card',
          billingEmail: billingEmail || undefined,
          savePaymentMethod: false
        }
      } else if (paymentMethod === 'card') {
        paymentData = {
          paymentMethod: 'credit_card',
          card: {
            holderName: cardData.holderName,
            number: cardData.number.replace(/\s/g, ''),
            expirationMonth: cardData.expirationMonth,
            expirationYear: cardData.expirationYear,
            cvv: cardData.cvv,
            billingAddress,
            saveCard,
            cardNickname: saveCard ? cardNickname : undefined
          },
          billingEmail: billingEmail || undefined,
          savePaymentMethod: saveCard
        }
      } else {
        paymentData = {
          paymentMethod,
          billingEmail: billingEmail || undefined,
          savePaymentMethod: false
        }
      }

      await onSubmit(paymentData)
    } catch (error) {
      console.error('Payment error:', error)
    } finally {
      setProcessingPayment(false)
    }
  }

  const getCardDisplay = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'visa':
        return 'Visa'
      case 'mastercard':
        return 'Mastercard'
      case 'amex':
        return 'American Express'
      case 'discover':
        return 'Discover'
      default:
        return type
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i)
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Payment Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Secure Payment</span>
          </CardTitle>
          <CardDescription>
            Complete your booking with our secure payment system. Your payment information is protected with industry-standard encryption.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Booking Reference</span>
              <span className="font-medium">{bookingId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Amount Due</span>
              <span className="font-semibold text-lg text-primary">
                {formatCurrency(amount, currency)}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Prices include all taxes and fees</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved Payment Methods */}
      {savedMethods.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Saved Payment Methods</CardTitle>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={useSavedMethod}
                  onCheckedChange={(checked) => setUseSavedMethod(checked === true)}
                />
                <Label>Use saved method</Label>
              </div>
            </div>
          </CardHeader>
          {useSavedMethod && (
            <CardContent>
              <div className="space-y-3">
                {savedMethods.map((method) => (
                  <Card
                    key={method.id}
                    className={`cursor-pointer border-2 transition-colors ${selectedSavedMethod === method.id
                      ? 'border-primary bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                    onClick={() => setSelectedSavedMethod(method.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-5 w-5 text-gray-600" />
                          <div>
                            <div className="font-medium">
                              {getCardDisplay(method.brand)} •••• {method.last4}
                            </div>
                            <div className="text-sm text-gray-600">
                              Expires {method.expiryMonth}/{method.expiryYear}
                            </div>
                          </div>
                        </div>
                        {method.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {!useSavedMethod && (
        <>
          {/* Payment Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Paymob - Recommended for Egypt */}
                <Button
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('card')}
                  className="h-auto p-6 flex flex-col items-center space-y-2 relative"
                >
                  <Badge className="absolute top-2 right-2 bg-green-500">Recommended</Badge>
                  <CreditCard className="h-8 w-8" />
                  <span className="font-semibold">Paymob</span>
                  <span className="text-xs opacity-80">Card Payment (Egypt)</span>
                </Button>

                {/* Alternative Card Payment */}
                <Button
                  variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('paypal')}
                  className="h-auto p-6 flex flex-col items-center space-y-2"
                >
                  <Globe className="h-8 w-8" />
                  <span className="font-semibold">International Card</span>
                  <span className="text-xs opacity-80">Visa / Mastercard</span>
                </Button>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 text-blue-800">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">Payments secured by Paymob Egypt</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paymob Payment - Direct Gateway */}
          {paymentMethod === 'card' && (
            <Card className="border-primary bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <CreditCard className="h-10 w-10 text-primary" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Paymob Payment</h3>
                    <p className="text-gray-600">
                      Click the button below to securely enter your card details on Paymob's secure payment page
                    </p>
                  </div>

                  <div className="bg-white border rounded-lg p-4 max-w-sm mx-auto">
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Lock className="h-4 w-4 text-green-600" />
                        <span>256-bit SSL</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span>PCI Compliant</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">Accepted Cards:</p>
                    <div className="flex justify-center space-x-4">
                      <div className="px-3 py-1 bg-white border rounded text-sm font-medium">Visa</div>
                      <div className="px-3 py-1 bg-white border rounded text-sm font-medium">Mastercard</div>
                      <div className="px-3 py-1 bg-white border rounded text-sm font-medium">Meeza</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing Address - Only for International Card */}
          {paymentMethod === 'paypal' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Billing Address</CardTitle>
                <CardDescription>
                  Enter the billing address associated with your payment method.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      type="text"
                      placeholder="123 Main St"
                      value={billingAddress.street}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, street: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="apartment">Apartment, suite, etc. (Optional)</Label>
                    <Input
                      id="apartment"
                      type="text"
                      placeholder="Apt 4B"
                      value={billingAddress.apartment}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, apartment: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="New York"
                      value={billingAddress.city}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      type="text"
                      placeholder="NY"
                      value={billingAddress.state}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="zip">ZIP/Postal Code</Label>
                    <Input
                      id="zip"
                      type="text"
                      placeholder="10001"
                      value={billingAddress.zipCode}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={billingAddress.country}
                    onValueChange={(value) => setBillingAddress(prev => ({ ...prev, country: value }))}
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="JP">Japan</option>
                    <option value="CN">China</option>
                    <option value="IN">India</option>
                    <option value="BR">Brazil</option>
                    <option value="MX">Mexico</option>
                  </Select>
                </div>

                {/* Billing Email */}
                <div>
                  <Label htmlFor="billing-email">Billing Email (Optional)</Label>
                  <Input
                    id="billing-email"
                    type="email"
                    placeholder="john@example.com"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alternative Payment Methods */}
          {paymentMethod !== 'card' && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  {paymentMethod === 'paypal' && <Globe className="h-12 w-12 text-blue-600" />}
                  {paymentMethod === 'apple_pay' && <AppleIcon className="h-12 w-12" />}
                  {paymentMethod === 'google_pay' && <GoogleIcon className="h-12 w-12" />}

                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {paymentMethod === 'paypal' && 'Pay with PayPal'}
                      {paymentMethod === 'apple_pay' && 'Pay with Apple Pay'}
                      {paymentMethod === 'google_pay' && 'Pay with Google Pay'}
                    </h3>
                    <p className="text-gray-600">
                      You will be redirected to {paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} to complete your payment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Security Information */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-green-900 mb-2">Secure Payment Guarantee</h4>
              <ul className="space-y-1 text-sm text-green-800">
                <li className="flex items-center">
                  <Lock className="h-3 w-3 mr-2" />
                  256-bit SSL encryption for all transactions
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-2" />
                  PCI DSS compliant payment processing
                </li>
                <li className="flex items-center">
                  <Shield className="h-3 w-3 mr-2" />
                  Fraud detection and prevention systems
                </li>
                <li className="flex items-center">
                  <Info className="h-3 w-3 mr-2" />
                  Your payment information is never stored on our servers
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
              />
              <Label className="text-sm">
                I agree to the <a href="/terms" className="text-primary hover:underline">Terms and Conditions</a> and{' '}
                <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>. I understand that this payment is non-refundable according to the fare rules.
              </Label>
            </div>

            {!acceptTerms && (
              <div className="flex items-center space-x-2 text-amber-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>You must accept the terms and conditions to proceed</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Lock className="h-4 w-4" />
            <span>Secure payment powered by Stripe</span>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!validateCardForm() || loading || processingPayment}
          loading={loading || processingPayment}
          className="flex items-center space-x-2"
        >
          <Lock className="h-4 w-4" />
          <span>Pay {formatCurrency(amount, currency)}</span>
        </Button>
      </div>
    </div>
  )
}

// Icon components for alternative payment methods
const AppleIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
)

const GoogleIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

export default PaymentForm