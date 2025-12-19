'use client'
import React from 'react'
import Link from 'next/link'
import { TrendingUp, ArrowLeft, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Sidebar from '@/components/layout/Sidebar'

export default function LoyaltyPage() {
    const [sidebarOpen, setSidebarOpen] = React.useState(false)
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <main className="flex-1 p-6">
                    <div className="mb-6">
                        <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />Back to Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Loyalty Program</h1>
                        <p className="text-gray-500 mt-1">Earn and redeem points</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center space-x-2"><Star className="h-5 w-5 text-yellow-500" /><span>Your Points</span></CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-center py-6">
                                    <p className="text-4xl font-bold text-primary">0</p>
                                    <p className="text-gray-500 mt-2">Available Points</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Membership Level</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto flex items-center justify-center mb-4">
                                        <TrendingUp className="h-8 w-8 text-gray-500" />
                                    </div>
                                    <p className="font-medium">Bronze Member</p>
                                    <p className="text-gray-500 text-sm mt-1">Book more flights to level up!</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    )
}
