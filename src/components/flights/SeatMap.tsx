'use client'

import React, { useState, useEffect } from 'react'
import {
  User,
  Users,
  Package,
  Coffee,
  Wifi,
  Plug,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Info,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Loading'
import { formatCurrency } from '@/lib/utils'

export interface Seat {
  id: string
  row: number
  column: string
  type: 'economy' | 'premium_economy' | 'business' | 'first'
  status: 'available' | 'occupied' | 'selected' | 'blocked'
  price: number
  features: string[]
  position: 'window' | 'aisle' | 'middle'
}

export interface SeatMapData {
  flightId: string
  aircraft: {
    type: string
    registration: string
    layout: string
  }
  configuration: {
    rows: number
    columns: string[]
    seatGaps: number[]
    emergencyExitRows: number[]
    cabinClasses: Array<{
      type: string
      startRow: number
      endRow: number
      priceMultiplier: number
      name: string
    }>
  }
  seats: Seat[]
}

interface SeatMapProps {
  flightId: string
  legId?: string
  selectedSeats: string[]
  onSeatSelect: (seatId: string) => void
  onSeatsConfirm: (selectedSeats: string[]) => void
  loading?: boolean
  error?: string | null
  className?: string
}

const SeatMap: React.FC<SeatMapProps> = ({
  flightId,
  legId,
  selectedSeats,
  onSeatSelect,
  onSeatsConfirm,
  loading = false,
  error = null,
  className = ''
}) => {
  const [seatMapData, setSeatMapData] = useState<SeatMapData | null>(null)
  const [currentCabin, setCurrentCabin] = useState<string>('economy')
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Mock data for demonstration
  useEffect(() => {
    const mockSeatMapData: SeatMapData = {
      flightId,
      aircraft: {
        type: 'Airbus A320',
        registration: 'N12345',
        layout: '3-3'
      },
      configuration: {
        rows: 30,
        columns: ['A', 'B', 'C', 'D', 'E', 'F'],
        seatGaps: [10, 11], // Gap between cabins
        emergencyExitRows: [12, 24],
        cabinClasses: [
          { type: 'first', startRow: 1, endRow: 2, priceMultiplier: 3, name: 'First Class' },
          { type: 'business', startRow: 3, endRow: 8, priceMultiplier: 2, name: 'Business Class' },
          { type: 'premium_economy', startRow: 9, endRow: 12, priceMultiplier: 1.5, name: 'Premium Economy' },
          { type: 'economy', startRow: 13, endRow: 30, priceMultiplier: 1, name: 'Economy' }
        ]
      },
      seats: generateMockSeats(flightId)
    }

    setSeatMapData(mockSeatMapData)
  }, [flightId])

  function generateMockSeats(flightId: string): Seat[] {
    const seats: Seat[] = []
    const basePrice = 299

    for (let row = 1; row <= 30; row++) {
      const columns = ['A', 'B', 'C', 'D', 'E', 'F']

      for (const column of columns) {
        const seatId = `${row}${column}`
        const isWindow = column === 'A' || column === 'F'
        const isAisle = column === 'C' || column === 'D'

        let type: Seat['type'] = 'economy'
        let priceMultiplier = 1

        if (row <= 2) {
          type = 'first'
          priceMultiplier = 3
        } else if (row <= 8) {
          type = 'business'
          priceMultiplier = 2
        } else if (row <= 12) {
          type = 'premium_economy'
          priceMultiplier = 1.5
        }

        const features: string[] = []
        if ([12, 24].includes(row)) features.push('extra_legroom')
        if (isAisle) features.push('aisle_access')
        if (isWindow) features.push('window_view')
        if (type !== 'economy') features.push('recline')
        if (type === 'business' || type === 'first') features.push('lie_flat')

        seats.push({
          id: seatId,
          row,
          column,
          type,
          status: Math.random() > 0.7 ? 'occupied' : 'available',
          price: basePrice * priceMultiplier,
          features,
          position: isWindow ? 'window' : isAisle ? 'aisle' : 'middle'
        })
      }
    }

    return seats
  }

  const getSeatIcon = (seat: Seat) => {
    if (seat.status === 'occupied') {
      return <Users className="h-4 w-4" />
    }
    return <User className="h-4 w-4" />
  }

  const getSeatButtonClasses = (seat: Seat): string => {
    const baseClasses = 'h-8 w-8 text-xs font-medium rounded transition-all duration-200 flex items-center justify-center'

    if (seat.status === 'occupied') {
      return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-300`
    }

    if (selectedSeats.includes(seat.id)) {
      return `${baseClasses} bg-primary text-white cursor-pointer border-2 border-primary-600 hover:bg-primary-600`
    }

    if (hoveredSeat === seat.id) {
      return `${baseClasses} bg-primary-100 text-primary-700 cursor-pointer border-2 border-primary-300 hover:bg-primary-200`
    }

    return `${baseClasses} bg-white text-gray-700 cursor-pointer border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50`
  }

  const getCabinClassFromRow = (row: number): string => {
    if (!seatMapData) return 'economy'

    for (const cabin of seatMapData.configuration.cabinClasses) {
      if (row >= cabin.startRow && row <= cabin.endRow) {
        return cabin.type
      }
    }
    return 'economy'
  }

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'extra_legroom':
        return <ChevronRight className="h-3 w-3" />
      case 'aisle_access':
        return <User className="h-3 w-3" />
      case 'window_view':
        return <Monitor className="h-3 w-3" />
      case 'recline':
        return <ChevronLeft className="h-3 w-3" />
      case 'lie_flat':
        return <Package className="h-3 w-3" />
      case 'power':
        return <Plug className="h-3 w-3" />
      case 'wifi':
        return <Wifi className="h-3 w-3" />
      case 'meal':
        return <Coffee className="h-3 w-3" />
      default:
        return <Info className="h-3 w-3" />
    }
  }

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied') return

    const cabinClass = getCabinClassFromRow(seat.row)
    if (cabinClass !== currentCabin && selectedSeats.length === 0) {
      setCurrentCabin(cabinClass)
      onSeatSelect(seat.id)
    } else if (cabinClass === currentCabin) {
      onSeatSelect(seat.id)
    } else {
      // Cannot select seats from different cabin classes
      return
    }
  }

  const handleConfirmSeats = () => {
    if (selectedSeats.length > 0) {
      onSeatsConfirm(selectedSeats)
    }
  }

  const clearSelection = () => {
    selectedSeats.forEach(seatId => {
      onSeatSelect(seatId)
    })
  }

  const calculateTotalPrice = (): number => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seatMapData?.seats.find(s => s.id === seatId)
      return total + (seat?.price || 0)
    }, 0)
  }

  if (loading || isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <Loading message="Loading seat map..." />
      </div>
    )
  }

  if (error || !seatMapData) {
    return (
      <div className={`p-6 ${className}`}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error || 'Failed to load seat map'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentCabinConfig = seatMapData.configuration.cabinClasses.find(c => c.type === currentCabin)
  const availableSeats = seatMapData.seats.filter(seat =>
    getCabinClassFromRow(seat.row) === currentCabin && seat.status === 'available'
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Select Your Seats</span>
            <div className="text-sm font-normal text-gray-600">
              Aircraft: {seatMapData.aircraft.type}
            </div>
          </CardTitle>
          <CardDescription>
            Choose your preferred seats for this flight. Premium seats offer additional comfort and amenities.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Cabin Class Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cabin Class</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {seatMapData.configuration.cabinClasses.map((cabin) => (
              <Button
                key={cabin.type}
                variant={currentCabin === cabin.type ? 'default' : 'outline'}
                onClick={() => setCurrentCabin(cabin.type)}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <span className="font-semibold">{cabin.name}</span>
                <span className="text-xs opacity-75">Rows {cabin.startRow}-{cabin.endRow}</span>
                <span className="text-xs">
                  From {formatCurrency(seatMapData.seats.find(s => s.type === cabin.type)?.price || 299)}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Seat Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-white border-2 border-gray-200 rounded flex items-center justify-center">
                <User className="h-3 w-3 text-gray-700" />
              </div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-primary border-2 border-primary-600 rounded flex items-center justify-center">
                <User className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm">Selected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center">
                <Users className="h-3 w-3 text-gray-400" />
              </div>
              <span className="text-sm">Occupied</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-primary-50 border-2 border-primary-300 rounded flex items-center justify-center">
                <Monitor className="h-3 w-3 text-primary-700" />
              </div>
              <span className="text-sm">Premium Features</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seat Map */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Seat Selection</CardTitle>
            <Badge variant="outline">
              {availableSeats.length} seats available in {currentCabinConfig?.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Aircraft layout */}
              <div className="space-y-2">
                {seatMapData.configuration.cabinClasses
                  .filter(cabin => cabin.type === currentCabin)
                  .map((cabin) => (
                    <div key={cabin.type}>
                      <div className="text-sm font-medium text-gray-700 mb-3">
                        {cabin.name} - Rows {cabin.startRow}-{cabin.endRow}
                      </div>

                      {Array.from(
                        { length: cabin.endRow - cabin.startRow + 1 },
                        (_, index) => {
                          const row = cabin.startRow + index
                          const isEmergencyExit = seatMapData.configuration.emergencyExitRows.includes(row)
                          const isGapRow = seatMapData.configuration.seatGaps.includes(row)

                          return (
                            <div key={row} className="flex items-center space-x-4 mb-2">
                              {/* Row number */}
                              <div className="w-12 text-center text-sm font-medium text-gray-600">
                                {row}
                              </div>

                              {/* Seats */}
                              <div className="flex items-center space-x-2">
                                {/* Left section */}
                                <div className="flex items-center space-x-1">
                                  {['A', 'B', 'C'].map((column) => {
                                    const seatId = `${row}${column}`
                                    const seat = seatMapData.seats.find(s => s.id === seatId)

                                    if (!seat || seat.type !== currentCabin) {
                                      return <div key={column} className="h-8 w-8" />
                                    }

                                    return (
                                      <div key={column} className="relative">
                                        <button
                                          className={getSeatButtonClasses(seat)}
                                          onClick={() => handleSeatClick(seat)}
                                          onMouseEnter={() => setHoveredSeat(seatId)}
                                          onMouseLeave={() => setHoveredSeat(null)}
                                          disabled={seat.status === 'occupied'}
                                        >
                                          {getSeatIcon(seat)}
                                        </button>

                                        {/* Premium features indicator */}
                                        {seat.features.length > 0 && (
                                          <div className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                            {seat.features.length}
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>

                                {/* Aisle */}
                                <div className="w-8 bg-gray-200 h-px" />

                                {/* Right section */}
                                <div className="flex items-center space-x-1">
                                  {['D', 'E', 'F'].map((column) => {
                                    const seatId = `${row}${column}`
                                    const seat = seatMapData.seats.find(s => s.id === seatId)

                                    if (!seat || seat.type !== currentCabin) {
                                      return <div key={column} className="h-8 w-8" />
                                    }

                                    return (
                                      <div key={column} className="relative">
                                        <button
                                          className={getSeatButtonClasses(seat)}
                                          onClick={() => handleSeatClick(seat)}
                                          onMouseEnter={() => setHoveredSeat(seatId)}
                                          onMouseLeave={() => setHoveredSeat(null)}
                                          disabled={seat.status === 'occupied'}
                                        >
                                          {getSeatIcon(seat)}
                                        </button>

                                        {/* Premium features indicator */}
                                        {seat.features.length > 0 && (
                                          <div className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                            {seat.features.length}
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Row indicator */}
                              <div className="w-12 text-center text-sm font-medium text-gray-600">
                                {row}
                              </div>

                              {/* Emergency exit indicator */}
                              {isEmergencyExit && (
                                <div className="ml-4 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                                  Exit
                                </div>
                              )}
                            </div>
                          )
                        }
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seat Details Tooltip */}
      {hoveredSeat && (
        <Card className="absolute z-50 bg-white border-2 border-primary-300 shadow-lg p-3 max-w-xs">
          {(() => {
            const seat = seatMapData.seats.find(s => s.id === hoveredSeat)
            if (!seat) return null

            return (
              <div>
                <div className="font-medium text-sm mb-1">Seat {seat.id}</div>
                <div className="text-xs text-gray-600 mb-2">{seat.position}</div>
                <div className="text-sm font-medium text-primary mb-1">
                  {formatCurrency(seat.price)}
                </div>
                {seat.features.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-700">Features:</div>
                    <div className="flex flex-wrap gap-1">
                      {seat.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {getFeatureIcon(feature)}
                          <span className="ml-1">{feature.replace('_', ' ')}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })()}
        </Card>
      )}

      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Selected Seats</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedSeats.map((seatId) => {
                const seat = seatMapData.seats.find(s => s.id === seatId)
                if (!seat) return null

                return (
                  <div key={seatId} className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-primary text-white rounded flex items-center justify-center text-sm font-medium">
                        {seatId}
                      </div>
                      <div>
                        <div className="font-medium">Seat {seatId}</div>
                        <div className="text-sm text-gray-600">{seat.position} • {seat.type.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="font-medium text-primary">{formatCurrency(seat.price)}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSeatSelect(seatId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}

              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold text-lg text-primary">
                    {formatCurrency(calculateTotalPrice())}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Selected: {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''}
        </div>
        <Button
          onClick={handleConfirmSeats}
          disabled={selectedSeats.length === 0}
          className="flex items-center space-x-2"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Confirm Seats ({formatCurrency(calculateTotalPrice())})</span>
        </Button>
      </div>
    </div>
  )
}

export default SeatMap