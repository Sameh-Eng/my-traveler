'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import BookingDetails from '@/components/dashboard/BookingDetails'
import Sidebar from '@/components/layout/Sidebar'

const BookingDetailsClient = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [sidebarOpen, setSidebarOpen] = React.useState(false)

    // Get booking ID from URL params
    const bookingId = searchParams?.get('id') || '123'

    const handleBookingUpdate = () => {
        // Refresh booking data or navigate back to list
        console.log('Booking updated')
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
                            <div className="flex items-center space-x-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => router.back()}
                                    className="flex items-center space-x-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span>Back to Bookings</span>
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="px-6 py-6">
                        <BookingDetails
                            bookingId={bookingId}
                            onBookingUpdate={handleBookingUpdate}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BookingDetailsClient
