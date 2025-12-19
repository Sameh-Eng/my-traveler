'use client'
import React from 'react'
import Link from 'next/link'
import { Settings, ArrowLeft, Bell, Globe, Moon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Label } from '@/components/ui/Label'
import Sidebar from '@/components/layout/Sidebar'

export default function SettingsPage() {
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
                        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                        <p className="text-gray-500 mt-1">Customize your app experience</p>
                    </div>
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center space-x-2"><Bell className="h-5 w-5" /><span>Notifications</span></CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div><Label>Email Notifications</Label><p className="text-sm text-gray-500">Receive booking updates via email</p></div>
                                    <input type="checkbox" defaultChecked className="h-5 w-5" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div><Label>SMS Notifications</Label><p className="text-sm text-gray-500">Receive flight alerts via SMS</p></div>
                                    <input type="checkbox" className="h-5 w-5" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="flex items-center space-x-2"><Globe className="h-5 w-5" /><span>Preferences</span></CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div><Label>Language</Label><p className="text-sm text-gray-500">Select your preferred language</p></div>
                                    <select className="border rounded px-3 py-1"><option>English</option><option>العربية</option></select>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div><Label>Currency</Label><p className="text-sm text-gray-500">Display prices in</p></div>
                                    <select className="border rounded px-3 py-1"><option>EGP</option><option>USD</option></select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    )
}
