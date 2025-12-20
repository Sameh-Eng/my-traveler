'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Shield,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Plane,
  Users,
  Calendar,
  Clock,
  Info,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Loading'
import PaymentForm from '@/components/forms/PaymentForm'
import { useBookingStore, useFlightStore, useAuthStore } from '@/store'
import { formatCurrency, formatDate, formatTime, formatDuration, generateBookingReference } from '@/lib/utils'
import { PaymentFormData } from '@/lib/schemas'

const PaymentPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const { selectedFlights, passengers, currentStep, nextStep, previousStep, clearBooking } = useBookingStore()
  const { searchResults } = useFlightStore()

  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const [paymentTimeLeft, setPaymentTimeLeft] = useState(900) // 15 minutes in seconds
  const [paymobIframeUrl, setPaymobIframeUrl] = useState<string | null>(null)
  const [showPaymobModal, setShowPaymobModal] = useState(false)

  const bookingId = searchParams.get('bookingId') || generateBookingReference()

  useEffect(() => {
    // Load booking details from URL params or booking store
    const loadBookingDetails = () => {
      try {
        // Calculate actual pricing from selected flights and passengers
        const flightsToUse = selectedFlights.length > 0 ? selectedFlights : [getMockFlight()]
        const passengersToUse = passengers.length > 0 ? passengers : [getMockPassenger()]

        // Calculate total price based on flights and passengers
        let basePrice = 0
        flightsToUse.forEach((flight: any) => {
          const flightPrice = flight.price?.total || flight.price?.base || 0
          basePrice += flightPrice * passengersToUse.length
        })

        // If no price from flights, use a default calculation
        if (basePrice === 0) {
          basePrice = 1500 * passengersToUse.length // Default base price per passenger
        }

        const taxes = Math.round(basePrice * 0.15) // 15% taxes
        const fees = 150 // Fixed service fee
        const totalAmount = basePrice + taxes + fees

        const calculatedBookingDetails = {
          id: bookingId,
          flights: flightsToUse,
          passengers: passengersToUse,
          status: 'pending_payment',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
          pricing: {
            basePrice,
            taxes,
            fees,
            insurance: 0,
            extras: 0,
            totalAmount
          }
        }

        setBookingDetails(calculatedBookingDetails)
        setLoading(false)
      } catch (err) {
        setError('Failed to load booking details')
        setLoading(false)
      }
    }

    loadBookingDetails()
  }, [bookingId, selectedFlights, passengers])

  useEffect(() => {
    // Countdown timer for payment
    if (paymentTimeLeft <= 0) {
      handleBookingExpired()
      return
    }

    const timer = setInterval(() => {
      setPaymentTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [paymentTimeLeft])



  const getMockFlight = () => ({
    id: 'FL-1234',
    airline: { name: 'SkyWings', code: 'SW', logo: '/api/placeholder/40/40' },
    flightNumber: 'SW1234',
    legs: [{
      from: { code: 'JFK', name: 'New York JFK', city: 'New York', country: 'USA' },
      to: { code: 'LAX', name: 'Los Angeles LAX', city: 'Los Angeles', country: 'USA' },
      departure: '2024-03-15T10:00:00Z',
      arrival: '2024-03-15T13:30:00Z',
      duration: 330
    }],
    price: { base: 1299, taxes: 189, fees: 45, total: 1533 },
    aircraft: 'Airbus A320',
    cabin: 'economy'
  })

  const getMockPassenger = () => ({
    id: 'p1',
    type: 'adult' as const,
    basicInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    }
  })

  const handleBookingExpired = () => {
    setError('Your booking session has expired. Please start a new booking.')
    setTimeout(() => {
      router.push('/flights')
    }, 5000)
  }

  const formatTimeLeft = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handlePaymentSubmit = async (paymentData: PaymentFormData) => {
    try {
      setProcessingPayment(true)
      setError(null)

      // Get billing data from payment form
      const billingData = {
        firstName: paymentData.card?.holderName?.split(' ')[0] || 'Customer',
        lastName: paymentData.card?.holderName?.split(' ').slice(1).join(' ') || 'User',
        email: paymentData.billingEmail || 'customer@example.com',
        phone: '+201000000000',
        street: paymentData.card?.billingAddress?.street || 'NA',
        city: paymentData.card?.billingAddress?.city || 'Cairo',
        state: paymentData.card?.billingAddress?.state || 'Cairo',
        country: paymentData.card?.billingAddress?.country || 'EG',
        postalCode: paymentData.card?.billingAddress?.zipCode || '00000'
      }

      // Call backend to create Paymob payment intent
      // Use dynamic API URL based on browser location
      const hostname = window.location.hostname
      const protocol = window.location.protocol
      const apiUrl = `${protocol}//${hostname}:8080/api`
      const response = await fetch(`${apiUrl}/payment/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: bookingDetails?.pricing?.totalAmount || 0,
          currency: 'EGP',
          bookingId: bookingId,
          billingData
        })
      })

      const result = await response.json()

      if (result.success && result.data?.iframeUrl) {
        // Open Paymob iframe in new window
        setPaymobIframeUrl(result.data.iframeUrl)
        setShowPaymobModal(true)

        // Also open in new tab as fallback
        window.open(result.data.iframeUrl, '_blank', 'width=500,height=700')
      } else {
        setError(result.error || 'Failed to initialize payment. Please try again.')
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError('An error occurred while processing your payment. Please try again.')
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleCancelBooking = () => {
    if (confirm('Are you sure you want to cancel this booking? Your seats will be released.')) {
      clearBooking()
      router.push('/flights')
    }
  }

  const handleRefreshSession = () => {
    // In a real app, this would extend the booking session
    setPaymentTimeLeft(900)
    setError(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading message="Loading payment details..." />
      </div>
    )
  }

  if (error && paymentTimeLeft <= 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 mb-2">Booking Expired</h2>
            <p className="text-red-700 mb-6">{error}</p>
            <Link href="/flights">
              <Button className="w-full">
                Start New Booking
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-6">We couldn't find the booking details you're looking for.</p>
            <Link href="/flights">
              <Button className="w-full">
                Search Flights
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Secure Payment</h1>
                <p className="text-sm text-gray-600">Complete your booking for {bookingDetails.id}</p>
              </div>
            </div>

            {/* Payment Timer */}
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${paymentTimeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }`}>
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Time left: {formatTimeLeft(paymentTimeLeft)}</span>
              {paymentTimeLeft > 300 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshSession}
                  className="text-amber-700 hover:text-amber-800"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Banner */}
      <div className="bg-green-50 border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-3 text-green-800">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-medium">Secure 256-bit SSL encryption • PCI DSS compliant • Your payment information is protected</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            {error && paymentTimeLeft > 0 && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <PaymentForm
              amount={bookingDetails.pricing.totalAmount}
              currency="EGP"
              bookingId={bookingDetails.id}
              onSubmit={handlePaymentSubmit}
              loading={processingPayment}
              error={error}
            />
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Flight Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plane className="h-5 w-5" />
                    <span>Flight Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {bookingDetails.flights.map((flight: any, index: number) => (
                    <div key={flight.id || index} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <Plane className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{flight.airline.name}</div>
                            <div className="text-sm text-gray-600">{flight.flightNumber}</div>
                          </div>
                        </div>
                        <Badge variant="outline">{flight.cabin}</Badge>
                      </div>

                      {flight.legs.map((leg: any, legIndex: number) => (
                        <div key={legIndex} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <div className="font-medium">{leg.from.code}</div>
                              <div className="text-gray-600">{formatTime(leg.departure)}</div>
                              <div className="text-xs text-gray-500">{formatDate(leg.departure)}</div>
                            </div>
                            <div className="flex-1 px-4">
                              <div className="text-center text-xs text-gray-500 mb-1">
                                {formatDuration(leg.duration)}
                              </div>
                              <div className="h-px bg-gray-300"></div>
                            </div>
                            <div className="text-sm text-right">
                              <div className="font-medium">{leg.to.code}</div>
                              <div className="text-gray-600">{formatTime(leg.arrival)}</div>
                              <div className="text-xs text-gray-500">{formatDate(leg.arrival)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Passenger Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Passengers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {bookingDetails.passengers.map((passenger: any, index: number) => (
                      <div key={passenger.id || index} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {passenger.basicInfo?.firstName || passenger.firstName || 'Passenger'} {passenger.basicInfo?.lastName || passenger.lastName || (index + 1)}
                          </div>
                          <div className="text-sm text-gray-600 capitalize">{passenger.type || 'adult'}</div>
                        </div>
                        <Badge variant="secondary">{passenger.basicInfo?.email || passenger.contact?.email || 'No email'}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Price Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Price Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Base Fare ({bookingDetails.passengers.length} ×)</span>
                    <span>{formatCurrency(bookingDetails.pricing.basePrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxes & Fees</span>
                    <span>{formatCurrency(bookingDetails.pricing.taxes + bookingDetails.pricing.fees)}</span>
                  </div>
                  {bookingDetails.pricing.insurance > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Travel Insurance</span>
                      <span>{formatCurrency(bookingDetails.pricing.insurance)}</span>
                    </div>
                  )}
                  {bookingDetails.pricing.extras > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Extra Services</span>
                      <span>{formatCurrency(bookingDetails.pricing.extras)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total Amount</span>
                      <span className="text-primary">{formatCurrency(bookingDetails.pricing.totalAmount)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-green-600 text-center">
                    <CheckCircle className="h-3 w-3 inline mr-1" />
                    All taxes and fees included
                  </div>
                </CardContent>
              </Card>

              {/* Important Information */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900 flex items-center space-x-2">
                    <Info className="h-5 w-5" />
                    <span>Important Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-blue-800">
                    <div className="flex items-start space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Your booking will be confirmed immediately after successful payment</span>
                    </div>
                    <div className="flex items-start space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>You will receive a confirmation email with all booking details</span>
                    </div>
                    <div className="flex items-start space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Check-in opens 24 hours before departure</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Please review fare rules before payment as some fares may be non-refundable</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cancel Booking */}
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={handleCancelBooking}
                  className="text-red-600 hover:text-red-700"
                >
                  Cancel Booking
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Security Information */}
      <div className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-3">
              <Lock className="h-6 w-6 text-green-400" />
              <div>
                <div className="font-semibold">Secure Payment</div>
                <div className="text-sm text-gray-400">256-bit SSL encryption</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-green-400" />
              <div>
                <div className="font-semibold">PCI Compliant</div>
                <div className="text-sm text-gray-400">Industry-standard security</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <div>
                <div className="font-semibold">Fraud Protection</div>
                <div className="text-sm text-gray-400">Advanced fraud detection</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage