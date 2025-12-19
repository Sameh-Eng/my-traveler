'use client'

import React, { useState } from 'react'
import {
  Clock,
  Wifi,
  Coffee,
  Tv,
  Luggage,
  ChevronDown,
  ChevronUp,
  Plane,
  Star,
  Heart,
  Share2,
  GitCompare,
  Leaf,
  AlertCircle,
  Zap,
  Armchair
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useFlightStore } from '@/store'
import { Flight } from '@/types'
import {
  formatCurrency,
  formatTime,
  formatDuration,
  getCarbonEmissionOffset,
  getAirlineLogoUrl,
} from '@/lib/utils'

interface FlightCardProps {
  flight: Flight
  isSelected?: boolean
  onSelect?: (flight: Flight) => void
  onCompare?: (flight: Flight) => void
  showSelect?: boolean
  showCompare?: boolean
  compact?: boolean
}

const FlightCard = ({
  flight,
  isSelected = false,
  onSelect,
  onCompare,
  showSelect = true,
  showCompare = true,
  compact = false
}: FlightCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const { toggleFlightSelection, addToComparison, removeFromComparison, comparisonFlights } = useFlightStore()

  const isComparing = comparisonFlights.some(f => f.id === flight.id)

  const handleSelect = () => {
    if (onSelect) {
      onSelect(flight)
    } else {
      toggleFlightSelection(flight)
    }
  }

  const handleCompare = () => {
    if (isComparing) {
      removeFromComparison(flight.id)
    } else {
      addToComparison(flight)
    }
    if (onCompare) {
      onCompare(flight)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${flight.airline.name} Flight ${flight.legs[0].flightNumber}`,
        text: `Flight from ${flight.legs[0].from.city} to ${flight.legs[0].to.city}`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
      case 'internet':
        return <Wifi className="h-3.5 w-3.5" />
      case 'meal':
      case 'food':
        return <Coffee className="h-3.5 w-3.5" />
      case 'entertainment':
      case 'tv':
        return <Tv className="h-3.5 w-3.5" />
      case 'baggage':
        return <Luggage className="h-3.5 w-3.5" />
      default:
        return <Star className="h-3.5 w-3.5" />
    }
  }

  const carbonOffset = getCarbonEmissionOffset(flight.totalDuration)
  const savingsAmount = 25

  return (
    <Card className={`flight-card overflow-hidden ${isSelected ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/10' : ''}`}>
      <CardContent className={`p-0`}>
        {/* Top Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <div className={compact ? 'p-4' : 'p-6'}>
          {/* Header Row - Airline & Actions */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={getAirlineLogoUrl(flight.airline.code)}
                  alt={flight.airline.name}
                  className="h-12 w-12 object-contain rounded-xl bg-gray-50 p-1.5"
                />
                {flight.isEcoFriendly && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5">
                    <Leaf className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{flight.airline.name}</span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm font-medium text-gray-500">{flight.legs[0].flightNumber}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{flight.legs[0].aircraft}</span>
                  <span className={`flight-badge ${flight.stops === 0 ? 'flight-badge-nonstop' : 'flight-badge-stops'}`}>
                    {flight.stops === 0 ? (
                      <>
                        <Zap className="h-3 w-3" />
                        Non-stop
                      </>
                    ) : (
                      <>
                        {flight.stops} {flight.stops === 1 ? 'stop' : 'stops'}
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {showCompare && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCompare}
                  className={`rounded-full h-9 w-9 ${isComparing ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <GitCompare className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFavorited(!isFavorited)}
                className={`rounded-full h-9 w-9 ${isFavorited ? 'bg-red-50 text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="rounded-full h-9 w-9 text-gray-400 hover:text-gray-600"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Flight Legs */}
          <div className="space-y-5">
            {flight.legs.map((leg, index) => (
              <div key={index}>
                {flight.legs.length > 1 && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-semibold text-gray-600">
                      {index === 0 ? 'Outbound' : index === flight.legs.length - 1 ? 'Return' : `Leg ${index + 1}`}
                    </span>
                  </div>
                )}

                {/* Main Route Display */}
                <div className="flex items-center">
                  {/* Departure */}
                  <div className="flex-1">
                    <div className="flight-time">{formatTime(leg.departure)}</div>
                    <div className="airport-code mt-1">{leg.from.code}</div>
                    <div className="airport-city">{leg.from.city}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(leg.departure).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* Route Visualization */}
                  <div className="flex-1 px-4 flex flex-col items-center">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-sm font-medium">{formatDuration(leg.duration)}</span>
                    </div>

                    {/* Animated Route Line */}
                    <div className="w-full relative">
                      <div className="flight-route-line w-full">
                        <div className="flight-plane-icon">
                          <Plane className="h-4 w-4 rotate-90" />
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 mt-2">
                      {flight.stops === 0 ? 'Direct flight' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="flex-1 text-right">
                    <div className="flight-time">{formatTime(leg.arrival)}</div>
                    <div className="airport-code mt-1">{leg.to.code}</div>
                    <div className="airport-city">{leg.to.city}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(leg.arrival).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {/* Layover info */}
                {index < flight.legs.length - 1 && flight.layovers?.[index] && (
                  <div className="flex items-center justify-center mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                    <span className="text-sm text-amber-700 font-medium">
                      {flight.layovers[index].duration}min layover in {flight.layovers[index].airport.code}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Amenities Row */}
          <div className="flex items-center gap-2 mt-5 flex-wrap">
            {flight.amenities.slice(0, 4).map((amenity, index) => (
              <div key={index} className="flight-amenity-tag">
                {getAmenityIcon(amenity)}
                <span>{amenity}</span>
              </div>
            ))}
            {flight.amenities.length > 4 && (
              <div className="flight-amenity-tag">
                <span>+{flight.amenities.length - 4}</span>
              </div>
            )}
            <div className="flight-amenity-tag">
              <Armchair className="h-3.5 w-3.5" />
              <span>{flight.seats.available} seats left</span>
            </div>
          </div>

          {/* Expandable Details */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <span>Flight Details</span>
              <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown className="h-4 w-4" />
              </div>
            </button>

            {isExpanded && (
              <div className="flight-details-panel space-y-4">
                {/* Aircraft Info */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Aircraft</span>
                  <span className="font-medium text-gray-900">{flight.legs[0].aircraft}</span>
                </div>

                {/* Available Seats */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Cabin Class</span>
                  <span className="font-medium text-gray-900 capitalize">{flight.seats.cabinClass.replace('-', ' ')}</span>
                </div>

                {/* Carbon Emission */}
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Leaf className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Carbon Footprint</div>
                      <div className="text-xs text-gray-500">{carbonOffset.tonsCO2} tons CO₂</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-600">
                      Offset for {formatCurrency(carbonOffset.cost)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
            <div>
              <div className="text-sm text-gray-400 line-through">
                {formatCurrency(flight.price.base + flight.price.taxes + savingsAmount)}
              </div>
              <div className="flight-price-tag">
                <span className="price-main">{formatCurrency(flight.price.total)}</span>
                <span className="price-savings">-{formatCurrency(savingsAmount)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">per person • includes taxes</div>
            </div>

            <div className="flex items-center gap-3">
              {showSelect && (
                <button
                  onClick={handleSelect}
                  className={`flight-action-btn ${isSelected ? 'bg-emerald-500' : ''}`}
                >
                  {isSelected ? (
                    <>
                      <span>✓</span>
                      <span className="ml-1">Selected</span>
                    </>
                  ) : (
                    'Select Flight'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default FlightCard