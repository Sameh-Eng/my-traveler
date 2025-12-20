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
  Shield,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Label } from '@/components/ui/Label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import { useAuthStore } from '@/store'
import { validateEmail, validatePassword } from '@/lib/utils'

const RegisterPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register, loginWithGoogle, isAuthenticated, isLoading, error } = useAuthStore()

  const [formData, setFormData] = useState({
    title: 'Mr',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    marketingOptIn: false,
    termsAccepted: false,
    privacyAccepted: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [validation, setValidation] = useState(validatePassword(''))

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

    // Validate password in real-time
    if (name === 'password' && value) {
      setValidation(validatePassword(value))
    }

    // Check password match when confirm password changes
    if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
      const newFormData = { ...formData, [name]: type === 'checkbox' ? checked : value }
      if (newFormData.confirmPassword && newFormData.password) {
        if (newFormData.confirmPassword !== newFormData.password) {
          setFormErrors(prev => ({
            ...prev,
            confirmPassword: 'Passwords do not match'
          }))
        } else {
          setFormErrors(prev => {
            const { confirmPassword, ...rest } = prev
            return rest
          })
        }
      }
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.firstName || formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters long'
    }

    if (!formData.lastName || formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters long'
    }

    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long'
    } else if (!validation.isValid) {
      errors.password = validation.errors[0]
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.termsAccepted) {
      errors.termsAccepted = 'You must accept the terms and conditions'
    }

    if (!formData.privacyAccepted) {
      errors.privacyAccepted = 'You must accept the privacy policy'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const userData = {
      title: formData.title,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone.trim(),
      marketingOptIn: formData.marketingOptIn,
      termsAccepted: formData.termsAccepted,
      privacyAccepted: formData.privacyAccepted
    }

    try {
      await register(userData)
    } catch (error) {
      // Error is handled by the auth store
      console.error('Registration error:', error)
    }
  }

  const handleSocialRegister = async (provider: 'google' | 'facebook' | 'apple') => {
    if (provider === 'google') {
      // Google OAuth handles both login and registration
      await loginWithGoogle()
    } else {
      console.log(`${provider} registration not supported`)
    }
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Creating your account...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">MT</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">MyTraveler</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join MyTraveler to book flights and manage your travel
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Fill in your details to get started with your travel journey
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
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Personal Information</h3>

                {/* Title Selection */}
                <div>
                  <Label>Title</Label>
                  <RadioGroup
                    value={formData.title}
                    onValueChange={(value) =>
                      setFormData(prev => ({ ...prev, title: value }))
                    }
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Mr" id="mr" />
                      <Label htmlFor="mr">Mr</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Mrs" id="mrs" />
                      <Label htmlFor="mrs">Mrs</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Ms" id="ms" />
                      <Label htmlFor="ms">Ms</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Mx" id="mx" />
                      <Label htmlFor="mx">Mx</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        leftIcon={<User className="h-4 w-4" />}
                        error={!!formErrors.firstName}
                      />
                      {formErrors.firstName && (
                        <p className="text-xs text-red-600 mt-1">{formErrors.firstName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      error={!!formErrors.lastName}
                    />
                    {formErrors.lastName && (
                      <p className="text-xs text-red-600 mt-1">{formErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Account Information</h3>

                {/* Email Field */}
                <div>
                  <Label htmlFor="email">Email Address</Label>
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

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Create password"
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
                      {formData.password && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-600 mb-1">Password strength:</div>
                          <div className="flex space-x-1">
                            <div className={`flex-1 h-2 rounded ${validation.isValid
                              ? 'bg-green-500'
                              : validation.errors.length <= 2
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                              }`} />
                            <div className={`flex-1 h-2 rounded ${validation.isValid
                              ? 'bg-green-500'
                              : validation.errors.length <= 2
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                              }`} />
                            <div className={`flex-1 h-2 rounded ${validation.isValid
                              ? 'bg-green-500'
                              : validation.errors.length <= 2
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                              }`} />
                            <div className={`flex-1 h-2 rounded ${validation.isValid
                              ? 'bg-green-500'
                              : validation.errors.length <= 2
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                              }`} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        leftIcon={<Lock className="h-4 w-4" />}
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        }
                        error={!!formErrors.confirmPassword}
                      />
                      {formErrors.confirmPassword && (
                        <p className="text-xs text-red-600 mt-1">{formErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Login Options */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialRegister('google')}
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign up with Google
                </Button>
                <p className="text-xs text-center text-green-600">
                  🔐 Security Note: Try sign up with Google - it's safer! We are working on getting the SSL certificate soon.
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>

              {/* Terms and Privacy */}
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="marketing-optin"
                    name="marketingOptIn"
                    checked={formData.marketingOptIn}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, marketingOptIn: checked === true }))
                    }
                  />
                  <div className="text-sm">
                    <Label htmlFor="marketing-optin" className="font-medium text-gray-700">
                      Send me travel deals and promotions
                    </Label>
                    <p className="text-gray-500">
                      We'll never share your email with anyone else.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, termsAccepted: checked === true }))
                    }
                  />
                  <div className="text-sm">
                    <Label htmlFor="terms" className="font-medium text-gray-700">
                      I accept the{' '}
                      <Link href="/terms" className="text-primary hover:text-primary/600 underline">
                        Terms and Conditions
                      </Link>
                    </Label>
                    {formErrors.termsAccepted && (
                      <p className="text-xs text-red-600 mt-1">{formErrors.termsAccepted}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="privacy"
                    name="privacyAccepted"
                    checked={formData.privacyAccepted}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, privacyAccepted: checked === true }))
                    }
                  />
                  <div className="text-sm">
                    <Label htmlFor="privacy" className="font-medium text-gray-700">
                      I accept the{' '}
                      <Link href="/privacy" className="text-primary hover:text-primary/600 underline">
                        Privacy Policy
                      </Link>
                    </Label>
                    {formErrors.privacyAccepted && (
                      <p className="text-xs text-red-600 mt-1">{formErrors.privacyAccepted}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full btn-glow"
                disabled={isLoading}
                loading={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Information */}
        <div className="mt-8">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Shield className="h-4 w-4" />
            <span>Your data is protected with industry-standard encryption</span>
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

export default RegisterPage