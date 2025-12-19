'use client'

import React from 'react'
import Link from 'next/link'
import {
    Car,
    Clock,
    Wrench,
    ArrowRight,
    Bell,
    Mail
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

const CarRentalPage = () => {
    const handleNotify = (e: React.FormEvent) => {
        e.preventDefault()
        alert('Thank you! We will notify you when car rental becomes available.')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-primary to-secondary text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <Car className="h-10 w-10" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            Car Rental
                        </h1>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                            We're working on bringing you the best car rental experience in Egypt
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
            </section>

            {/* Coming Soon Content */}
            <section className="py-16">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Card className="overflow-hidden">
                        <CardContent className="p-12">
                            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                                <Wrench className="h-12 w-12 text-primary" />
                            </div>

                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                Coming Soon!
                            </h2>

                            <p className="text-xl text-gray-600 mb-8">
                                We are currently working on integrating a car rental API to bring you the best prices
                                and widest selection of vehicles across Egypt.
                            </p>

                            <div className="flex items-center justify-center space-x-2 text-gray-500 mb-8">
                                <Clock className="h-5 w-5" />
                                <span>Expected launch: Q1 2025</span>
                            </div>

                            {/* Notify Form */}
                            <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-center">
                                    <Bell className="h-5 w-5 mr-2" />
                                    Get Notified When Available
                                </h3>
                                <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3">
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        required
                                        className="flex-1"
                                        leftIcon={<Mail className="h-4 w-4" />}
                                    />
                                    <Button type="submit">
                                        Notify Me
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Back to Home */}
                    <div className="mt-8">
                        <Link href="/">
                            <Button variant="outline" size="lg">
                                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default CarRentalPage
