'use client'
import React from 'react'
import Link from 'next/link'
import { HelpCircle, ArrowLeft, MessageCircle, Book, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Sidebar from '@/components/layout/Sidebar'

export default function HelpPage() {
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
                        <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
                        <p className="text-gray-500 mt-1">Get help with your bookings</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="pt-6 text-center">
                                <MessageCircle className="h-12 w-12 mx-auto text-primary mb-4" />
                                <h3 className="font-semibold mb-2">Live Chat</h3>
                                <p className="text-sm text-gray-500 mb-4">Chat with our support team</p>
                                <Button className="w-full">Start Chat</Button>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="pt-6 text-center">
                                <Phone className="h-12 w-12 mx-auto text-primary mb-4" />
                                <h3 className="font-semibold mb-2">Call Us</h3>
                                <p className="text-sm text-gray-500 mb-4">+20 102 484 7873</p>
                                <Button variant="outline" className="w-full">Call Now</Button>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="pt-6 text-center">
                                <Book className="h-12 w-12 mx-auto text-primary mb-4" />
                                <h3 className="font-semibold mb-2">FAQ</h3>
                                <p className="text-sm text-gray-500 mb-4">Find answers quickly</p>
                                <Button variant="outline" className="w-full">View FAQ</Button>
                            </CardContent>
                        </Card>
                    </div>
                    <Card className="mt-6">
                        <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div><p className="font-medium">Email</p><p className="text-gray-500">sameh.reda1004@gmail.com</p></div>
                                <div><p className="font-medium">Phone</p><p className="text-gray-500">+20 102 484 7873</p></div>
                                <div><p className="font-medium">Address</p><p className="text-gray-500">MSA University, 6th of October City</p></div>
                                <div><p className="font-medium">Hours</p><p className="text-gray-500">24/7 Customer Support</p></div>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    )
}
