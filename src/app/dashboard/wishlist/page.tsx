'use client'
import React from 'react'
import Link from 'next/link'
import { Heart, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Sidebar from '@/components/layout/Sidebar'

export default function WishlistPage() {
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
                        <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>
                        <p className="text-gray-500 mt-1">Save flights and destinations for later</p>
                    </div>
                    <Card>
                        <CardHeader><CardTitle className="flex items-center space-x-2"><Heart className="h-5 w-5" /><span>Your Wishlist</span></CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No saved items</h3>
                                <p className="text-gray-500 mb-6">Save flights you're interested in to view them here.</p>
                                <Link href="/"><Button>Browse Flights</Button></Link>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    )
}
