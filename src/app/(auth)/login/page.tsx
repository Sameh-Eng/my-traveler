'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Label } from '@/components/ui/Label'
import { useAuthStore } from '@/store'
import { validateEmail } from '@/lib/utils'

const LoginPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated, isLoading, error } = useAuthStore()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const redirect = searchParams.get('redirect') || '/dashboard'

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect)
    }
  }, [isAuthenticated, router, redirect])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await login(formData.email, formData.password, formData.rememberMe)
    } catch (error) {
      // Error is handled by the auth store
      console.error('Login error:', error)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    // Implement social login logic
    console.log(`Login with ${provider}`)
    // This would typically redirect to the OAuth provider
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Logging you in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">MT</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">MyTraveler</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/register" className="font-medium text-primary hover:text-primary/600">
              create a new account
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to access your bookings and preferences
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Social Login Options */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin('google')}
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.13-2.25-.17.85.38 1.83.81 2.86.81A9.96 9.96 0 0 0 12 2c1.61 0 3.09-.59 4.23-1.57l-2.91-2.11a4 4 0 0 0-2.83-1.17 4.42 4.42 0 0 0-1.57 2.91l-2.06-1.49A9.96 9.96 0 0 0 3.91 12C3.91 7.14 7.14 4 12 4a9.96 9.96 0 0 0 7.07 2.93l-2.06 1.49A4.42 4.42 0 0 0 9.83 6.25c.44-.42 1.03-.63 1.63-.64v2.91c-.55-.06-1.09-.13-1.62-.19C11.04 16.64 8.96 15.36 8.28 15.12c-.74.25-1.52.41-2.32.41v-.01c.8 0 1.58-.16 2.32-.41.68-.24 1.24-.62 1.76-1.24l2.91 2.11A4 4 0 0 0 19.17 7c.24.64.37 1.27.37 2.06v-.01c0-.79-.13-1.58-.37-2.32-.41-.52-.62-1.08-.88-1.76-1.24l2.91-2.11a4 4 0 0 0 2.83 1.17c.64.49 1.25.76 1.85.68.72.17 1.47.3 2.25.17.72.06 1.47.13 2.25.17V12.25z"/>
                  </svg>
                  Continue with Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin('facebook')}
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12 5.373 12 12 12zm0-10c-4.97 0-9 4.03-9 9s4.03 9 9 9c1.657 0 3.195-.51 4.453-1.337l-.663-.375c-.278-.196-.645-.196-.923 0-.196.108-.395.221-.558.327l.27.163c.494.299.927.47 1.418.47.532 0 .999-.184 1.41-.47l.27-.163c.44-.272.88-.432 1.401-.432.417 0 .815.136 1.2.294l.664.375c-.887.544-1.857.842-2.903.842-4.716 0-8.543 3.827-8.543 8.543s3.827 8.543 8.543 8.543c1.046 0 2.016-.298 2.903-.842l.664-.375c.385-.158.783-.294 1.2-.294.532 0 .907.14 1.418.47l.27.163c.227.137.492.221.558.327.278.196.645.196.923 0 .196-.108.395-.221.558-.327l-.663-.375C20.815 15.763 23 14.313 23 12.073z"/>
                  </svg>
                  Continue with Facebook
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>

              {/* Email Field */}
              <div>
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    leftIcon={<Mail className="h-4 w-4" />}
                    error={!!formErrors.email}
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                    error={!!formErrors.password}
                  />
                  {formErrors.password && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.password}</p>
                  )}
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox
                    id="remember-me"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, rememberMe: checked }))
                    }
                  />
                  <Label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:text-primary/600"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full btn-glow"
                disabled={isLoading}
                loading={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Information */}
        <div className="mt-8">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Shield className="h-4 w-4" />
            <span>Secure login protected by industry-standard encryption</span>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-2">
          <div className="flex justify-center space-x-6 text-sm text-gray-600">
            <Link href="/about" className="hover:text-gray-900">
              About Us
            </Link>
            <Link href="/contact" className="hover:text-gray-900">
              Contact
            </Link>
            <Link href="/privacy" className="hover:text-gray-900">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gray-900">
              Terms of Service
            </Link>
          </div>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} MyTraveler. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage