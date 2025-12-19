'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store'

const AuthCallbackPage = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { loginWithGoogle } = useAuthStore()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('Processing your login...')

    useEffect(() => {
        const handleCallback = async () => {
            const provider = searchParams.get('provider')
            const data = searchParams.get('data')
            const error = searchParams.get('error')

            if (error) {
                setStatus('error')
                setMessage(`Login failed: ${error}`)
                setTimeout(() => router.push('/auth/login'), 3000)
                return
            }

            if (provider === 'google' && data) {
                try {
                    // Decode the user data from the URL
                    const userData = JSON.parse(atob(data))

                    // Call the auth store to set the user
                    await loginWithGoogle(userData)

                    setStatus('success')
                    setMessage('Login successful! Redirecting...')

                    // Redirect to dashboard
                    setTimeout(() => router.push('/dashboard'), 1500)
                } catch (err) {
                    console.error('Error processing OAuth callback:', err)
                    setStatus('error')
                    setMessage('Failed to process login. Please try again.')
                    setTimeout(() => router.push('/auth/login'), 3000)
                }
            } else {
                setStatus('error')
                setMessage('Invalid callback. Please try again.')
                setTimeout(() => router.push('/auth/login'), 3000)
            }
        }

        handleCallback()
    }, [searchParams, router, loginWithGoogle])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
                {status === 'loading' && (
                    <>
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
                        <h2 className="text-xl font-semibold text-gray-700">{message}</h2>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-green-700">{message}</h2>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-red-700">{message}</h2>
                        <p className="text-gray-500 mt-2">Redirecting to login page...</p>
                    </>
                )}
            </div>
        </div>
    )
}

export default AuthCallbackPage
