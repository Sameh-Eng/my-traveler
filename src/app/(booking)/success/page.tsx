'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  CheckCircle,
  Home,
  ArrowRight,
  Mail,
  Download,
  Star,
  TrendingUp,
  Calendar,
  Users,
  MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { formatDate } from '@/lib/utils'

interface SuccessPageProps {
  type?: 'booking' | 'payment' | 'registration' | 'profile' | 'general'
  title?: string
  message?: string
  showActions?: boolean
}

const SuccessPage = () => {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<SuccessPageProps>({
    type: 'general',
    title: 'Success!',
    message: 'Your action was completed successfully.',
    showActions: true
  })

  useEffect(() => {
    // Parse URL parameters to configure the page
    const type = searchParams.get('type') as SuccessPageProps['type'] || 'general'
    const title = searchParams.get('title') || getDefaultTitle(type)
    const message = searchParams.get('message') || getDefaultMessage(type)

    setConfig({
      type,
      title,
      message,
      showActions: true
    })

    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [searchParams])

  const getDefaultTitle = (type: SuccessPageProps['type']): string => {
    switch (type) {
      case 'booking':
        return 'Booking Confirmed!'
      case 'payment':
        return 'Payment Successful!'
      case 'registration':
        return 'Welcome Aboard!'
      case 'profile':
        return 'Profile Updated!'
      default:
        return 'Success!'
    }
  }

  const getDefaultMessage = (type: SuccessPageProps['type']): string => {
    switch (type) {
      case 'booking':
        return 'Your flight has been successfully booked. Check your email for confirmation details.'
      case 'payment':
        return 'Your payment has been processed successfully. A receipt has been sent to your email.'
      case 'registration':
        return 'Your account has been created successfully. You can now start booking flights.'
      case 'profile':
        return 'Your profile information has been updated successfully.'
      default:
        return 'Your action was completed successfully.'
    }
  }

  const getIcon = () => {
    switch (config.type) {
      case 'booking':
        return <Calendar className="h-16 w-16 text-green-500" />
      case 'payment':
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case 'registration':
        return <Users className="h-16 w-16 text-green-500" />
      case 'profile':
        return <Star className="h-16 w-16 text-green-500" />
      default:
        return <CheckCircle className="h-16 w-16 text-green-500" />
    }
  }

  const getActions = () => {
    switch (config.type) {
      case 'booking':
        return (
          <>
            <Link href="/dashboard/bookings">
              <Button className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>View My Bookings</span>
              </Button>
            </Link>
            <Link href="/flights">
              <Button variant="outline" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Book Another Flight</span>
              </Button>
            </Link>
          </>
        )
      case 'payment':
        return (
          <>
            <Link href="/dashboard/bookings">
              <Button className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>View Booking</span>
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Go to Dashboard</span>
              </Button>
            </Link>
          </>
        )
      case 'registration':
        return (
          <>
            <Link href="/flights">
              <Button className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Search Flights</span>
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center space-x-2">
                <Star className="h-4 w-4" />
                <span>Go to Dashboard</span>
              </Button>
            </Link>
          </>
        )
      case 'profile':
        return (
          <>
            <Link href="/dashboard/profile">
              <Button className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>View Profile</span>
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Go to Dashboard</span>
              </Button>
            </Link>
          </>
        )
      default:
        return (
          <>
            <Link href="/dashboard">
              <Button className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Go to Dashboard</span>
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Go to Homepage</span>
              </Button>
            </Link>
          </>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Loading message="Loading..." />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
            {getIcon()}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{config.title}</h1>
          <p className="text-xl max-w-2xl mx-auto">{config.message}</p>
        </div>
      </div>

      {/* Additional Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {config.type === 'registration' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-amber-500" />
                <span>Welcome to SkyWings!</span>
              </CardTitle>
              <CardDescription>
                Your account has been successfully created. Here's what you can do next:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Search Flights</h3>
                  <p className="text-sm text-gray-600">Find and book your next adventure</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Manage Bookings</h3>
                  <p className="text-sm text-gray-600">View and manage all your flight bookings</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Earn Rewards</h3>
                  <p className="text-sm text-gray-600">Join our loyalty program and earn points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {config.type === 'booking' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Booking Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Check-in Online</h3>
                    <p className="text-sm text-gray-600">Save time at the airport by checking in online 24 hours before your flight.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Download Mobile App</h3>
                    <p className="text-sm text-gray-600">Get real-time flight updates and access your boarding passes.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Baggage Guidelines</h3>
                    <p className="text-sm text-gray-600">Review baggage allowances and packing guidelines before your trip.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {config.type === 'payment' && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Payment Confirmation Sent</span>
              </div>
              <div className="text-sm text-green-700 mt-2">
                A detailed receipt has been sent to your email address. You can also view your receipt in your dashboard under payment history.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {config.showActions && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {getActions()}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 text-center">
          <Card className="inline-block border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">Our customer support team is here to assist you</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/contact">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Contact Support</span>
                  </Button>
                </Link>
                <Link href="/help">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Help Center</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SuccessPage