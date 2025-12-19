'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  TrendingUp,
  Star,
  Users,
  Tag,
  ArrowRight,
  Plane,
  Hotel,
  Car
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import FlightSearchForm from '@/components/forms/FlightSearchForm'
import { useFlightStore } from '@/store'
import { formatCurrency } from '@/lib/utils'
import { flightApi } from '@/lib/api'

const FlightSearchPage = () => {
  const router = useRouter()
  const { loading, setLoading, setSearchResults, searchParams, setSearchParams, hasSearched, error, setError } = useFlightStore()

  // Transform API flight format to frontend Flight type
  const transformApiFlightToFrontend = (apiFlight: any): any => {
    const cabinClass = 'economy' // Default, could be passed from search params
    const price = apiFlight.price?.[cabinClass] || apiFlight.price?.economy || 0

    return {
      id: apiFlight.flightId || apiFlight.id,
      airline: {
        id: apiFlight.airline?.iata || apiFlight.airline?.icao || 'UNK',
        name: apiFlight.airline?.name || 'Unknown Airline',
        code: apiFlight.airline?.iata || apiFlight.airline?.icao || 'UNK',
        logo: `/airlines/${(apiFlight.airline?.iata || 'default').toLowerCase()}.png`,
        rating: 4.5
      },
      legs: [{
        id: `leg-${apiFlight.flightId}`,
        from: {
          code: apiFlight.departure?.iata || '',
          name: apiFlight.departure?.airport || '',
          city: apiFlight.departure?.airport || '',
          country: '',
          timezone: apiFlight.departure?.timezone || ''
        },
        to: {
          code: apiFlight.arrival?.iata || '',
          name: apiFlight.arrival?.airport || '',
          city: apiFlight.arrival?.airport || '',
          country: '',
          timezone: apiFlight.arrival?.timezone || ''
        },
        departure: apiFlight.departure?.scheduled || '',
        arrival: apiFlight.arrival?.scheduled || '',
        duration: parseDuration(apiFlight.duration),
        flightNumber: apiFlight.flightNumber || apiFlight.flight?.iata || '',
        aircraft: apiFlight.aircraft?.icao24 || 'Unknown',
        terminal: apiFlight.departure?.terminal,
        gate: apiFlight.departure?.gate
      }],
      price: {
        base: price * 0.85,
        taxes: price * 0.1,
        fees: price * 0.05,
        total: price,
        currency: 'USD'
      },
      seats: {
        available: apiFlight.seats?.[cabinClass] || 10,
        cabinClass: cabinClass as any
      },
      amenities: ['Wifi', 'Meal', 'Entertainment'],
      carbonEmission: 150,
      isEcoFriendly: false,
      stops: 0,
      totalDuration: parseDuration(apiFlight.duration)
    }
  }

  // Helper function to parse duration string like "2h 20m" to minutes
  const parseDuration = (durationStr: string): number => {
    if (!durationStr) return 120
    const hoursMatch = durationStr.match(/(\d+)h/)
    const minutesMatch = durationStr.match(/(\d+)m/)
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0
    return hours * 60 + minutes
  }

  const handleFlightSearch = async (searchData: any) => {
    console.log('=== Flight Search Debug ===')
    console.log('Raw searchData:', JSON.stringify(searchData, null, 2))

    setLoading(true)
    setError(null)

    try {
      // Transform frontend form data to backend API format
      const firstFlight = searchData.flights?.[0] || {}
      const apiParams = {
        origin: firstFlight.from?.toUpperCase() || '',
        destination: firstFlight.to?.toUpperCase() || '',
        departureDate: firstFlight.departureDate || '',
        returnDate: firstFlight.returnDate || undefined,
        adults: searchData.passengers?.adults || 1,
        children: searchData.passengers?.children || 0,
        infants: searchData.passengers?.infants || 0,
        cabinClass: searchData.cabinClass || 'economy',
        direct: searchData.filters?.directFlightsOnly || false,
        tripType: searchData.tripType || 'one-way'
      }

      // Call Flight API
      console.log('Initiating flight search with:', apiParams)

      let transformedFlights: any[] = []

      try {
        const response = await flightApi.searchFlights(apiParams as any)
        console.log('Flight search response:', response)

        if (response.success && response.flights && response.flights.length > 0) {
          // Transform API flights to frontend format
          transformedFlights = response.flights.map(transformApiFlightToFrontend)
        }
      } catch (apiErr: any) {
        console.warn('API call failed, using mock data:', apiErr.message || apiErr)
        // Fallback to mock data when API is unavailable
        transformedFlights = generateMockFlights(apiParams)
      }

      if (transformedFlights.length > 0) {
        setSearchResults(transformedFlights, transformedFlights.length)
        // Navigate to results page
        router.push('/flights/results')
      } else {
        setError('No flights found for this criteria. Please try different dates or destinations.')
      }

    } catch (err: any) {
      console.error('Search failed:', err)
      // Extract message from various error formats
      let errorMessage = 'An unexpected error occurred during search'
      if (typeof err === 'string') {
        errorMessage = err
      } else if (err?.message) {
        errorMessage = err.message
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err?.response?.data?.errors) {
        errorMessage = err.response.data.errors.map((e: any) => e.msg).join(', ')
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Generate mock flights when API is unavailable
  const generateMockFlights = (params: any) => {
    const airlines = [
      { id: 'UA', name: 'United Airlines', code: 'UA', logo: '/airlines/ua.png', rating: 4.2 },
      { id: 'AA', name: 'American Airlines', code: 'AA', logo: '/airlines/aa.png', rating: 4.0 },
      { id: 'DL', name: 'Delta Air Lines', code: 'DL', logo: '/airlines/dl.png', rating: 4.5 },
      { id: 'BA', name: 'British Airways', code: 'BA', logo: '/airlines/ba.png', rating: 4.3 },
      { id: 'EK', name: 'Emirates', code: 'EK', logo: '/airlines/ek.png', rating: 4.8 },
    ]

    const baseDate = new Date(params.departureDate || new Date())

    return airlines.map((airline, index) => {
      const departureHour = 6 + (index * 3)
      const duration = 120 + (index * 45)
      const departureTime = new Date(baseDate)
      departureTime.setHours(departureHour, 0, 0, 0)
      const arrivalTime = new Date(departureTime.getTime() + duration * 60000)

      const basePrice = 250 + (index * 75) + Math.floor(Math.random() * 100)

      return {
        id: `mock-flight-${index + 1}`,
        airline,
        legs: [{
          id: `leg-${index + 1}`,
          from: {
            code: params.origin || 'NYC',
            name: `${params.origin || 'NYC'} International Airport`,
            city: params.origin || 'New York',
            country: 'USA',
            timezone: 'America/New_York'
          },
          to: {
            code: params.destination || 'LON',
            name: `${params.destination || 'LON'} International Airport`,
            city: params.destination || 'London',
            country: 'UK',
            timezone: 'Europe/London'
          },
          departure: departureTime.toISOString(),
          arrival: arrivalTime.toISOString(),
          duration,
          flightNumber: `${airline.code}${1000 + index * 111}`,
          aircraft: ['Boeing 777-300ER', 'Airbus A350-900', 'Boeing 787-9', 'Airbus A380-800', 'Boeing 737 MAX'][index],
          terminal: String(Math.floor(Math.random() * 5) + 1),
          gate: `${String.fromCharCode(65 + index)}${Math.floor(Math.random() * 30) + 1}`
        }],
        price: {
          base: basePrice * 0.85,
          taxes: basePrice * 0.1,
          fees: basePrice * 0.05,
          total: basePrice,
          currency: 'USD'
        },
        seats: {
          available: 5 + Math.floor(Math.random() * 20),
          cabinClass: params.cabinClass || 'economy'
        },
        amenities: ['WiFi', 'Meal', 'Entertainment', 'USB Power'],
        carbonEmission: 150 + (duration * 0.5),
        isEcoFriendly: index % 3 === 0,
        stops: index === 0 ? 0 : index % 3 === 0 ? 0 : 1,
        totalDuration: duration
      }
    })
  }

  const popularRoutes = [
    { from: 'NYC', to: 'LON', price: 450, description: 'New York to London' },
    { from: 'LAX', to: 'NYC', price: 280, description: 'Los Angeles to New York' },
    { from: 'CHI', to: 'MIA', price: 220, description: 'Chicago to Miami' },
    { from: 'SFO', to: 'SEA', price: 180, description: 'San Francisco to Seattle' }
  ]

  const trendingDestinations = [
    {
      city: 'Barcelona',
      country: 'Spain',
      price: 599,
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&auto=format',
      hotDeal: true
    },
    {
      city: 'Tokyo',
      country: 'Japan',
      price: 899,
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop&auto=format',
      hotDeal: false
    },
    {
      city: 'Dubai',
      country: 'UAE',
      price: 799,
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f31860?w=400&h=300&fit=crop&auto=format',
      hotDeal: true
    },
    {
      city: 'Paris',
      country: 'France',
      price: 650,
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop&auto=format',
      hotDeal: false
    }
  ]

  const travelTips = [
    {
      icon: Calendar,
      title: 'Book in Advance',
      description: 'Save up to 30% by booking 21-60 days before your trip'
    },
    {
      icon: Clock,
      title: 'Flexible Dates',
      description: 'Travel on weekdays or off-peak seasons for better deals'
    },
    {
      icon: Users,
      title: 'Group Discounts',
      description: 'Special rates for groups of 10 or more travelers'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary to-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect Flight
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Search millions of flights from hundreds of airlines to find the best deals for your journey
            </p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <FlightSearchForm onSubmit={handleFlightSearch} loading={loading} />
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            <p className="font-semibold">Search Failed</p>
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Popular Routes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Routes</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our most searched flight routes with competitive prices
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularRoutes.map((route, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span className="font-medium">{route.from}</span>
                  </div>
                  <Plane className="h-4 w-4 text-gray-400 transform rotate-90" />
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{route.to}</span>
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-1">{route.description}</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-500">From</span>
                    <div className="text-xl font-bold text-primary">
                      {formatCurrency(route.price)}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trending Destinations */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trending Destinations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover hot destinations with exclusive flight deals
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingDestinations.map((destination, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative">
                  <img
                    src={destination.image}
                    alt={destination.city}
                    className="w-full h-48 object-cover"
                  />
                  {destination.hotDeal && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Hot Deal
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-1">{destination.city}</h3>
                  <p className="text-gray-600 mb-3">{destination.country}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-500">Flights from</span>
                      <div className="text-xl font-bold text-primary">
                        {formatCurrency(destination.price)}
                      </div>
                    </div>
                    <Button size="sm">
                      Explore
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Tips */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Smart Travel Tips</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Save money and travel smarter with these expert tips
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {travelTips.map((tip, index) => {
            const Icon = tip.icon
            return (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="feature-icon mx-auto mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{tip.title}</h3>
                  <p className="text-gray-600 text-sm">{tip.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Additional Services */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Travel Solutions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Book everything you need for your perfect trip
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Hotel,
                title: 'Hotels',
                description: 'Find the perfect accommodation with exclusive rates',
                href: '/hotels'
              },
              {
                icon: Car,
                title: 'Car Rentals',
                description: 'Rent a car for convenient travel at your destination',
                href: '/car-rental'
              },
              {
                icon: Tag,
                title: 'Travel Packages',
                description: 'Save big with our curated flight and hotel packages',
                href: '/packages'
              }
            ].map((service, index) => {
              const Icon = service.icon
              return (
                <Card key={index} className="text-center hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="feature-icon mx-auto mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                    <Button variant="outline" size="sm">
                      Explore {service.title}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

export default FlightSearchPage