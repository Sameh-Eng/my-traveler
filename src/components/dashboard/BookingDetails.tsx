'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plane,
  Calendar,
  Clock,
  Users,
  CreditCard,
  Download,
  Share2,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
  MapPin,
  ArrowRight,
  QrCode,
  Smartphone,
  Mail,
  Phone,
  Shield,
  Star,
  RefreshCw,
  ExternalLink,
  FileText,
  Receipt
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Loading } from '@/components/ui/Loading'
import { formatCurrency, formatDate, formatTime, formatDuration, getFlightStatus } from '@/lib/utils'

interface BookingDetailsProps {
  bookingId: string
  onBookingUpdate?: () => void
  className?: string
}

interface FlightDetails {
  id: string
  airline: { name: string; code: string; logo: string }
  flightNumber: string
  aircraft: string
  cabin: string
  legs: Array<{
    from: { code: string; name: string; city: string; country: string; terminal?: string; gate?: string }
    to: { code: string; name: string; city: string; country: string; terminal?: string; gate?: string }
    departure: string
    arrival: string
    duration: number
    status: string
  }>
}

interface Passenger {
  id: string
  type: 'adult' | 'child' | 'infant'
  firstName: string
  lastName: string
  email?: string
  phone?: string
  dateOfBirth: string
  nationality: string
  seat?: string
  frequentFlyer?: { airline: string; number: string }
  specialRequests?: string[]
  baggage: {
    carryOn: { weight: number; dimensions: string }
    checked: { weight: number; dimensions: string; count: number }
  }
}

interface Booking {
  id: string
  reference: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  createdAt: string
  updatedAt: string
  flights: FlightDetails[]
  passengers: Passenger[]
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
    status: 'paid' | 'pending' | 'refunded' | 'partially_refunded'
    method: string
    transactionId?: string
    paidAt?: string
  }
  checkIn: {
    available: boolean
    completed: boolean
    opensAt?: string
    boardingPasses?: Array<{
      passengerId: string
      url: string
      issuedAt: string
    }>
  }
  contact: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  notes?: string
  fareRules: {
    cancellation: string
    changes: string
    noShow: string
  }
}

const BookingDetails: React.FC<BookingDetailsProps> = ({
  bookingId,
  onBookingUpdate,
  className = ''
}) => {
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showModifyModal, setShowModifyModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    loadBookingDetails()
  }, [bookingId])

  const loadBookingDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      // Mock data - in a real app, this would fetch from API
      const mockBooking: Booking = {
        id: bookingId,
        reference: 'ABC123',
        status: 'confirmed',
        createdAt: '2024-03-10T10:00:00Z',
        updatedAt: '2024-03-10T10:00:00Z',
        flights: [{
          id: 'FL1',
          airline: { name: 'SkyWings', code: 'SW', logo: '/api/placeholder/40/40' },
          flightNumber: 'SW234',
          aircraft: 'Airbus A320',
          cabin: 'economy',
          legs: [{
            from: {
              code: 'JFK',
              name: 'New York JFK',
              city: 'New York',
              country: 'USA',
              terminal: '4',
              gate: 'B23'
            },
            to: {
              code: 'LAX',
              name: 'Los Angeles LAX',
              city: 'Los Angeles',
              country: 'USA',
              terminal: '2',
              gate: 'A12'
            },
            departure: '2024-04-15T10:00:00Z',
            arrival: '2024-04-15T13:30:00Z',
            duration: 330,
            status: 'on-time'
          }]
        }],
        passengers: [{
          id: '1',
          type: 'adult',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1 (555) 123-4567',
          dateOfBirth: '1980-05-15',
          nationality: 'US',
          seat: '12A',
          frequentFlyer: { airline: 'SW', number: 'SW123456' },
          specialRequests: ['vegetarian meal', 'wheelchair assistance'],
          baggage: {
            carryOn: { weight: 7, dimensions: '55 x 40 x 20 cm' },
            checked: { weight: 23, dimensions: '158 cm total', count: 1 }
          }
        }, {
          id: '2',
          type: 'adult',
          firstName: 'Jane',
          lastName: 'Doe',
          dateOfBirth: '1985-08-22',
          nationality: 'US',
          seat: '12B',
          baggage: {
            carryOn: { weight: 7, dimensions: '55 x 40 x 20 cm' },
            checked: { weight: 23, dimensions: '158 cm total', count: 1 }
          }
        }],
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
          status: 'paid',
          method: 'credit_card',
          transactionId: 'txn_123456789',
          paidAt: '2024-03-10T10:05:00Z'
        },
        checkIn: {
          available: false,
          completed: false,
          opensAt: '2024-04-14T10:00:00Z'
        },
        contact: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1 (555) 123-4567'
        },
        notes: 'Special dietary requirements for passenger 1',
        fareRules: {
          cancellation: 'Non-refundable fare',
          changes: 'Changes allowed with fee',
          noShow: 'No refund for no-show'
        }
      }

      setTimeout(() => {
        setBooking(mockBooking)
        setLoading(false)
      }, 1000)
    } catch (err) {
      setError('Failed to load booking details')
      setLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    try {
      setCancelling(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update booking status
      if (booking) {
        setBooking({ ...booking, status: 'cancelled' })
        setShowCancelModal(false)
        onBookingUpdate?.()
      }
    } catch (err) {
      setError('Failed to cancel booking')
    } finally {
      setCancelling(false)
    }
  }

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: Booking['payment']['status']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-800">Refunded</Badge>
      case 'partially_refunded':
        return <Badge className="bg-orange-100 text-orange-800">Partially Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getFlightStatusBadge = (status: string) => {
    const { label, color, bgColor } = getFlightStatus(status)
    return <Badge className={`${bgColor} ${color}`}>{label}</Badge>
  }

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <Loading message="Loading booking details..." />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className={`p-6 ${className}`}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error || 'Booking not found'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Booking {booking.reference}</span>
                  {getStatusBadge(booking.status)}
                </CardTitle>
                <CardDescription>
                  Created {formatDate(booking.createdAt)} • {getPaymentStatusBadge(booking.payment.status)}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareModal(true)}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              {booking.status === 'confirmed' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowModifyModal(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modify
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowCancelModal(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Flight Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plane className="h-5 w-5" />
            <span>Flight Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {booking.flights.map((flight) => (
            <div key={flight.id} className="space-y-4">
              <div className="flex items-center justify-between">
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
                <div className="text-right">
                  {getFlightStatusBadge(flight.legs[0].status)}
                </div>
              </div>

              {flight.legs.map((leg, legIndex) => (
                <div key={legIndex} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Departure */}
                    <div>
                      <div className="text-sm text-gray-600 mb-1">From</div>
                      <div className="font-semibold text-lg">{leg.from.code}</div>
                      <div className="text-gray-900">{leg.from.name}</div>
                      <div className="text-sm text-gray-600">{leg.from.city}, {leg.from.country}</div>
                      {leg.from.terminal && (
                        <div className="text-sm text-gray-600">
                          Terminal {leg.from.terminal} • Gate {leg.from.gate}
                        </div>
                      )}
                      <div className="font-semibold mt-2">{formatTime(leg.departure)}</div>
                      <div className="text-sm text-gray-600">{formatDate(leg.departure)}</div>
                    </div>

                    {/* Flight Duration */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-sm text-gray-600 mb-2">Duration</div>
                      <div className="font-medium">{formatDuration(leg.duration)}</div>
                      <div className="h-px bg-gray-300 w-full my-2"></div>
                      <div className="text-xs text-gray-500">Non-stop</div>
                    </div>

                    {/* Arrival */}
                    <div>
                      <div className="text-sm text-gray-600 mb-1">To</div>
                      <div className="font-semibold text-lg">{leg.to.code}</div>
                      <div className="text-gray-900">{leg.to.name}</div>
                      <div className="text-sm text-gray-600">{leg.to.city}, {leg.to.country}</div>
                      {leg.to.terminal && (
                        <div className="text-sm text-gray-600">
                          Terminal {leg.to.terminal} • Gate {leg.to.gate}
                        </div>
                      )}
                      <div className="font-semibold mt-2">{formatTime(leg.arrival)}</div>
                      <div className="text-sm text-gray-600">{formatDate(leg.arrival)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Passengers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Passengers ({booking.passengers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {booking.passengers.map((passenger, index) => (
              <div key={passenger.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
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
                  {booking.checkIn.available && (
                    <Button variant="outline" size="sm">
                      <Smartphone className="h-4 w-4 mr-2" />
                      Boarding Pass
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Contact</div>
                    {passenger.email && (
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{passenger.email}</span>
                      </div>
                    )}
                    {passenger.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{passenger.phone}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-gray-600">Baggage</div>
                    <div>Carry-on: {passenger.baggage.carryOn.weight}kg</div>
                    <div>Checked: {passenger.baggage.checked.count} × {passenger.baggage.checked.weight}kg</div>
                  </div>
                </div>

                {passenger.specialRequests && passenger.specialRequests.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm text-gray-600 mb-1">Special Requests</div>
                    <div className="flex flex-wrap gap-1">
                      {passenger.specialRequests.map((request, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {request}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Base Fare</span>
              <span>{formatCurrency(booking.pricing.basePrice, booking.pricing.currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Taxes & Fees</span>
              <span>{formatCurrency(booking.pricing.taxes + booking.pricing.fees, booking.pricing.currency)}</span>
            </div>
            {booking.pricing.insurance > 0 && (
              <div className="flex justify-between text-sm">
                <span>Travel Insurance</span>
                <span>{formatCurrency(booking.pricing.insurance, booking.pricing.currency)}</span>
              </div>
            )}
            {booking.pricing.extras > 0 && (
              <div className="flex justify-between text-sm">
                <span>Extra Services</span>
                <span>{formatCurrency(booking.pricing.extras, booking.pricing.currency)}</span>
              </div>
            )}
            <div className="border-t pt-3">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Paid</span>
                <span>{formatCurrency(booking.pricing.totalAmount, booking.pricing.currency)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{booking.payment.method.replace('_', ' ').toUpperCase()}</span>
              <span>{booking.payment.transactionId}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fare Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Fare Rules</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
              <div>
                <div className="font-medium">Cancellation</div>
                <div className="text-sm text-gray-600">{booking.fareRules.cancellation}</div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Edit className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <div className="font-medium">Changes</div>
                <div className="text-sm text-gray-600">{booking.fareRules.changes}</div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Clock className="h-4 w-4 text-red-500 mt-0.5" />
              <div>
                <div className="font-medium">No-Show Policy</div>
                <div className="text-sm text-gray-600">{booking.fareRules.noShow}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Booking"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <div className="font-semibold text-red-900">Cancellation Policy</div>
                <div className="text-sm text-red-700 mt-1">
                  {booking.fareRules.cancellation}
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Are you sure you want to cancel booking {booking.reference}? This action cannot be undone.
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
              disabled={cancelling}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              loading={cancelling}
            >
              Cancel Booking
            </Button>
          </div>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Booking"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Share your booking details with friends, family, or travel companions.
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Mail className="h-4 w-4 mr-3" />
              Share via Email
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Smartphone className="h-4 w-4 mr-3" />
              Share via SMS
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <QrCode className="h-4 w-4 mr-3" />
              Generate QR Code
            </Button>
          </div>

          <div className="pt-4 border-t">
            <div className="text-sm font-medium mb-2">Booking Link</div>
            <div className="flex items-center space-x-2">
              <Input
                value={`https://skywings.com/booking/${booking.reference}`}
                readOnly
                className="flex-1"
              />
              <Button variant="outline">Copy</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default BookingDetails