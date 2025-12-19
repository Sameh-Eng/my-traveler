'use client'
import React from 'react'
import Link from 'next/link'
import { CreditCard, ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Sidebar from '@/components/layout/Sidebar'

export default function PaymentPage() {
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
                        <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
                        <p className="text-gray-500 mt-1">Manage your saved payment methods</p>
                    </div>
                    <Card>
                        <CardHeader><CardTitle className="flex items-center space-x-2"><CreditCard className="h-5 w-5" /><span>Saved Cards</span></CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No saved payment methods</h3>
                                <p className="text-gray-500 mb-6">Add a payment method for faster checkout.</p>
                                <Button><Plus className="h-4 w-4 mr-2" />Add Payment Method</Button>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    )
}
