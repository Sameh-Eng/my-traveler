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

const FlightSearchPage = () => {
  const router = useRouter()
  const { setLoading, setSearchResults, searchParams, setSearchParams, hasSearched } = useFlightStore()

  const handleFlightSearch = async (searchData: any) => {
    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Store search parameters
      setSearchParams(searchData)

      // Mock search results
      const mockResults = [
        {
          id: '1',
          airline: { name: 'SkyWings', code: 'SW', logo: '/airline-sw.png', rating: 4.5 },
          flightNumber: 'SW234',
          legs: [
            {
              from: { code: searchData.flights[0].from, name: 'Origin Airport', city: 'Origin City', country: 'USA', timezone: 'America/New_York' },
              to: { code: searchData.flights[0].to, name: 'Destination Airport', city: 'Destination City', country: 'USA', timezone: 'America/New_York' },
              departure: '2024-12-15T08:00:00Z',
              arrival: '2024-12-15T12:00:00Z',
              duration: 240,
              aircraft: 'Boeing 737'
            }
          ],
          price: { base: 299, taxes: 45, total: 344, currency: 'USD' },
          seats: { available: 25, cabinClass: searchData.cabinClass },
          stops: 0,
          totalDuration: 240,
          amenities: ['WiFi', 'Entertainment', 'Meals'],
          carbonEmission: 1200,
          isEcoFriendly: false
        },
        {
          id: '2',
          airline: { name: 'GlobalAir', code: 'GA', logo: '/airline-ga.png', rating: 4.3 },
          flightNumber: 'GA567',
          legs: [
            {
              from: { code: searchData.flights[0].from, name: 'Origin Airport', city: 'Origin City', country: 'USA', timezone: 'America/New_York' },
              to: { code: searchData.flights[0].to, name: 'Destination Airport', city: 'Destination City', country: 'USA', timezone: 'America/New_York' },
              departure: '2024-12-15T10:30:00Z',
              arrival: '2024-12-15T14:45:00Z',
              duration: 255,
              aircraft: 'Airbus A320'
            }
          ],
          price: { base: 279, taxes: 42, total: 321, currency: 'USD' },
          seats: { available: 18, cabinClass: searchData.cabinClass },
          stops: 0,
          totalDuration: 255,
          amenities: ['WiFi', 'Entertainment', 'Meals', 'Extra Legroom'],
          carbonEmission: 1275,
          isEcoFriendly: true
        },
        {
          id: '3',
          airline: { name: 'BudgetFly', code: 'BF', logo: '/airline-bf.png', rating: 4.0 },
          flightNumber: 'BF890',
          legs: [
            {
              from: { code: searchData.flights[0].from, name: 'Origin Airport', city: 'Origin City', country: 'USA', timezone: 'America/New_York' },
              to: { code: searchData.flights[0].to, name: 'Destination Airport', city: 'Destination City', country: 'USA', timezone: 'America/New_York' },
              departure: '2024-12-15T06:00:00Z',
              arrival: '2024-12-15T11:30:00Z',
              duration: 330,
              aircraft: 'Boeing 737'
            }
          ],
          price: { base: 199, taxes: 31, total: 230, currency: 'USD' },
          seats: { available: 8, cabinClass: searchData.cabinClass },
          stops: 1,
          totalDuration: 330,
          amenities: ['Entertainment'],
          carbonEmission: 1650,
          isEcoFriendly: false
        }
      ]

      setSearchResults(mockResults)

      // Navigate to results page
      router.push('/flights/results')
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
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
        <FlightSearchForm onSubmit={handleFlightSearch} />
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