'use client'
import React from 'react'
import Link from 'next/link'
import { Users, ArrowLeft, Gift, Copy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import Sidebar from '@/components/layout/Sidebar'

export default function ReferralsPage() {
    const [sidebarOpen, setSidebarOpen] = React.useState(false)
    const referralCode = 'MYTRAV2024'

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <main className="flex-1 p-6">
                    <div className="mb-6">
                        <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />Back to Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Referrals</h1>
                        <p className="text-gray-500 mt-1">Invite friends and earn rewards</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center space-x-2"><Gift className="h-5 w-5 text-primary" /><span>Share & Earn</span></CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-gray-500 mb-4">Invite friends and get 500 points when they complete their first booking!</p>
                                <div className="flex space-x-2">
                                    <Input value={referralCode} readOnly className="font-mono" />
                                    <Button variant="outline"><Copy className="h-4 w-4" /></Button>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Your Referrals</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-center py-6">
                                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-2xl font-bold">0</p>
                                    <p className="text-gray-500">Friends invited</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    )
}
