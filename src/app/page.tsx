'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search,
  MapPin,
  Calendar,
  TrendingUp,
  Shield,
  Users,
  Clock,
  Star,
  ArrowRight,
  Plane,
  Hotel,
  Car,
  Package,
  CheckCircle,
  Globe,
  Heart,
  Tag,
  Phone,
  Mail,
  Play
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import FlightSearchForm from '@/components/forms/FlightSearchForm'
import Header from '@/components/layout/Header'
import { useFlightStore } from '@/store'
import { formatCurrency } from '@/lib/utils'
import { flightApi } from '@/lib/api'

const HomePage = () => {
  const router = useRouter()
  const { setSearchResults, setLoading, setSearchParams, setError } = useFlightStore()

  // Transform API flight format to frontend Flight type
  const transformApiFlightToFrontend = (apiFlight: any): any => {
    const cabinClass = 'economy'
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
        duration: 120,
        flightNumber: apiFlight.flightNumber || apiFlight.flight?.iata || '',
        aircraft: apiFlight.aircraft?.icao24 || 'Unknown'
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
      totalDuration: 120
    }
  }

  // Generate mock flights when API is unavailable
  const generateMockFlights = (params: any) => {
    const airlines = [
      { id: 'UA', name: 'United Airlines', code: 'UA', logo: '/airlines/ua.png', rating: 4.2 },
      { id: 'AA', name: 'American Airlines', code: 'AA', logo: '/airlines/aa.png', rating: 4.0 },
      { id: 'DL', name: 'Delta Air Lines', code: 'DL', logo: '/airlines/dl.png', rating: 4.5 },
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
          aircraft: ['Boeing 777', 'Airbus A350', 'Boeing 787'][index]
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
        amenities: ['WiFi', 'Meal', 'Entertainment'],
        carbonEmission: 150,
        isEcoFriendly: index === 0,
        stops: index === 0 ? 0 : 1,
        totalDuration: duration
      }
    })
  }

  const handleFlightSearch = async (searchData: any) => {
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

      // Store search params for display on results page
      setSearchParams(searchData)

      let transformedFlights: any[] = []

      try {
        const response = await flightApi.searchFlights(apiParams as any)

        if (response.success && response.flights && response.flights.length > 0) {
          transformedFlights = response.flights.map(transformApiFlightToFrontend)
        }
      } catch (apiErr: any) {
        console.warn('API call failed, using mock data:', apiErr.message || apiErr)
        transformedFlights = generateMockFlights(apiParams)
      }

      if (transformedFlights.length > 0) {
        setSearchResults(transformedFlights, transformedFlights.length)
        router.push('/flights/results')
      } else {
        setError('No flights found for this criteria. Please try different dates or destinations.')
      }
    } catch (error: any) {
      console.error('Search failed:', error)
      setError(error.message || 'An unexpected error occurred during search')
    } finally {
      setLoading(false)
    }
  }

  const popularDestinations = [
    {
      name: 'Paris',
      country: 'France',
      price: 549,
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop&auto=format',
      tagline: 'City of Light'
    },
    {
      name: 'Tokyo',
      country: 'Japan',
      price: 899,
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop&auto=format',
      tagline: 'Modern Metropolis'
    },
    {
      name: 'Barcelona',
      country: 'Spain',
      price: 429,
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&auto=format',
      tagline: 'Coastal Beauty'
    },
    {
      name: 'Dubai',
      country: 'UAE',
      price: 799,
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f31860?w=400&h=300&fit=crop&auto=format',
      tagline: 'Luxury Destination'
    }
  ]

  const features = [
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Advanced filters and AI-powered recommendations to find the perfect flight.'
    },
    {
      icon: Shield,
      title: 'Secure Booking',
      description: 'Your data is protected with bank-level encryption and secure payment processing.'
    },
    {
      icon: Tag,
      title: 'Best Prices',
      description: 'We guarantee the best prices with our price match promise.'
    },
    {
      icon: Users,
      title: '24/7 Support',
      description: 'Our dedicated support team is here to help you anytime, anywhere.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Frequent Traveler',
      content: 'MyTraveler has made booking flights so much easier. The interface is intuitive and I always find great deals!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&auto=format'
    },
    {
      name: 'Michael Chen',
      role: 'Business Traveler',
      content: 'As someone who travels frequently for work, I appreciate the reliability and customer service. Highly recommended!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&auto=format'
    },
    {
      name: 'Emma Davis',
      role: 'Family Traveler',
      content: 'Great for family vacations! Found amazing package deals and the booking process was smooth.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&auto=format'
    }
  ]

  const stats = [
    { number: '500+', label: 'Airlines' },
    { number: '10M+', label: 'Happy Travelers' },
    { number: '150+', label: 'Countries' },
    { number: '24/7', label: 'Support' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Header
        title="Discover Your Next Adventure"
        subtitle="Book Flights, Hotels & Complete Travel Packages"
        description="Your trusted partner for seamless travel experiences with the best prices and 24/7 support"
        backgroundImage="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&h=800&fit=crop&auto=format"
        showCTA={false}
      />

      {/* Search Form Section */}
      <section className="relative -mt-20 mb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FlightSearchForm onSubmit={handleFlightSearch} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose MyTraveler</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We make travel planning simple, secure, and affordable
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="text-center card-hover">
                  <CardContent className="pt-6">
                    <div className="feature-icon mx-auto mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Destinations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our most sought-after travel destinations with exclusive deals
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularDestinations.map((destination, index) => (
              <Card key={index} className="overflow-hidden card-hover cursor-pointer">
                <div className="relative">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                    <span className="text-sm font-semibold text-primary">
                      From {formatCurrency(destination.price)}
                    </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-1">{destination.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{destination.country}</p>
                  <p className="text-sm text-gray-500 italic mb-3">"{destination.tagline}"</p>
                  <Button variant="outline" className="w-full" size="sm">
                    Explore Flights
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Travel Solutions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need for your perfect trip in one place
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Plane,
                title: 'Flights',
                description: 'Search and book flights to any destination worldwide',
                href: '/flights'
              },
              {
                icon: Hotel,
                title: 'Hotels',
                description: 'Find the perfect accommodation for your stay',
                href: '/hotels'
              },
              {
                icon: Car,
                title: 'Car Rental',
                description: 'Rent a car for convenient travel at your destination',
                href: '/car-rental'
              },
              {
                icon: Package,
                title: 'Travel Packages',
                description: 'Save big with our curated travel packages',
                href: '/packages'
              }
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <Link key={index} href={item.href}>
                  <Card className="text-center card-hover h-full">
                    <CardContent className="pt-6">
                      <div className="feature-icon mx-auto mb-4">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                      <Button variant="outline" size="sm">
                        Learn More
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Travelers Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real reviews from real customers who trust MyTraveler
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="testimonial-card">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-6 italic">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex items-center">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join millions of travelers who trust MyTraveler for their journeys
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
              Start Planning
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              <Play className="h-5 w-5 mr-2" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage