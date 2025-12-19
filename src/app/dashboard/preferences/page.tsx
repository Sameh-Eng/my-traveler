'use client'
import React from 'react'
import Link from 'next/link'
import { MapPin, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Sidebar from '@/components/layout/Sidebar'

export default function PreferencesPage() {
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
                        <h1 className="text-2xl font-bold text-gray-900">Travel Preferences</h1>
                        <p className="text-gray-500 mt-1">Customize your travel experience</p>
                    </div>
                    <Card>
                        <CardHeader><CardTitle className="flex items-center space-x-2"><MapPin className="h-5 w-5" /><span>Preferences</span></CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg"><p className="font-medium">Seat Preference</p><p className="text-gray-500">Window</p></div>
                                <div className="p-4 bg-gray-50 rounded-lg"><p className="font-medium">Meal Preference</p><p className="text-gray-500">No preference</p></div>
                                <div className="p-4 bg-gray-50 rounded-lg"><p className="font-medium">Preferred Airlines</p><p className="text-gray-500">Any</p></div>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    )
}
