'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    ArrowLeft,
    Clock,
    Wifi,
    Coffee,
    Tv,
    Luggage,
    Star,
    Heart,
    Share2,
    CheckCircle,
    AlertCircle,
    Shield,
    Plane,
    Zap,
    Leaf,
    CreditCard,
    Users,
    Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useFlightStore, useBookingStore } from '@/store'
import { formatCurrency, formatTime, formatDuration, getCarbonEmissionOffset } from '@/lib/utils'

const FlightDetailsClient = () => {
    const params = useParams()
    const router = useRouter()
    const flightId = params.id as string

    const { searchResults } = useFlightStore()
    const { selectFlight, selectedFlights } = useBookingStore()

    const [flight, setFlight] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isFavorited, setIsFavorited] = useState(false)

    useEffect(() => {
        const foundFlight = searchResults.find(f => f.id === flightId)

        if (foundFlight) {
            setFlight(foundFlight)
            setLoading(false)
        } else {
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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-100 border-t-indigo-500 mx-auto" />
                        <Plane className="h-6 w-6 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-gray-600 mt-4 font-medium">Loading flight details...</p>
                </div>
            </div>
        )
    }

    if (!flight) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 flex items-center justify-center">
                <Card className="max-w-md w-full mx-4 shadow-xl border-0">
                    <CardContent className="p-8 text-center">
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Flight Not Found</h3>
                        <p className="text-gray-500 mb-6">
                            The flight you're looking for doesn't exist or has been removed.
                        </p>
                        <Button onClick={() => router.push('/flights')} className="flight-action-btn">
                            Search Flights
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const isSelected = selectedFlights.some(f => f.id === flight.id)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10 backdrop-blur-lg bg-white/90">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Results</span>
                        </Button>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsFavorited(!isFavorited)}
                                className={`rounded-full h-10 w-10 ${isFavorited ? 'bg-red-50 text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleShare}
                                className="rounded-full h-10 w-10 text-gray-400 hover:text-gray-600"
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
                        {/* Flight Header Card */}
                        <Card className="overflow-hidden border-0 shadow-lg">
                            <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                            <CardContent className="p-6">
                                {/* Airline Header */}
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img
                                                src="/airline-sw.png"
                                                alt={flight.airline.name}
                                                className="h-16 w-16 object-contain rounded-xl bg-gray-50 p-2"
                                            />
                                            {flight.isEcoFriendly && (
                                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1">
                                                    <Leaf className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900">
                                                {flight.airline.name}
                                            </h1>
                                            <p className="text-gray-500">Flight {flight.flightNumber}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full">
                                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                            <span className="font-bold text-amber-700">{flight.airline.rating}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Airline Rating</p>
                                    </div>
                                </div>

                                {/* Flight Route */}
                                <div className="space-y-8">
                                    {flight.legs.map((leg: any, index: number) => (
                                        <div key={index}>
                                            {flight.legs.length > 1 && (
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                                                        }`}>
                                                        {index + 1}
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        {index === 0 ? 'Outbound Flight' : 'Return Flight'}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex items-center">
                                                {/* Departure */}
                                                <div className="flex-1">
                                                    <div className="flight-time">{formatTime(leg.departure)}</div>
                                                    <div className="airport-code mt-2">{leg.from.code}</div>
                                                    <div className="text-sm text-gray-500 font-medium">{leg.from.city}</div>
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        {new Date(leg.departure).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                    {leg.terminal && (
                                                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
                                                            Terminal {leg.terminal}
                                                            {leg.gate && ` • Gate ${leg.gate}`}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Duration & Route */}
                                                <div className="flex-1 px-6 flex flex-col items-center">
                                                    <div className="flex items-center gap-2 text-gray-500 mb-3">
                                                        <Clock className="h-4 w-4" />
                                                        <span className="font-medium">{formatDuration(leg.duration)}</span>
                                                    </div>

                                                    <div className="w-full relative">
                                                        <div className="flight-route-line w-full">
                                                            <div className="flight-plane-icon">
                                                                <Plane className="h-4 w-4 rotate-90" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className={`mt-3 flight-badge ${flight.stops === 0 ? 'flight-badge-nonstop' : 'flight-badge-stops'}`}>
                                                        {flight.stops === 0 ? (
                                                            <>
                                                                <Zap className="h-3 w-3" />
                                                                Non-stop
                                                            </>
                                                        ) : (
                                                            `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-2">{leg.aircraft}</div>
                                                </div>

                                                {/* Arrival */}
                                                <div className="flex-1 text-right">
                                                    <div className="flight-time">{formatTime(leg.arrival)}</div>
                                                    <div className="airport-code mt-2">{leg.to.code}</div>
                                                    <div className="text-sm text-gray-500 font-medium">{leg.to.city}</div>
                                                    <div className="text-xs text-gray-400 mt-1">
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
                        <Card className="border-0 shadow-lg overflow-hidden">
                            <CardContent className="p-6">
                                <Tabs defaultValue="amenities" className="w-full">
                                    <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl">
                                        <TabsTrigger value="amenities" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                            Amenities
                                        </TabsTrigger>
                                        <TabsTrigger value="baggage" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                            Baggage
                                        </TabsTrigger>
                                        <TabsTrigger value="seating" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                            Seating
                                        </TabsTrigger>
                                        <TabsTrigger value="policies" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                            Policies
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="amenities" className="mt-6">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {flight.amenities.map((amenity: string, index: number) => (
                                                <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-xl border border-gray-100">
                                                    <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                                        {amenity === 'WiFi' && <Wifi className="h-5 w-5" />}
                                                        {amenity === 'Entertainment' && <Tv className="h-5 w-5" />}
                                                        {amenity === 'Meals' && <Coffee className="h-5 w-5" />}
                                                        {amenity === 'Power Outlets' && <CreditCard className="h-5 w-5" />}
                                                        {amenity === 'USB Charging' && <CreditCard className="h-5 w-5" />}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">{amenity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="baggage" className="mt-6 space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                    <Luggage className="h-5 w-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">Carry-on Baggage</h4>
                                                    <p className="text-sm text-gray-500">
                                                        {flight.baggageAllowance.carryOn.weight}kg ({flight.baggageAllowance.carryOn.dimensions})
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <Luggage className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">Checked Baggage</h4>
                                                    <p className="text-sm text-gray-500">
                                                        {flight.baggageAllowance.checked.weight}kg ({flight.baggageAllowance.checked.dimensions})
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-gray-500">Additional</span>
                                                <p className="font-bold text-blue-600">{formatCurrency(flight.baggageAllowance.checked.price)}</p>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="seating" className="mt-6 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="p-4 bg-gray-50 rounded-xl">
                                                <div className="text-xs text-gray-500 uppercase tracking-wide">Configuration</div>
                                                <div className="text-xl font-bold text-gray-900 mt-1">{flight.seatConfiguration}</div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-xl">
                                                <div className="text-xs text-gray-500 uppercase tracking-wide">Available</div>
                                                <div className="text-xl font-bold text-gray-900 mt-1">{flight.seats.available} seats</div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-xl">
                                                <div className="text-xs text-gray-500 uppercase tracking-wide">Seat Pitch</div>
                                                <div className="text-xl font-bold text-gray-900 mt-1">30-32"</div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="policies" className="mt-6 space-y-4">
                                        <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                                            <div className="flex items-center gap-3 mb-2">
                                                <AlertCircle className="h-5 w-5 text-amber-500" />
                                                <h4 className="font-semibold text-gray-900">Cancellation Policy</h4>
                                            </div>
                                            <p className="text-sm text-gray-600 ml-8">
                                                {flight.cancellationPolicy.refundable
                                                    ? `Refundable until ${new Date(flight.cancellationPolicy.deadline).toLocaleDateString()}`
                                                    : 'Non-refundable ticket'}
                                            </p>
                                            {flight.cancellationPolicy.refundable && (
                                                <p className="text-sm text-amber-600 font-medium ml-8 mt-1">
                                                    Cancellation fee: {formatCurrency(flight.cancellationPolicy.fee)}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">On-time Performance</h4>
                                                <p className="text-sm text-gray-500">Based on recent flights</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                                                        style={{ width: `${flight.onTimePerformance}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{flight.onTimePerformance}%</span>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        {/* Carbon Offset */}
                        {carbonOffset && (
                            <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                                                <Leaf className="h-7 w-7 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-lg">Carbon Offset Available</h4>
                                                <p className="text-emerald-100">
                                                    This flight emits approximately {carbonOffset.tonsCO2} tons CO₂
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-emerald-100">Offset for</div>
                                            <div className="text-2xl font-bold text-white">{formatCurrency(carbonOffset.cost)}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Pricing */}
                        <Card className="border-0 shadow-lg overflow-hidden sticky top-24">
                            <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                            <CardHeader className="pb-0">
                                <CardTitle className="text-lg">Price Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Base Fare</span>
                                        <span className="font-medium">{formatCurrency(flight.price.base)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Taxes</span>
                                        <span className="font-medium">{formatCurrency(flight.price.taxes)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Fees</span>
                                        <span className="font-medium">{formatCurrency(flight.price.fees)}</span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-sm text-gray-500">Total</span>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-gray-400" />
                                                <span className="text-xs text-gray-400">per person</span>
                                            </div>
                                        </div>
                                        <div className="flight-price-tag">
                                            <span className="price-main text-3xl">{formatCurrency(flight.price.total)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSelectFlight}
                                    disabled={isSelected}
                                    className={`w-full flight-action-btn text-center ${isSelected ? 'bg-emerald-500' : ''}`}
                                >
                                    {isSelected ? '✓ Flight Selected' : 'Select This Flight'}
                                </button>

                                {isSelected && (
                                    <p className="text-sm text-emerald-600 text-center font-medium">
                                        Flight added to your booking
                                    </p>
                                )}

                                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-2">
                                    <Shield className="h-4 w-4" />
                                    <span>Secure booking guaranteed</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Trust Badges */}
                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-6">
                                <h4 className="font-bold text-gray-900 mb-4">Why Book With Us?</h4>
                                <div className="space-y-3">
                                    {[
                                        'Best Price Guarantee',
                                        '24/7 Customer Support',
                                        'Secure Payment Processing',
                                        'No Hidden Fees'
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className="h-6 w-6 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                            </div>
                                            <span className="text-sm text-gray-700">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FlightDetailsClient
