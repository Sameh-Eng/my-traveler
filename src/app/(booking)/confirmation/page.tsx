'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  CheckCircle,
  Download,
  Share2,
  Mail,
  Smartphone,
  Calendar,
  Clock,
  Plane,
  Users,
  CreditCard,
  MapPin,
  ArrowRight,
  Home,
  FileText,
  QrCode,
  Printer,
  Star,
  TrendingUp,
  Shield,
  Headphones,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Loading } from '@/components/ui/Loading'
import { useAuthStore } from '@/store'
import { formatCurrency, formatDate, formatTime, formatDuration } from '@/lib/utils'

interface BookingConfirmation {
  id: string
  reference: string
  status: 'confirmed' | 'pending' | 'failed'
  createdAt: string
  flights: Array<{
    id: string
    airline: { name: string; code: string; logo: string }
    flightNumber: string
    legs: Array<{
      from: { code: string; name: string; city: string; country: string }
      to: { code: string; name: string; city: string; country: string }
      departure: string
      arrival: string
      duration: number
      terminal?: string
      gate?: string
    }>
    cabin: string
    aircraft: string
  }>
  passengers: Array<{
    id: string
    firstName: string
    lastName: string
    type: string
    seat?: string
    frequentFlyer?: { airline: string; number: string }
  }>
  pricing: {
    basePrice: number
    taxes: number
    fees: number
    insurance: number
    extras: number
    totalAmount: number
    currency: string
  }
  payment: {
    method: string
    status: string
    transactionId: string
    paidAt: string
    last4?: string
  }
  contact: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  checkIn: {
    opensAt: string
    availableAt: string
  }
  loyaltyPoints: {
    earned: number
    currentBalance: number
  }
  nextSteps: Array<{
    title: string
    description: string
    timing: string
    completed: boolean
  }>
  emergencyContacts: Array<{
    name: string
    phone: string
    relationship: string
  }>
}

const BookingConfirmationPage = () => {
  const { user } = useAuthStore()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<BookingConfirmation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const bookingId = searchParams.get('bookingId')
  const transactionId = searchParams.get('transactionId')

  useEffect(() => {
    loadBookingConfirmation()
  }, [bookingId, transactionId])

  const loadBookingConfirmation = async () => {
    try {
      setLoading(true)
      setError(null)

      // Mock data - in a real app, this would fetch from API
      const mockBooking: BookingConfirmation = {
        id: bookingId || 'ABC123',
        reference: 'ABC123',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        flights: [{
          id: 'FL1',
          airline: { name: 'SkyWings', code: 'SW', logo: '/api/placeholder/40/40' },
          flightNumber: 'SW234',
          legs: [{
            from: { code: 'JFK', name: 'New York JFK', city: 'New York', country: 'USA' },
            to: { code: 'LAX', name: 'Los Angeles LAX', city: 'Los Angeles', country: 'USA' },
            departure: '2024-04-15T10:00:00Z',
            arrival: '2024-04-15T13:30:00Z',
            duration: 330,
            terminal: '4',
            gate: 'B23'
          }],
          cabin: 'economy',
          aircraft: 'Airbus A320'
        }],
        passengers: [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            type: 'adult',
            seat: '12A',
            frequentFlyer: { airline: 'SW', number: 'SW123456' }
          },
          {
            id: '2',
            firstName: 'Jane',
            lastName: 'Doe',
            type: 'adult',
            seat: '12B'
          }
        ],
        pricing: {
          basePrice: 1299,
          taxes: 189,
          fees: 45,
          insurance: 89,
          extras: 45,
          totalAmount: 1667,
          currency: 'USD'
        },
        payment: {
          method: 'credit_card',
          status: 'completed',
          transactionId: transactionId || 'txn_123456789',
          paidAt: new Date().toISOString(),
          last4: '4242'
        },
        contact: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1 (555) 123-4567'
        },
        checkIn: {
          opensAt: '2024-04-14T10:00:00Z',
          availableAt: '2024-04-15T08:00:00Z'
        },
        loyaltyPoints: {
          earned: 1500,
          currentBalance: 8500
        },
        nextSteps: [
          {
            title: 'Payment Confirmed',
            description: 'Your payment has been successfully processed',
            timing: 'Completed',
            completed: true
          },
          {
            title: 'Booking Confirmed',
            description: 'Your seats have been reserved and booking confirmed',
            timing: 'Completed',
            completed: true
          },
          {
            title: 'Check-in Opens',
            description: 'You can check in online and select your seats',
            timing: formatDate('2024-04-14'),
            completed: false
          },
          {
            title: 'Boarding Pass Available',
            description: 'Download or print your boarding passes',
            timing: formatDate('2024-04-15'),
            completed: false
          }
        ],
        emergencyContacts: [
          {
            name: 'Jane Doe',
            phone: '+1 (555) 987-6543',
            relationship: 'Spouse'
          }
        ]
      }

      setTimeout(() => {
        setBooking(mockBooking)
        setLoading(false)
      }, 2000)
    } catch (err) {
      setError('Failed to load booking confirmation')
      setLoading(false)
    }
  }

  const handleDownloadItinerary = () => {
    // Implement download functionality
    const element = document.createElement('a')
    element.setAttribute('href', '/api/itinerary/download')
    element.setAttribute('download', `itinerary-${booking?.reference}.pdf`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleShareBooking = () => {
    // Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: `Flight Booking Confirmation ${booking?.reference}`,
        text: `My flight to ${booking?.flights[0].legs[0].to.city} has been confirmed!`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleEmailItinerary = () => {
    // Implement email functionality
    window.location.href = `mailto:?subject=Flight Booking ${booking?.reference}&body=Here is my flight booking confirmation: ${window.location.href}`
  }

  const handlePrintItinerary = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Loading message="Confirming your booking..." />
          </div>
          <div className="text-lg font-medium">Processing your payment</div>
          <div className="text-sm text-gray-600">Please wait while we confirm your booking</div>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 mb-2">Booking Confirmation Failed</h2>
            <p className="text-red-700 mb-6">{error || 'We couldn\'t confirm your booking. Please contact support.'}</p>
            <Link href="/contact">
              <Button className="w-full">Contact Support</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (booking.status === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 mb-2">Payment Failed</h2>
            <p className="text-red-700 mb-6">Your payment could not be processed. Please try again or use a different payment method.</p>
            <Link href="/payment">
              <Button className="w-full">Try Payment Again</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Booking Confirmed!</h1>
          <p className="text-xl mb-2">Your flight has been successfully booked</p>
          <div className="text-2xl font-semibold">
            Booking Reference: <span className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">{booking.reference}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="flights">Flights</TabsTrigger>
            <TabsTrigger value="passengers">Passengers</TabsTrigger>
            <TabsTrigger value="receipt">Receipt</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button onClick={handleDownloadItinerary} className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Download Itinerary</span>
                  </Button>
                  <Button onClick={handleEmailItinerary} variant="outline" className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email Itinerary</span>
                  </Button>
                  <Button onClick={handleShareBooking} variant="outline" className="flex items-center space-x-2">
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </Button>
                  <Button onClick={handlePrintItinerary} variant="outline" className="flex items-center space-x-2">
                    <Printer className="h-4 w-4" />
                    <span>Print</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Next Steps</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {booking.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                        step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{step.title}</h3>
                          <span className="text-sm text-gray-500">{step.timing}</span>
                        </div>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plane className="h-5 w-5" />
                    <span>Flight Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Flight</span>
                    <span className="font-medium">{booking.flights[0].airline.name} {booking.flights[0].flightNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Route</span>
                    <span className="font-medium">
                      {booking.flights[0].legs[0].from.code} → {booking.flights[0].legs[0].to.code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Departure</span>
                    <span className="font-medium">
                      {formatDate(booking.flights[0].legs[0].departure)} at {formatTime(booking.flights[0].legs[0].departure)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{formatDuration(booking.flights[0].legs[0].duration)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Passengers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {booking.passengers.map((passenger) => (
                      <div key={passenger.id} className="flex justify-between">
                        <span className="text-gray-600">{passenger.firstName} {passenger.lastName}</span>
                        <span className="text-sm text-gray-500 capitalize">{passenger.type}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Paid</span>
                      <span className="font-bold text-lg text-primary">
                        {formatCurrency(booking.pricing.totalAmount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Loyalty Points */}
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Star className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Loyalty Points Earned</div>
                      <div className="text-sm text-amber-700">
                        You've earned {booking.loyaltyPoints.earned} points from this booking
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-600">+{booking.loyaltyPoints.earned}</div>
                    <div className="text-sm text-amber-700">Total: {booking.loyaltyPoints.currentBalance}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flights" className="space-y-6">
            {booking.flights.map((flight) => (
              <Card key={flight.id}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <Plane className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">
                        {flight.airline.name} {flight.flightNumber}
                      </div>
                      <div className="text-sm text-gray-600">
                        {flight.aircraft} • {flight.cabin.replace('_', ' ')} class
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {flight.legs.map((leg, legIndex) => (
                    <div key={legIndex} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">From</div>
                          <div className="font-semibold text-lg">{leg.from.code}</div>
                          <div className="text-gray-900">{leg.from.name}</div>
                          <div className="text-sm text-gray-600">{leg.from.city}, {leg.from.country}</div>
                          {leg.terminal && (
                            <div className="text-sm text-gray-600 mt-1">
                              Terminal {leg.terminal} • Gate {leg.gate}
                            </div>
                          )}
                          <div className="font-semibold mt-2">{formatTime(leg.departure)}</div>
                          <div className="text-sm text-gray-600">{formatDate(leg.departure)}</div>
                        </div>

                        <div className="flex flex-col items-center justify-center">
                          <div className="text-sm text-gray-600 mb-2">Duration</div>
                          <div className="font-medium">{formatDuration(leg.duration)}</div>
                          <div className="h-px bg-gray-300 w-full my-2"></div>
                          <div className="text-xs text-gray-500">Non-stop</div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-gray-600 mb-1">To</div>
                          <div className="font-semibold text-lg">{leg.to.code}</div>
                          <div className="text-gray-900">{leg.to.name}</div>
                          <div className="text-sm text-gray-600">{leg.to.city}, {leg.to.country}</div>
                          {leg.terminal && (
                            <div className="text-sm text-gray-600 mt-1">
                              Terminal {leg.terminal} • Gate {leg.gate}
                            </div>
                          )}
                          <div className="font-semibold mt-2">{formatTime(leg.arrival)}</div>
                          <div className="text-sm text-gray-600">{formatDate(leg.arrival)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="passengers" className="space-y-6">
            {booking.passengers.map((passenger) => (
              <Card key={passenger.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-semibold text-lg">
                        {passenger.firstName} {passenger.lastName}
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <Badge variant="outline" className="capitalize">{passenger.type}</Badge>
                        <span>Seat {passenger.seat || 'Not assigned'}</span>
                        {passenger.frequentFlyer && (
                          <span>{passenger.frequentFlyer.airline} {passenger.frequentFlyer.number}</span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <QrCode className="h-4 w-4 mr-2" />
                      Boarding Pass
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="receipt" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Receipt</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Transaction ID</span>
                    <span className="font-mono">{booking.payment.transactionId}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Payment Method</span>
                    <span className="capitalize">{booking.payment.method.replace('_', ' ')} ending in {booking.payment.last4}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Payment Date</span>
                    <span>{formatDate(booking.payment.paidAt)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Base Fare ({booking.passengers.length} ×)</span>
                    <span>{formatCurrency(booking.pricing.basePrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxes & Fees</span>
                    <span>{formatCurrency(booking.pricing.taxes + booking.pricing.fees)}</span>
                  </div>
                  {booking.pricing.insurance > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Travel Insurance</span>
                      <span>{formatCurrency(booking.pricing.insurance)}</span>
                    </div>
                  )}
                  {booking.pricing.extras > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Extra Services</span>
                      <span>{formatCurrency(booking.pricing.extras)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount</span>
                    <span className="text-primary">{formatCurrency(booking.pricing.totalAmount)}</span>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-green-800">
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Payment Protected</span>
                  </div>
                  <div className="text-sm text-green-700 mt-1">
                    Your payment is protected by our secure payment system and buyer protection policy.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center space-x-2 w-full sm:w-auto">
              <Home className="h-4 w-4" />
              <span>Go to Dashboard</span>
            </Button>
          </Link>
          <Link href="/flights">
            <Button className="flex items-center space-x-2 w-full sm:w-auto">
              <Plane className="h-4 w-4" />
              <span>Book Another Flight</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmationPage