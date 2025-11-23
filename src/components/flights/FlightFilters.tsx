'use client'

import React, { useState } from 'react'
import {
  Filter,
  X,
  Clock,
  DollarSign,
  Plane,
  MapPin,
  Users,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Label } from '@/components/ui/Label'
import { useFlightStore } from '@/store'
import { formatCurrency } from '@/lib/utils'

interface FlightFiltersProps {
  className?: string
  isOpen?: boolean
  onToggle?: () => void
}

const FlightFilters = ({ className = '', isOpen = true, onToggle }: FlightFiltersProps) => {
  const {
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    searchResults,
    getUniqueAirlines,
    getPriceRange
  } = useFlightStore()

  const [expandedSections, setExpandedSections] = useState<string[]>(['price', 'stops'])

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const airlines = getUniqueAirlines()
  const priceRange = getPriceRange()

  const handlePriceRangeChange = (type: 'min' | 'max', value: number) => {
    const newRange = [...filters.priceRange] as [number, number]
    if (type === 'min') {
      newRange[0] = Math.min(value, newRange[1] - 100)
    } else {
      newRange[1] = Math.max(value, newRange[0] + 100)
    }
    updateFilters({ priceRange: newRange })
  }

  const handleStopsChange = (stops: number, checked: boolean) => {
    const newStops = checked
      ? [...filters.stops, stops]
      : filters.stops.filter(s => s !== stops)
    updateFilters({ stops: newStops })
  }

  const handleAirlineChange = (airline: string, checked: boolean) => {
    const newAirlines = checked
      ? [...filters.airlines, airline]
      : filters.airlines.filter(a => a !== airline)
    updateFilters({ airlines: newAirlines })
  }

  const handleTimeRangeChange = (type: 'departure' | 'arrival', timeRange: any, checked: boolean) => {
    const key = `${type}TimeRanges`
    const currentTimeRanges = filters[key as keyof typeof filters] as any[]

    const newTimeRanges = checked
      ? [...currentTimeRanges, timeRange]
      : currentTimeRanges.filter((tr: any) => tr.label !== timeRange.label)

    updateFilters({ [key]: newTimeRanges })
  }

  const timeRanges = [
    { label: 'Morning', start: '06:00', end: '12:00' },
    { label: 'Afternoon', start: '12:00', end: '18:00' },
    { label: 'Evening', start: '18:00', end: '24:00' },
    { label: 'Night', start: '00:00', end: '06:00' }
  ]

  return (
    <div className={`${className}`}>
      {/* Mobile Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={onToggle}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters() && (
              <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                {Object.values(filters).filter((f, i) =>
                  i === 0 ? false : // Skip priceRange for count
                  Array.isArray(f) ? f.length > 0 : f
                ).length}
              </span>
            )}
          </div>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {/* Filters Content */}
      {(isOpen || !onToggle) && (
        <Card className="lg:sticky lg:top-24">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                disabled={!hasActiveFilters()}
                className="text-primary hover:text-primary/80"
              >
                Clear All
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Price Range */}
            <div>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('price')}
              >
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Price Range</span>
                </div>
                {expandedSections.includes('price') ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>

              {expandedSections.includes('price') && (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>{formatCurrency(filters.priceRange[0])}</span>
                    <span>{formatCurrency(filters.priceRange[1])}</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-gray-500">Min Price</Label>
                      <input
                        type="range"
                        min={priceRange[0]}
                        max={priceRange[1]}
                        value={filters.priceRange[0]}
                        onChange={(e) => handlePriceRangeChange('min', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Max Price</Label>
                      <input
                        type="range"
                        min={priceRange[0]}
                        max={priceRange[1]}
                        value={filters.priceRange[1]}
                        onChange={(e) => handlePriceRangeChange('max', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stops */}
            <div>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('stops')}
              >
                <div className="flex items-center space-x-2">
                  <Plane className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Stops</span>
                </div>
                {expandedSections.includes('stops') ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>

              {expandedSections.includes('stops') && (
                <div className="mt-3 space-y-2">
                  {[
                    { label: 'Non-stop', value: 0 },
                    { label: '1 Stop', value: 1 },
                    { label: '2+ Stops', value: 2 }
                  ].map(stop => (
                    <div key={stop.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`stops-${stop.value}`}
                        checked={filters.stops.includes(stop.value)}
                        onCheckedChange={(checked) => handleStopsChange(stop.value, checked as boolean)}
                      />
                      <Label htmlFor={`stops-${stop.value}`} className="text-sm">
                        {stop.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Airlines */}
            {airlines.length > 0 && (
              <div>
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('airlines')}
                >
                  <div className="flex items-center space-x-2">
                    <Plane className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Airlines</span>
                  </div>
                  {expandedSections.includes('airlines') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>

                {expandedSections.includes('airlines') && (
                  <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                    {airlines.map(airline => (
                      <div key={airline} className="flex items-center space-x-2">
                        <Checkbox
                          id={`airline-${airline}`}
                          checked={filters.airlines.includes(airline)}
                          onCheckedChange={(checked) => handleAirlineChange(airline, checked as boolean)}
                        />
                        <Label htmlFor={`airline-${airline}`} className="text-sm">
                          {airline}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Departure Time */}
            <div>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('departure')}
              >
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Departure Time</span>
                </div>
                {expandedSections.includes('departure') ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>

              {expandedSections.includes('departure') && (
                <div className="mt-3 space-y-2">
                  {timeRanges.map(timeRange => (
                    <div key={timeRange.label} className="flex items-center space-x-2">
                      <Checkbox
                        id={`departure-${timeRange.label}`}
                        checked={filters.departureTimeRanges.some(tr => tr.label === timeRange.label)}
                        onCheckedChange={(checked) => handleTimeRangeChange('departure', timeRange, checked as boolean)}
                      />
                      <Label htmlFor={`departure-${timeRange.label}`} className="text-sm">
                        {timeRange.label} ({timeRange.start} - {timeRange.end})
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Arrival Time */}
            <div>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('arrival')}
              >
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Arrival Time</span>
                </div>
                {expandedSections.includes('arrival') ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>

              {expandedSections.includes('arrival') && (
                <div className="mt-3 space-y-2">
                  {timeRanges.map(timeRange => (
                    <div key={timeRange.label} className="flex items-center space-x-2">
                      <Checkbox
                        id={`arrival-${timeRange.label}`}
                        checked={filters.arrivalTimeRanges.some(tr => tr.label === timeRange.label)}
                        onCheckedChange={(checked) => handleTimeRangeChange('arrival', timeRange, checked as boolean)}
                      />
                      <Label htmlFor={`arrival-${timeRange.label}`} className="text-sm">
                        {timeRange.label} ({timeRange.start} - {timeRange.end})
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="direct-flights"
                  checked={filters.directFlightsOnly}
                  onCheckedChange={(checked) => updateFilters({ directFlightsOnly: checked as boolean })}
                />
                <Label htmlFor="direct-flights" className="text-sm">
                  Direct flights only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="eco-friendly"
                  checked={filters.ecoFriendlyOnly}
                  onCheckedChange={(checked) => updateFilters({ ecoFriendlyOnly: checked as boolean })}
                />
                <Label htmlFor="eco-friendly" className="text-sm">
                  Eco-friendly flights only
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default FlightFilters