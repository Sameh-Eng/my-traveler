'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Wifi,
  Coffee,
  Tv,
  Luggage,
  Star,
  Heart,
  Share2,
  Info,
  CheckCircle,
  AlertCircle,
  Shield,
  Plane,
  User,
  CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { useFlightStore, useBookingStore } from '@/store'
import { formatCurrency, formatTime, formatDuration, getCarbonEmissionOffset } from '@/lib/utils'

const FlightDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const flightId = params.id as string

  const { searchResults } = useFlightStore()
  const { selectFlight, selectedFlights } = useBookingStore()

  const [flight, setFlight] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    // Find the flight in search results or fetch from API
    const foundFlight = searchResults.find(f => f.id === flightId)

    if (foundFlight) {
      setFlight(foundFlight)
      setLoading(false)
    } else {
      // Simulate API fetch
      setTimeout(() => {
        const mockFlight = {
          id: flightId,
          airline: {
            name: 'SkyWings International',
            code: 'SW',
            logo: '/airline-sw.png',
            rating: 4.5
          },
          flightNumber: 'SW1234',
          legs: [
            {
              from: {
                code: 'NYC',
                name: 'John F. Kennedy International',
                city: 'New York',
                country: 'USA',
                timezone: 'America/New_York'
              },
              to: {
                code: 'LON',
                name: 'Heathrow Airport',
                city: 'London',
                country: 'UK',
                timezone: 'Europe/London'
              },
              departure: '2024-12-15T20:00:00Z',
              arrival: '2024-12-16T08:00:00Z',
              duration: 420,
              aircraft: 'Boeing 777-300ER',
              terminal: '4',
              gate: 'B22'
            }
          ],
          price: {
            base: 680,
            taxes: 120,
            fees: 45,
            total: 845,
            currency: 'USD'
          },
          seats: {
            available: 15,
            cabinClass: 'economy'
          },
          stops: 0,
          totalDuration: 420,
          amenities: ['WiFi', 'Entertainment', 'Meals', 'Power Outlets', 'USB Charging'],
          carbonEmission: 2340,
          isEcoFriendly: false,
          baggageAllowance: {
            carryOn: { weight: 7, dimensions: '55x40x20cm' },
            checked: { weight: 23, dimensions: '158x99x21cm', price: 60 }
          },
          seatConfiguration: '3-3-3',
          onTimePerformance: 87,
          cancellationPolicy: {
            refundable: true,
            deadline: '2024-12-14T20:00:00Z',
            fee: 50
          }
        }
        setFlight(mockFlight)
        setLoading(false)
      }, 1000)
    }
  }, [flightId, searchResults])

  const handleSelectFlight = () => {
    selectFlight(flight)
    router.push('/booking')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${flight.airline.name} Flight ${flight.flightNumber}`,
        text: `Flight from ${flight.legs[0].from.city} to ${flight.legs[0].to.city}`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const carbonOffset = flight ? getCarbonEmissionOffset(flight.totalDuration) : null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flight details...</p>
        </div>
      </div>
    )
  }

  if (!flight) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Flight Not Found</h3>
            <p className="text-gray-600 mb-4">
              The flight you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push('/flights')}>
              Search Flights
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isSelected = selectedFlights.some(f => f.id === flight.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Results</span>
            </Button>

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFavorited(!isFavorited)}
                className={isFavorited ? 'text-red-500' : 'text-gray-400'}
              >
                <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="text-gray-400"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Flight Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <img
                      src="/airline-sw.png"
                      alt={flight.airline.name}
                      className="h-12 w-12 object-contain"
                    />
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {flight.airline.name}
                      </h1>
                      <p className="text-gray-600">Flight {flight.flightNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{flight.airline.rating}</span>
                    </div>
                    <p className="text-sm text-gray-500">Airline Rating</p>
                  </div>
                </div>

                {/* Flight Route */}
                <div className="space-y-6">
                  {flight.legs.map((leg: any, index: number) => (
                    <div key={index} className="relative">
                      {flight.legs.length > 1 && (
                        <div className="text-sm font-medium text-gray-500 mb-3">
                          {index === 0 ? 'Outbound' : 'Return'} Flight
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        {/* Departure */}
                        <div className="flex-1">
                          <div className="text-3xl font-bold text-gray-900">
                            {formatTime(leg.departure)}
                          </div>
                          <div className="text-lg font-medium text-gray-900">
                            {leg.from.code}
                          </div>
                          <div className="text-gray-600">{leg.from.city}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(leg.departure).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          {leg.terminal && (
                            <div className="text-sm text-gray-500">
                              Terminal {leg.terminal}
                              {leg.gate && `, Gate ${leg.gate}`}
                            </div>
                          )}
                        </div>

                        {/* Duration & Aircraft */}
                        <div className="flex flex-col items-center px-6">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{formatDuration(leg.duration)}</span>
                          </div>
                          <div className="flex items-center space-x-2 my-3">
                            <div className="w-2 h-2 bg-gray-300 rounded-full" />
                            <div className="w-24 h-0.5 bg-gray-300" />
                            <Plane className="h-5 w-5 text-gray-400 transform rotate-90" />
                            <div className="w-24 h-0.5 bg-gray-300" />
                            <div className="w-2 h-2 bg-gray-300 rounded-full" />
                          </div>
                          <div className="text-sm text-gray-500">
                            {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stops`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {leg.aircraft}
                          </div>
                        </div>

                        {/* Arrival */}
                        <div className="flex-1 text-right">
                          <div className="text-3xl font-bold text-gray-900">
                            {formatTime(leg.arrival)}
                          </div>
                          <div className="text-lg font-medium text-gray-900">
                            {leg.to.code}
                          </div>
                          <div className="text-gray-600">{leg.to.city}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(leg.arrival).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Flight Details Tabs */}
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="amenities" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="amenities">Amenities</TabsTrigger>
                    <TabsTrigger value="baggage">Baggage</TabsTrigger>
                    <TabsTrigger value="seating">Seating</TabsTrigger>
                    <TabsTrigger value="policies">Policies</TabsTrigger>
                  </TabsList>

                  <TabsContent value="amenities" className="mt-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {flight.amenities.map((amenity: string, index: number) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-primary">
                            {amenity === 'WiFi' && <Wifi className="h-5 w-5" />}
                            {amenity === 'Entertainment' && <Tv className="h-5 w-5" />}
                            {amenity === 'Meals' && <Coffee className="h-5 w-5" />}
                            {amenity === 'Power Outlets' && <CreditCard className="h-5 w-5" />}
                            {amenity === 'USB Charging' && <CreditCard className="h-5 w-5" />}
                          </div>
                          <span className="text-sm font-medium">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="baggage" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Luggage className="h-5 w-5 text-green-600" />
                          <div>
                            <h4 className="font-medium">Carry-on Baggage</h4>
                            <p className="text-sm text-gray-600">
                              {flight.baggageAllowance.carryOn.weight}kg
                              ({flight.baggageAllowance.carryOn.dimensions})
                            </p>
                          </div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Luggage className="h-5 w-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium">Checked Baggage</h4>
                            <p className="text-sm text-gray-600">
                              {flight.baggageAllowance.checked.weight}kg
                              ({flight.baggageAllowance.checked.dimensions})
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-600">Additional</span>
                          <p className="font-medium">{formatCurrency(flight.baggageAllowance.checked.price)}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="seating" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Seat Configuration</h4>
                          <p className="text-sm text-gray-600">Economy Class</p>
                        </div>
                        <span className="text-sm font-medium">{flight.seatConfiguration}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Available Seats</h4>
                          <p className="text-sm text-gray-600">In {flight.seats.cabinClass.replace('-', ' ')}</p>
                        </div>
                        <span className="text-sm font-medium">{flight.seats.available} seats</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Seat Pitch</h4>
                          <p className="text-sm text-gray-600">Standard economy comfort</p>
                        </div>
                        <span className="text-sm font-medium">30-32 inches</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="policies" className="mt-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-3 mb-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                          <h4 className="font-medium">Cancellation Policy</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          {flight.cancellationPolicy.refundable
                            ? `Refundable until ${new Date(flight.cancellationPolicy.deadline).toLocaleDateString()}`
                            : 'Non-refundable ticket'}
                        </p>
                        {flight.cancellationPolicy.refundable && (
                          <p className="text-sm text-gray-600 mt-1">
                            Cancellation fee: {formatCurrency(flight.cancellationPolicy.fee)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">On-time Performance</h4>
                          <p className="text-sm text-gray-600">Based on recent flights</p>
                        </div>
                        <span className="text-sm font-medium">{flight.onTimePerformance}%</span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Carbon Offset */}
            {carbonOffset && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Leaf className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Carbon Offset Available</h4>
                        <p className="text-sm text-gray-600">
                          This flight emits {carbonOffset.tonsCO2} tons CO₂
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-600">Offset for</span>
                      <p className="font-medium text-green-600">{formatCurrency(carbonOffset.cost)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Price Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Base Fare</span>
                  <span>{formatCurrency(flight.price.base)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxes & Fees</span>
                  <span>{formatCurrency(flight.price.taxes + flight.price.fees)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(flight.price.total)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 text-right">per person</p>
                </div>
              </CardContent>
            </Card>

            {/* Booking Action */}
            <Card>
              <CardContent className="p-6">
                <Button
                  onClick={handleSelectFlight}
                  className="w-full btn-glow"
                  disabled={isSelected}
                  size="lg"
                >
                  {isSelected ? 'Selected' : 'Select This Flight'}
                </Button>
                {isSelected && (
                  <p className="text-sm text-green-600 text-center mt-2">
                    Flight added to your booking
                  </p>
                )}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    <Shield className="h-4 w-4 inline mr-1" />
                    Secure booking guaranteed
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium mb-4">Why Book With Us?</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Best Price Guarantee</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">24/7 Customer Support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Secure Payment Processing</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

const Leaf = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
)

export default FlightDetailsPage