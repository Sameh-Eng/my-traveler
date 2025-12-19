'use client'
import React from 'react'
import Link from 'next/link'
import { Bell, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Sidebar from '@/components/layout/Sidebar'

export default function NotificationsPage() {
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
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-gray-500 mt-1">Stay updated on your bookings</p>
                    </div>
                    <Card>
                        <CardHeader><CardTitle className="flex items-center space-x-2"><Bell className="h-5 w-5" /><span>Recent Notifications</span></CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Bell className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                                <p className="text-gray-500">You're all caught up!</p>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    )
}
