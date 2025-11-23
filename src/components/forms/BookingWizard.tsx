'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Plane,
  Users,
  Calendar,
  CreditCard,
  ShoppingBag,
  AlertCircle,
  Info,
  ArrowRight,
  ArrowLeft,
  Save
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import { useBookingStore, useFlightStore } from '@/store'
import { formatCurrency } from '@/lib/utils'
import PassengerForm from './PassengerForm'

interface BookingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  completed?: boolean
  current?: boolean
}

const BookingWizard = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const flightId = searchParams.get('flightId')

  const {
    selectedFlights,
    passengers,
    currentStep,
    completedSteps,
    nextStep,
    previousStep,
    validateStep,
    calculateTotal,
    saveDraft,
    loadDraft,
    clearBooking,
    nextStep: canProceedToNext,
    getBookingSummary
  } = useBookingStore()

  const { searchResults } = useFlightStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedPassengers, setExpandedPassengers] = useState<number[]>([])

  useEffect(() => {
    // Load selected flight from URL parameter
    if (flightId && selectedFlights.length === 0) {
      const flight = searchResults.find(f => f.id === flightId)
      if (flight) {
        // This would typically come from the booking store
        console.log('Found flight for booking:', flight)
      }
    }

    // Try to load any existing draft
    loadDraft('default').then((loaded) => {
      if (loaded) {
        console.log('Loaded draft booking')
      }
    })
  }, [flightId, selectedFlights.length, searchResults])

  const steps: BookingStep[] = [
    {
      id: 'flights',
      title: 'Flights',
      description: 'Select your flights',
      icon: Plane,
      completed: completedSteps.includes('flights'),
      current: currentStep === 'flights'
    },
    {
      id: 'passengers',
      title: 'Passengers',
      description: 'Enter passenger details',
      icon: Users,
      completed: completedSteps.includes('passengers'),
      current: currentStep === 'passengers'
    },
    {
      id: 'seats',
      title: 'Seats',
      description: 'Choose your seats',
      icon: Calendar,
      completed: completedSteps.includes('seats'),
      current: currentStep === 'seats'
    },
    {
      id: 'extras',
      title: 'Extras',
      description: 'Add baggage & meals',
      icon: ShoppingBag,
      completed: completedSteps.includes('extras'),
      current: currentStep === 'extras'
    },
    {
      id: 'payment',
      title: 'Payment',
      description: 'Complete payment',
      icon: CreditCard,
      completed: completedSteps.includes('payment'),
      current: currentStep === 'payment'
    }
  ]

  const bookingSummary = getBookingSummary()

  const handleStepClick = (stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId)
    const currentStepIndex = steps.findIndex(step => step.id === currentStep)

    // Allow clicking on completed steps or current step
    if (stepIndex <= currentStepIndex) {
      // This would typically navigate to that step
      console.log('Navigate to step:', stepId)
    }
  }

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      setError('Please complete all required fields before proceeding')
      return
    }

    setError(null)
    setLoading(true)

    try {
      if (canProceedToNext()) {
        // Save current progress
        await saveDraft()
        nextStep()
      }
    } catch (error) {
      setError('Failed to save progress. Please try again.')
      console.error('Step navigation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrevious = () => {
    previousStep()
    setError(null)
  }

  const handleSaveDraft = async () => {
    try {
      await saveDraft()
      // Show success message
    } catch (error) {
      setError('Failed to save draft')
      console.error('Draft save error:', error)
    }
  }

  const addPassenger = () => {
    // This would add a new passenger to the booking store
    console.log('Add passenger')
  }

  const removePassenger = (index: number) => {
    // This would remove a passenger from the booking store
    console.log('Remove passenger:', index)
  }

  const togglePassengerExpanded = (index: number) => {
    setExpandedPassengers(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const handlePassengerSave = (passengerData: any) => {
    // This would update the passenger in the booking store
    console.log('Passenger saved:', passengerData)
  }

  const progressPercentage = (completedSteps.length / (steps.length - 1)) * 100

  const renderStepContent = () => {
    switch (currentStep) {
      case 'flights':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Selected Flights</h3>
              <p className="text-gray-600">Review your selected flights before proceeding</p>
            </div>

            {selectedFlights.map((flight, index) => (
              <Card key={flight.id || index} className="border-primary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Plane className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{flight.airline.name}</h4>
                        <p className="text-sm text-gray-600">{flight.flightNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Price per person</p>
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(flight.price.total)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {selectedFlights.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Flights Selected</h3>
                  <p className="text-gray-600 mb-4">
                    Please select flights to continue with your booking
                  </p>
                  <Button onClick={() => router.push('/flights')}>
                    Search Flights
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'passengers':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Passenger Information</h3>
                <p className="text-gray-600">Enter details for all travelers</p>
              </div>
              <Button onClick={addPassenger} variant="outline">
                Add Passenger
              </Button>
            </div>

            {passengers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No passengers added yet</p>
                <Button onClick={addPassenger}>
                  Add First Passenger
                </Button>
              </div>
            )}

            {passengers.map((passenger, index) => (
              <PassengerForm
                key={passenger.id || index}
                passengerIndex={index}
                passenger={passenger}
                onSave={handlePassengerSave}
                onRemove={() => removePassenger(index)}
                canRemove={passengers.length > 1}
                isAdult={true}
              />
            ))}
          </div>
        )

      case 'seats':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Seat Selection</h3>
              <p className="text-gray-600">Choose your preferred seats (optional)</p>
            </div>
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Seat Selection Coming Soon</h4>
                <p className="text-gray-600">
                  You can select seats during check-in or skip this step for now
                </p>
                <Button className="mt-4" onClick={handleNext}>
                  Skip Seat Selection
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case 'extras':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Extra Services</h3>
              <p className="text-gray-600">Add baggage, meals, and other services</p>
            </div>
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Extra Services Coming Soon</h4>
                <p className="text-gray-600">
                  Add baggage, meals, and other services will be available soon
                </p>
                <Button className="mt-4" onClick={handleNext}>
                  Continue Without Extras
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Payment</h3>
              <p className="text-gray-600">Complete your booking with secure payment</p>
            </div>
            <Card>
              <CardContent className="p-8 text-center">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Payment Processing Coming Soon</h4>
                <p className="text-gray-600">
                  Secure payment processing will be available soon
                </p>
                <Button className="mt-4" disabled>
                  Payment Not Available
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/flights')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Flights</span>
            </Button>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Draft</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  if (confirm('Are you sure you want to clear this booking?')) {
                    clearBooking()
                    router.push('/flights')
                  }
                }}
                className="text-red-600 hover:text-red-700"
              >
                Cancel Booking
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Complete Your Booking</h2>
            <div className="text-sm text-gray-600">
              Step {steps.findIndex(step => step.id === currentStep) + 1} of {steps.length}
            </div>
          </div>

          <Progress value={progressPercentage} className="mb-6" />

          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center flex-1 cursor-pointer"
                onClick={() => handleStepClick(step.id)}
              >
                <div className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                    ${step.completed ? 'bg-primary text-white' :
                      step.current ? 'bg-primary text-white' :
                      'bg-gray-200 text-gray-600'}
                  `}>
                    {step.completed ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      step.current ? 'text-primary' : 'text-gray-900'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 hidden lg:block">
                      {step.description}
                    </p>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-4 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Step Content */}
          <div className="lg:col-span-2">
            {error && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 'flights'}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              <Button
                onClick={handleNext}
                disabled={loading || (currentStep === 'flights' && selectedFlights.length === 0)}
                loading={loading}
                className="flex items-center space-x-2"
              >
                <span>{currentStep === 'payment' ? 'Complete Booking' : 'Next'}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingBag className="h-5 w-5" />
                  <span>Booking Summary</span>
                </CardTitle>
                <CardDescription>
                  Review your booking details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Flight Summary */}
                <div>
                  <h4 className="font-medium mb-3">Flights</h4>
                  {selectedFlights.map((flight, index) => (
                    <div key={index} className="flex items-center justify-between text-sm mb-2">
                      <span>
                        {flight.legs[0].from.code} → {flight.legs[0].to.code}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(flight.price.total)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Passengers */}
                <div>
                  <h4 className="font-medium mb-3">Passengers</h4>
                  <div className="flex items-center justify-between text-sm">
                    <span>{passengers.length} traveler{passengers.length !== 1 ? 's' : ''}</span>
                    <span className="text-gray-600">
                      {passengers.length} × {selectedFlights.reduce((sum, f) => sum + f.price.total, 0)}
                    </span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatCurrency(bookingSummary.pricing?.basePrice || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxes & Fees</span>
                      <span>{formatCurrency(bookingSummary.pricing?.taxes || 0)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-lg text-primary">
                          {formatCurrency(bookingSummary.pricing?.totalAmount || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Secure Booking</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Best Price Guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingWizard