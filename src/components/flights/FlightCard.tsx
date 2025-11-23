'use client'

import React, { useState } from 'react'
import {
  Clock,
  MapPin,
  Users,
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
  Compare,
  Leaf,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { useFlightStore } from '@/store'
import { Flight } from '@/types'
import {
  formatCurrency,
  formatTime,
  formatDuration,
  getCarbonEmissionOffset,
  getAirlineLogoUrl,
  getFlightStatus
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
    // Implement share functionality
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

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
      case 'internet':
        return <Wifi className="h-4 w-4" />
      case 'meal':
      case 'food':
        return <Coffee className="h-4 w-4" />
      case 'entertainment':
      case 'tv':
        return <Tv className="h-4 w-4" />
      case 'baggage':
        return <Luggage className="h-4 w-4" />
      default:
        return <Star className="h-4 w-4" />
    }
  }

  const carbonOffset = getCarbonEmissionOffset(flight.totalDuration)

  return (
    <Card className={`flight-card ${isSelected ? 'ring-2 ring-primary' : ''} ${compact ? 'p-4' : 'p-6'}`}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={getAirlineLogoUrl(flight.airline.code)}
              alt={flight.airline.name}
              className="h-10 w-10 object-contain"
            />
            <div>
              <div className="font-semibold text-gray-900">{flight.airline.name}</div>
              <div className="text-sm text-gray-500">{flight.flightNumber}</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {flight.isEcoFriendly && (
              <div className="flex items-center space-x-1 text-green-600">
                <Leaf className="h-4 w-4" />
                <span className="text-xs font-medium">Eco</span>
              </div>
            )}
            {showCompare && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCompare}
                className={isComparing ? 'text-primary' : 'text-gray-400'}
              >
                <Compare className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorited(!isFavorited)}
              className={isFavorited ? 'text-red-500' : 'text-gray-400'}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-gray-400"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Flight Legs */}
        <div className="space-y-4">
          {flight.legs.map((leg, index) => (
            <div key={index} className="relative">
              {flight.legs.length > 1 && (
                <div className="flex items-center justify-center mb-2">
                  <span className="text-sm font-medium text-gray-500">
                    {index === 0 ? 'Outbound' : index === flight.legs.length - 1 ? 'Return' : `Leg ${index + 1}`}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                {/* Departure */}
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatTime(leg.departure)}
                  </div>
                  <div className="text-lg text-gray-900 font-medium">
                    {leg.from.code}
                  </div>
                  <div className="text-sm text-gray-500">
                    {leg.from.city}, {leg.from.country}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(leg.departure).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                {/* Duration & Stops */}
                <div className="flex flex-col items-center px-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(leg.duration)}</span>
                  </div>
                  <div className="flex items-center space-x-2 my-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full" />
                    <div className="w-16 h-0.5 bg-gray-300" />
                    <Plane className="h-4 w-4 text-gray-400 transform rotate-90" />
                    <div className="w-16 h-0.5 bg-gray-300" />
                    <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  </div>
                  {flight.stops > 0 && (
                    <div className="text-xs text-gray-500">
                      {flight.stops === 1 ? '1 stop' : `${flight.stops} stops`}
                    </div>
                  )}
                </div>

                {/* Arrival */}
                <div className="flex-1 text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatTime(leg.arrival)}
                  </div>
                  <div className="text-lg text-gray-900 font-medium">
                    {leg.to.code}
                  </div>
                  <div className="text-sm text-gray-500">
                    {leg.to.city}, {leg.to.country}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(leg.arrival).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {/* Layover info */}
              {index < flight.legs.length - 1 && flight.layovers?.[index] && (
                <div className="flex items-center justify-center mt-4 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800">
                    {flight.layovers[index].duration}min layover in {flight.layovers[index].airport.code}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Flight Details (Expandable) */}
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-gray-900"
          >
            <span>Flight Details</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {isExpanded && (
            <div className="mt-4 space-y-4">
              {/* Aircraft Info */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Aircraft:</span>
                <span className="font-medium">{flight.legs[0].aircraft}</span>
              </div>

              {/* Available Seats */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Available Seats:</span>
                <span className="font-medium">{flight.seats.available} in {flight.seats.cabinClass.replace('-', ' ')}</span>
              </div>

              {/* Amenities */}
              {flight.amenities.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Amenities:</div>
                  <div className="flex flex-wrap gap-2">
                    {flight.amenities.slice(0, 4).map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                      >
                        {getAmenityIcon(amenity)}
                        <span>{amenity}</span>
                      </div>
                    ))}
                    {flight.amenities.length > 4 && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                        <span>+{flight.amenities.length - 4} more</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Carbon Emission */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Leaf className="h-4 w-4 text-green-600" />
                  <span>Carbon Emission:</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{carbonOffset.tonsCO2} tons CO₂</span>
                  <div className="text-xs text-green-600">
                    Offset for {formatCurrency(carbonOffset.cost)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Price and Actions */}
        <div className={`flex items-center justify-between mt-6 pt-4 border-t ${compact ? '' : ''}`}>
          <div>
            <div className="text-sm text-gray-500 line-through">
              {formatCurrency(flight.price.base + flight.price.taxes + 25)}
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(flight.price.total)}
              </span>
              <span className="text-sm text-gray-500">per person</span>
            </div>
            <div className="text-xs text-green-600 font-medium">
              Save {formatCurrency(25)} on this flight
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {showSelect && (
              <Button
                onClick={handleSelect}
                variant={isSelected ? "default" : "outline"}
                className={isSelected ? "" : ""}
              >
                {isSelected ? 'Selected' : 'Select'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default FlightCard