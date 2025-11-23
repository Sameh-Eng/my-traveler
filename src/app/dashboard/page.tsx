'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  User,
  Plane,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  CreditCard,
  Download,
  Star,
  TrendingUp,
  Award,
  MapPin,
  Users,
  Settings,
  LogOut,
  Search,
  Filter,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  Share2,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Select } from '@/components/ui/Select'
import { Loading } from '@/components/ui/Loading'
import Sidebar from '@/components/layout/Sidebar'
import { useAuthStore } from '@/store'
import { formatCurrency, formatDate, formatTime, getRelativeTime, getFlightStatus } from '@/lib/utils'

interface Booking {
  id: string
  reference: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  createdAt: string
  flights: Array<{
    id: string
    airline: { name: string; code: string; logo: string }
    flightNumber: string
    legs: Array<{
      from: { code: string; name: string; city: string; country: string }
      to: { code: string; name: string; city: string; country: string }
      departure: string
      arrival: string
      duration: number
    }>
    cabin: string
  }>
  passengers: Array<{
    id: string
    firstName: string
    lastName: string
    type: string
  }>
  pricing: {
    basePrice: number
    taxes: number
    fees: number
    totalAmount: number
  }
  paymentStatus: 'paid' | 'pending' | 'refunded' | 'partially_refunded'
  checkInStatus: {
    available: boolean
    completed: boolean
    opensAt?: string
  }
}

const DashboardPage = () => {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_desc')
  const [activeTab, setActiveTab] = useState('bookings')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    loadBookings()
  }, [])

  useEffect(() => {
    filterAndSortBookings()
  }, [bookings, searchTerm, statusFilter, sortBy])

  const loadBookings = async () => {
    try {
      // Mock data - in a real app, this would fetch from API
      const mockBookings: Booking[] = [
        {
          id: '1',
          reference: 'ABC123',
          status: 'confirmed',
          createdAt: '2024-03-10T10:00:00Z',
          flights: [{
            id: 'FL1',
            airline: { name: 'SkyWings', code: 'SW', logo: '/api/placeholder/32/32' },
            flightNumber: 'SW234',
            legs: [{
              from: { code: 'JFK', name: 'New York JFK', city: 'New York', country: 'USA' },
              to: { code: 'LAX', name: 'Los Angeles LAX', city: 'Los Angeles', country: 'USA' },
              departure: '2024-04-15T10:00:00Z',
              arrival: '2024-04-15T13:30:00Z',
              duration: 330
            }],
            cabin: 'economy'
          }],
          passengers: [
            { id: '1', firstName: 'John', lastName: 'Doe', type: 'adult' },
            { id: '2', firstName: 'Jane', lastName: 'Doe', type: 'adult' }
          ],
          pricing: {
            basePrice: 1299,
            taxes: 189,
            fees: 45,
            totalAmount: 1533
          },
          paymentStatus: 'paid',
          checkInStatus: {
            available: false,
            completed: false,
            opensAt: '2024-04-14T10:00:00Z'
          }
        },
        {
          id: '2',
          reference: 'DEF456',
          status: 'completed',
          createdAt: '2024-02-15T14:30:00Z',
          flights: [{
            id: 'FL2',
            airline: { name: 'AirConnect', code: 'AC', logo: '/api/placeholder/32/32' },
            flightNumber: 'AC567',
            legs: [{
              from: { code: 'LAX', name: 'Los Angeles LAX', city: 'Los Angeles', country: 'USA' },
              to: { code: 'ORD', name: 'Chicago O\'Hare', city: 'Chicago', country: 'USA' },
              departure: '2024-02-20T08:00:00Z',
              arrival: '2024-02-20T14:15:00Z',
              duration: 255
            }],
            cabin: 'business'
          }],
          passengers: [
            { id: '3', firstName: 'John', lastName: 'Doe', type: 'adult' }
          ],
          pricing: {
            basePrice: 2400,
            taxes: 325,
            fees: 75,
            totalAmount: 2800
          },
          paymentStatus: 'paid',
          checkInStatus: {
            available: true,
            completed: true
          }
        },
        {
          id: '3',
          reference: 'GHI789',
          status: 'pending',
          createdAt: '2024-03-12T16:45:00Z',
          flights: [{
            id: 'FL3',
            airline: { name: 'EuroSky', code: 'ES', logo: '/api/placeholder/32/32' },
            flightNumber: 'ES890',
            legs: [{
              from: { code: 'ORD', name: 'Chicago O\'Hare', city: 'Chicago', country: 'USA' },
              to: { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'UK' },
              departure: '2024-05-10T18:00:00Z',
              arrival: '2024-05-11T07:30:00Z',
              duration: 450
            }],
            cabin: 'premium_economy'
          }],
          passengers: [
            { id: '4', firstName: 'John', lastName: 'Doe', type: 'adult' },
            { id: '5', firstName: 'Sarah', lastName: 'Doe', type: 'adult' }
          ],
          pricing: {
            basePrice: 1899,
            taxes: 275,
            fees: 85,
            totalAmount: 2259
          },
          paymentStatus: 'pending',
          checkInStatus: {
            available: false,
            completed: false,
            opensAt: '2024-05-09T18:00:00Z'
          }
        }
      ]

      setBookings(mockBookings)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load bookings:', error)
      setLoading(false)
    }
  }

  const filterAndSortBookings = () => {
    let filtered = bookings

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.flights.some(flight =>
          flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          flight.airline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          flight.legs.some(leg =>
            leg.from.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            leg.to.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            leg.from.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            leg.to.city.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'created_desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'departure_asc':
          const aFirstDeparture = new Date(a.flights[0].legs[0].departure).getTime()
          const bFirstDeparture = new Date(b.flights[0].legs[0].departure).getTime()
          return aFirstDeparture - bFirstDeparture
        case 'departure_desc':
          const aDeparture = new Date(a.flights[0].legs[0].departure).getTime()
          const bDeparture = new Date(b.flights[0].legs[0].departure).getTime()
          return bDeparture - aDeparture
        case 'amount_asc':
          return a.pricing.totalAmount - b.pricing.totalAmount
        case 'amount_desc':
          return b.pricing.totalAmount - a.pricing.totalAmount
        default:
          return 0
      }
    })

    setFilteredBookings(filtered)
  }

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: Booking['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-800">Refunded</Badge>
      case 'partially_refunded':
        return <Badge className="bg-orange-100 text-orange-800">Partially Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCheckInBadge = (checkInStatus: Booking['checkInStatus']) => {
    if (checkInStatus.completed) {
      return <Badge className="bg-green-100 text-green-800">Checked In</Badge>
    } else if (checkInStatus.available) {
      return <Badge className="bg-blue-100 text-blue-800">Available</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Opens {formatDate(checkInStatus.opensAt!)}</Badge>
    }
  }

  const stats = {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    completedFlights: bookings.filter(b => b.status === 'completed').length,
    totalSpent: bookings.reduce((sum, b) => sum + b.pricing.totalAmount, 0),
    milesEarned: bookings.filter(b => b.status === 'completed').length * 500 // Mock calculation
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading message="Loading your dashboard..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="bg-white border-b">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>
                  <p className="text-gray-600">Manage your bookings and travel preferences</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button size="sm">
                    <Plane className="h-4 w-4 mr-2" />
                    Book New Flight
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Plane className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stats.totalBookings}</div>
                      <div className="text-sm text-gray-600">Total Bookings</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stats.confirmedBookings}</div>
                      <div className="text-sm text-gray-600">Upcoming Flights</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stats.totalSpent.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total Spent</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Award className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stats.milesEarned.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Miles Earned</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Dashboard Content */}
          <div className="px-6 pb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="bookings">My Bookings</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming Flights</TabsTrigger>
                <TabsTrigger value="past">Past Flights</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="space-y-6">
                {/* Search and Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle>My Bookings</CardTitle>
                    <CardDescription>View and manage all your flight bookings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <Input
                          placeholder="Search by booking reference, flight number, or destination..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          leftIcon={<Search className="h-4 w-4" />}
                        />
                      </div>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <option value="all">All Statuses</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </Select>
                      <Select
                        value={sortBy}
                        onValueChange={setSortBy}
                      >
                        <option value="created_desc">Newest First</option>
                        <option value="created_asc">Oldest First</option>
                        <option value="departure_asc">Departure Soon</option>
                        <option value="departure_desc">Departure Later</option>
                        <option value="amount_desc">Highest Amount</option>
                        <option value="amount_asc">Lowest Amount</option>
                      </Select>
                      <Button variant="outline" onClick={() => {
                        setSearchTerm('')
                        setStatusFilter('all')
                        setSortBy('created_desc')
                      }}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Bookings List */}
                <div className="space-y-4">
                  {filteredBookings.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Plane className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
                        <p className="text-gray-600 mb-6">
                          {searchTerm || statusFilter !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'You haven\'t made any bookings yet'}
                        </p>
                        <Link href="/flights">
                          <Button>
                            <Plane className="h-4 w-4 mr-2" />
                            Search Flights
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredBookings.map((booking) => (
                      <Card key={booking.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="font-semibold text-lg">{booking.reference}</span>
                                {getStatusBadge(booking.status)}
                                {getPaymentStatusBadge(booking.paymentStatus)}
                                {getCheckInBadge(booking.checkInStatus)}
                              </div>
                              <div className="text-sm text-gray-600">
                                Booked {getRelativeTime(booking.createdAt)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                              <Button variant="outline" size="sm">
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {booking.flights.map((flight) =>
                              flight.legs.map((leg, legIndex) => (
                                <div key={legIndex} className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                    <Plane className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium">{leg.from.code}</span>
                                      <ArrowRight className="h-3 w-3 text-gray-400" />
                                      <span className="font-medium">{leg.to.code}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {flight.airline.name} {flight.flightNumber}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {formatDate(leg.departure)} • {formatTime(leg.departure)}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-600">
                                {booking.passengers.length} passenger{booking.passengers.length !== 1 ? 's' : ''}
                              </span>
                              <span className="text-sm text-gray-600">
                                {booking.flights[0].cabin.replace('_', ' ')} class
                              </span>
                            </div>
                            <div className="text-lg font-semibold text-primary">
                              {formatCurrency(booking.pricing.totalAmount)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Flights</CardTitle>
                    <CardDescription>Your confirmed flights for the future</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bookings.filter(b => b.status === 'confirmed').length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming flights</h3>
                        <p className="text-gray-600 mb-6">Book your next adventure!</p>
                        <Link href="/flights">
                          <Button>
                            <Plane className="h-4 w-4 mr-2" />
                            Search Flights
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.filter(b => b.status === 'confirmed').map((booking) => (
                          <div key={booking.id} className="p-4 border rounded-lg">
                            {/* Booking summary for upcoming flights */}
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-semibold">{booking.reference}</span>
                                <div className="text-sm text-gray-600">
                                  {booking.flights[0].legs[0].from.code} → {booking.flights[0].legs[0].to.code}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {formatDate(booking.flights[0].legs[0].departure)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{formatCurrency(booking.pricing.totalAmount)}</div>
                                <Button size="sm">Manage</Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="past" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Past Flights</CardTitle>
                    <CardDescription>Your travel history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bookings.filter(b => b.status === 'completed').length === 0 ? (
                      <div className="text-center py-12">
                        <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No past flights</h3>
                        <p className="text-gray-600">Your completed flights will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.filter(b => b.status === 'completed').map((booking) => (
                          <div key={booking.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-semibold">{booking.reference}</span>
                                <div className="text-sm text-gray-600">
                                  {booking.flights[0].legs[0].from.code} → {booking.flights[0].legs[0].to.code}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {formatDate(booking.flights[0].legs[0].departure)}
                                </div>
                              </div>
                              <div className="text-right">
                                <Button variant="outline" size="sm">Book Again</Button>
                                <Button variant="outline" size="sm" className="ml-2">
                                  <Star className="h-4 w-4 mr-2" />
                                  Review
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Manage your personal details and preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                          <Input value={user?.firstName || ''} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                          <Input value={user?.lastName || ''} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <Input value={user?.email || ''} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <Input value={user?.phone || '+1 (555) 123-4567'} disabled />
                        </div>
                      </div>
                      <Button>Update Profile</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage