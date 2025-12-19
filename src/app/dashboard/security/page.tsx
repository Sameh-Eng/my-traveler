'use client'
import React from 'react'
import Link from 'next/link'
import { Shield, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Sidebar from '@/components/layout/Sidebar'

export default function SecurityPage() {
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
                        <h1 className="text-2xl font-bold text-gray-900">Security</h1>
                        <p className="text-gray-500 mt-1">Manage your account security</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader><CardTitle>Password</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-gray-500 mb-4">Using Google authentication - no password set</p>
                                <Button variant="outline">Set Password</Button>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Two-Factor Authentication</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-2 text-green-600 mb-4">
                                    <CheckCircle className="h-5 w-5" />
                                    <span>Secured with Google</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    )
}
