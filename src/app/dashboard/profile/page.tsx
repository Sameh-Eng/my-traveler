'use client'
import React from 'react'
import Link from 'next/link'
import { User, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import Sidebar from '@/components/layout/Sidebar'
import { useAuthStore } from '@/store'

export default function ProfilePage() {
    const [sidebarOpen, setSidebarOpen] = React.useState(false)
    const { user } = useAuthStore()

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <main className="flex-1 p-6">
                    <div className="mb-6">
                        <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />Back to Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                        <p className="text-gray-500 mt-1">Manage your personal information</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="h-20 w-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                                        {user?.profile?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium">{user?.profile?.firstName} {user?.profile?.lastName}</h3>
                                        <p className="text-gray-500">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="grid gap-4">
                                    <div><Label>First Name</Label><Input value={user?.profile?.firstName || ''} readOnly /></div>
                                    <div><Label>Last Name</Label><Input value={user?.profile?.lastName || ''} readOnly /></div>
                                    <div><Label>Email</Label><Input value={user?.email || ''} readOnly /></div>
                                </div>
                                <Button className="w-full">Edit Profile</Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Account Settings</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-green-800 font-medium">✓ Email Verified</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-blue-800">Logged in with Google</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    )
}
