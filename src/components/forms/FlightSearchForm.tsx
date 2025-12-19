'use client'

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Calendar,
  Users,
  Plane,
  MapPin,
  Search,
  Plus,
  X,
  ArrowLeftRight,
  ChevronDown,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Checkbox } from '@/components/ui/Checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import { Label } from '@/components/ui/Label'
import { formatCurrency, formatDate } from '@/lib/utils'
import { FlightSearch } from '@/types'

// Form validation schema
const flightSearchSchema = z.object({
  tripType: z.enum(['one-way', 'round-trip', 'multi-city']),
  flights: z.array(z.object({
    from: z.string().min(3, 'From airport required'),
    to: z.string().min(3, 'To airport required'),
    departureDate: z.string().min(1, 'Departure date required'),
    returnDate: z.string().optional(),
  })).min(1).max(4),
  passengers: z.object({
    adults: z.number().min(1, 'At least one adult required').max(9, 'Maximum 9 adults'),
    children: z.number().min(0).max(8, 'Maximum 8 children'),
    infants: z.number().min(0).max(4, 'Maximum 4 infants'),
  }),
  cabinClass: z.enum(['economy', 'premium-economy', 'business', 'first']),
  flexible: z.object({
    enabled: z.boolean(),
    days: z.number().min(1).max(7),
  }),
  filters: z.object({
    directFlightsOnly: z.boolean(),
    nearbyAirports: z.boolean(),
  }),
}).refine((data) => {
  if (data.tripType === 'round-trip') {
    const flight = data.flights[0]
    if (flight.returnDate && flight.departureDate) {
      return new Date(flight.returnDate) > new Date(flight.departureDate)
    }
  }
  return true
}, {
  message: 'Return date must be after departure date',
  path: ['flights', 0, 'returnDate'],
})

type FlightSearchFormData = z.infer<typeof flightSearchSchema>

interface FlightSearchFormProps {
  onSubmit: (data: FlightSearch) => void
  loading?: boolean
  className?: string
  compact?: boolean
}

const popularAirports = [
  { code: 'NYC', name: 'New York City', country: 'USA' },
  { code: 'LON', name: 'London', country: 'UK' },
  { code: 'PAR', name: 'Paris', country: 'France' },
  { code: 'LAX', name: 'Los Angeles', country: 'USA' },
  { code: 'TKO', name: 'Tokyo', country: 'Japan' },
  { code: 'SYD', name: 'Sydney', country: 'Australia' },
  { code: 'DXB', name: 'Dubai', country: 'UAE' },
  { code: 'SIN', name: 'Singapore', country: 'Singapore' },
]

const FlightSearchForm = ({ onSubmit, loading = false, className = '', compact = false }: FlightSearchFormProps) => {
  const [showPassengerSelector, setShowPassengerSelector] = useState(false)
  const [tripType, setTripType] = useState<'one-way' | 'round-trip' | 'multi-city'>('round-trip')

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors }
  } = useForm<FlightSearchFormData>({
    resolver: zodResolver(flightSearchSchema),
    mode: 'onSubmit', // Only validate on submit, not onChange
    defaultValues: {
      tripType: 'round-trip',
      flights: [
        { from: '', to: '', departureDate: '', returnDate: '' }
      ],
      passengers: {
        adults: 1,
        children: 0,
        infants: 0,
      },
      cabinClass: 'economy',
      flexible: {
        enabled: false,
        days: 3,
      },
      filters: {
        directFlightsOnly: false,
        nearbyAirports: false,
      },
    },
  })

  const watchedFlights = watch('flights')
  const watchedPassengers = watch('passengers')
  const watchedCabinClass = watch('cabinClass')

  const addFlightLeg = () => {
    if (watchedFlights.length < 4) {
      setValue('flights', [...watchedFlights, { from: '', to: '', departureDate: '', returnDate: '' }])
    }
  }

  const removeFlightLeg = (index: number) => {
    const newFlights = watchedFlights.filter((_, i) => i !== index)
    setValue('flights', newFlights)
  }

  const swapAirports = (index: number) => {
    const flight = watchedFlights[index]
    setValue(`flights.${index}.from`, flight.to)
    setValue(`flights.${index}.to`, flight.from)
  }

  const getPassengerSummary = () => {
    const { adults, children, infants } = watchedPassengers
    const total = adults + children + infants
    const parts = []

    if (adults > 0) parts.push(`${adults} Adult${adults > 1 ? 's' : ''}`)
    if (children > 0) parts.push(`${children} Child${children > 1 ? 'ren' : ''}`)
    if (infants > 0) parts.push(`${infants} Infant${infants > 1 ? 's' : ''}`)

    return `${total} ${parts.join(', ')}`
  }

  const onFormSubmit = (data: FlightSearchFormData) => {
    console.log('=== Form Submit Debug ===')
    console.log('Raw form data:', JSON.stringify(data, null, 2))

    // Transform form data to API format
    const flightSearchData: FlightSearch = {
      tripType: data.tripType,
      passengers: data.passengers,
      cabinClass: data.cabinClass as any,
      flights: data.flights.map(flight => ({
        from: flight.from,
        to: flight.to,
        departureDate: flight.departureDate,
        ...(data.tripType === 'round-trip' && flight.returnDate && { returnDate: flight.returnDate })
      })),
      flexible: data.flexible,
      filters: {
        ...(data.filters.directFlightsOnly && { maxStops: 0 }),
      }
    }

    console.log('Transformed flightSearchData:', JSON.stringify(flightSearchData, null, 2))
    onSubmit(flightSearchData)
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg ${compact ? 'p-6' : 'p-8'} ${className}`}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Trip Type Selector */}
        <Controller
          name="tripType"
          control={control}
          render={({ field }) => (
            <Tabs value={field.value} onValueChange={(value) => {
              field.onChange(value)
              setTripType(value as any)
              // Reset flights when changing trip type
              setValue('flights', [{ from: '', to: '', departureDate: '', returnDate: '' }])
            }}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="one-way">One Way</TabsTrigger>
                <TabsTrigger value="round-trip">Round Trip</TabsTrigger>
                <TabsTrigger value="multi-city">Multi City</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        />

        {/* Flight Legs */}
        <div className="space-y-4">
          {watchedFlights.map((flight, index) => (
            <div key={index} className="relative">
              {index > 0 && (
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300" />
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Leg Number */}
                {tripType === 'multi-city' && (
                  <div className="hidden md:flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                  </div>
                )}

                {/* From Airport */}
                <div className={tripType === 'multi-city' ? 'md:col-span-3' : 'md:col-span-5'}>
                  <div className="relative">
                    <Input
                      {...register(`flights.${index}.from`)}
                      placeholder="From where?"
                      leftIcon={<MapPin className="h-4 w-4" />}
                      error={!!errors.flights?.[index]?.from}
                      className="pr-10"
                    />
                    <Select>
                      <SelectTrigger className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 border-none bg-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {popularAirports.map(airport => (
                          <SelectItem
                            key={airport.code}
                            value={airport.code}
                            onClick={() => setValue(`flights.${index}.from`, airport.code)}
                          >
                            <div>
                              <div className="font-medium">{airport.code}</div>
                              <div className="text-sm text-gray-500">{airport.name}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.flights?.[index]?.from && (
                    <p className="text-xs text-red-600 mt-1">{errors.flights[index]?.from?.message}</p>
                  )}
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => swapAirports(index)}
                    className="rotate-90 md:rotate-0"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* To Airport */}
                <div className={tripType === 'multi-city' ? 'md:col-span-3' : 'md:col-span-5'}>
                  <div className="relative">
                    <Input
                      {...register(`flights.${index}.to`)}
                      placeholder="To where?"
                      leftIcon={<MapPin className="h-4 w-4" />}
                      error={!!errors.flights?.[index]?.to}
                      className="pr-10"
                    />
                    <Select>
                      <SelectTrigger className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 border-none bg-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {popularAirports.map(airport => (
                          <SelectItem
                            key={airport.code}
                            value={airport.code}
                            onClick={() => setValue(`flights.${index}.to`, airport.code)}
                          >
                            <div>
                              <div className="font-medium">{airport.code}</div>
                              <div className="text-sm text-gray-500">{airport.name}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.flights?.[index]?.to && (
                    <p className="text-xs text-red-600 mt-1">{errors.flights[index]?.to?.message}</p>
                  )}
                </div>

                {/* Dates */}
                <div className={tripType === 'multi-city' ? 'md:col-span-4' : 'md:col-span-2'}>
                  <Input
                    {...register(`flights.${index}.departureDate`)}
                    type="date"
                    leftIcon={<Calendar className="h-4 w-4" />}
                    error={!!errors.flights?.[index]?.departureDate}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.flights?.[index]?.departureDate && (
                    <p className="text-xs text-red-600 mt-1">{errors.flights[index]?.departureDate?.message}</p>
                  )}
                </div>

                {/* Return Date (for round-trip) */}
                {tripType === 'round-trip' && index === 0 && (
                  <div className="md:col-span-2">
                    <Input
                      {...register(`flights.${index}.returnDate`)}
                      type="date"
                      placeholder="Return"
                      leftIcon={<Calendar className="h-4 w-4" />}
                      error={!!errors.flights?.[index]?.returnDate}
                      min={watchedFlights[0]?.departureDate || new Date().toISOString().split('T')[0]}
                    />
                    {errors.flights?.[index]?.returnDate && (
                      <p className="text-xs text-red-600 mt-1">{errors.flights[index]?.returnDate?.message}</p>
                    )}
                  </div>
                )}

                {/* Remove Leg Button (for multi-city) */}
                {tripType === 'multi-city' && index > 0 && (
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFlightLeg(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add Flight Leg Button (for multi-city) */}
          {tripType === 'multi-city' && watchedFlights.length < 4 && (
            <Button
              type="button"
              variant="outline"
              onClick={addFlightLeg}
              className="w-full border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Flight
            </Button>
          )}
        </div>

        {/* Passengers and Class */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Passengers */}
          <div className="relative">
            <div
              className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              onClick={() => setShowPassengerSelector(!showPassengerSelector)}
            >
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900">{getPassengerSummary()}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>

            {/* Passenger Selector Dropdown */}
            {showPassengerSelector && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 p-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Adults (12+)</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setValue('passengers.adults', Math.max(1, watchedPassengers.adults - 1))}
                        disabled={watchedPassengers.adults <= 1}
                      >
                        -
                      </Button>
                      <span className="w-12 text-center">{watchedPassengers.adults}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setValue('passengers.adults', Math.min(9, watchedPassengers.adults + 1))}
                        disabled={watchedPassengers.adults >= 9}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Children (2-11)</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setValue('passengers.children', Math.max(0, watchedPassengers.children - 1))}
                        disabled={watchedPassengers.children <= 0}
                      >
                        -
                      </Button>
                      <span className="w-12 text-center">{watchedPassengers.children}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setValue('passengers.children', Math.min(8, watchedPassengers.children + 1))}
                        disabled={watchedPassengers.children >= 8}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Infants (under 2)</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setValue('passengers.infants', Math.max(0, watchedPassengers.infants - 1))}
                        disabled={watchedPassengers.infants <= 0}
                      >
                        -
                      </Button>
                      <span className="w-12 text-center">{watchedPassengers.infants}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setValue('passengers.infants', Math.min(4, watchedPassengers.infants + 1))}
                        disabled={watchedPassengers.infants >= 4}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cabin Class */}
          <Controller
            name="cabinClass"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                defaultValue="economy"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="premium-economy">Premium Economy</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="first">First Class</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Options */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <Controller
                  name="flexible.enabled"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label className="text-sm">Flexible dates</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="filters.directFlightsOnly"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label className="text-sm">Direct flights only</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="filters.nearbyAirports"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label className="text-sm">Include nearby airports</Label>
              </div>
            </div>

            {/* Search Button */}
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="w-full sm:w-auto btn-glow"
              leftIcon={<Search className="h-4 w-4" />}
            >
              Search Flights
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default FlightSearchForm