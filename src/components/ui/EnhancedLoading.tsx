'use client'

import React from 'react'
import { Loader2, Plane, CreditCard, MapPin, Calendar, Search, RefreshCw, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'dots' | 'pulse' | 'skeleton' | 'spinner'
  className?: string
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  size = 'md',
  variant = 'default',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  const messageSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        )

      case 'pulse':
        return (
          <div className={cn('bg-primary rounded-full animate-pulse', sizeClasses[size])}></div>
        )

      case 'skeleton':
        return (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        )

      case 'spinner':
        return (
          <div className="animate-spin">
            <RefreshCw className={cn(sizeClasses[size], 'text-primary')} />
          </div>
        )

      default:
        return (
          <div className="animate-spin">
            <Loader2 className={cn(sizeClasses[size], 'text-primary')} />
          </div>
        )
    }
  }

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      {renderLoader()}
      {message && (
        <p className={cn('text-gray-600 text-center', messageSizeClasses[size])}>
          {message}
        </p>
      )}
    </div>
  )
}

// Contextual loading components
interface FlightLoadingProps {
  message?: string
  className?: string
}

export const FlightLoading: React.FC<FlightLoadingProps> = ({
  message = 'Searching flights...',
  className = ''
}) => (
  <div className={cn('flex flex-col items-center justify-center space-y-4 py-8', className)}>
    <div className="relative">
      <Plane className="h-12 w-12 text-primary animate-pulse" />
      <div className="absolute inset-0 h-12 w-12 border-4 border-primary rounded-full animate-ping opacity-20"></div>
    </div>
    <div className="text-center space-y-2">
      <p className="font-medium text-gray-900">{message}</p>
      <p className="text-sm text-gray-600">Finding the best flights for your journey</p>
    </div>
  </div>
)

interface PaymentLoadingProps {
  message?: string
  className?: string
}

export const PaymentLoading: React.FC<PaymentLoadingProps> = ({
  message = 'Processing payment...',
  className = ''
}) => (
  <div className={cn('flex flex-col items-center justify-center space-y-4 py-8', className)}>
    <div className="relative">
      <CreditCard className="h-12 w-12 text-primary animate-pulse" />
      <div className="absolute inset-0 h-12 w-12 border-4 border-primary rounded-full animate-ping opacity-20"></div>
    </div>
    <div className="text-center space-y-2">
      <p className="font-medium text-gray-900">{message}</p>
      <p className="text-sm text-gray-600">Please wait while we process your payment securely</p>
    </div>
  </div>
)

interface BookingLoadingProps {
  message?: string
  step?: string
  className?: string
}

export const BookingLoading: React.FC<BookingLoadingProps> = ({
  message = 'Creating your booking...',
  step = 'Processing',
  className = ''
}) => (
  <div className={cn('flex flex-col items-center justify-center space-y-4 py-8', className)}>
    <div className="relative">
      <MapPin className="h-12 w-12 text-primary animate-pulse" />
      <div className="absolute inset-0 h-12 w-12 border-4 border-primary rounded-full animate-ping opacity-20"></div>
    </div>
    <div className="text-center space-y-2">
      <p className="font-medium text-gray-900">{message}</p>
      <p className="text-sm text-gray-600">{step}... Please don't close this window</p>
    </div>
    <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }}></div>
    </div>
  </div>
)

interface SearchLoadingProps {
  message?: string
  className?: string
}

export const SearchLoading: React.FC<SearchLoadingProps> = ({
  message = 'Searching...',
  className = ''
}) => (
  <div className={cn('flex items-center justify-center space-x-2 py-4', className)}>
    <Search className="h-5 w-5 text-primary animate-pulse" />
    <p className="text-gray-600">{message}</p>
  </div>
)

// Page-level loading overlay
interface PageLoadingProps {
  message?: string
  showProgress?: boolean
  className?: string
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = 'Loading...',
  showProgress = false,
  className = ''
}) => (
  <div className={cn('fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50', className)}>
    <div className="flex flex-col items-center space-y-4 max-w-sm mx-auto px-4">
      <div className="relative">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
      <div className="text-center space-y-2">
        <p className="font-medium text-gray-900 text-lg">{message}</p>
        <p className="text-sm text-gray-600">Please wait while we prepare your content</p>
      </div>
      {showProgress && (
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '70%' }}></div>
        </div>
      )}
    </div>
  </div>
)

// Loading skeleton for cards
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={cn('bg-white rounded-lg border border-gray-200 p-6 space-y-4', className)}>
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  </div>
)

// Loading skeleton for flight cards
export const FlightCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
    <div className="animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <div className="h-6 bg-gray-200 rounded w-8"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="flex items-center justify-center">
          <div className="h-px bg-gray-200 w-full"></div>
        </div>
        <div className="space-y-1 text-right">
          <div className="h-6 bg-gray-200 rounded w-8 ml-auto"></div>
          <div className="h-3 bg-gray-200 rounded w-12 ml-auto"></div>
          <div className="h-3 bg-gray-200 rounded w-16 ml-auto"></div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  </div>
)

// Loading skeleton for passenger forms
export const PassengerFormSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={cn('bg-white rounded-lg border border-gray-200 p-6 space-y-6', className)}>
    <div className="animate-pulse space-y-4">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>

      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <div className="h-10 bg-gray-200 rounded w-20"></div>
        <div className="h-10 bg-primary bg-opacity-20 rounded w-24"></div>
      </div>
    </div>
  </div>
)

// Loading with retry functionality
interface LoadingWithRetryProps {
  message?: string
  retryCount?: number
  maxRetries?: number
  onRetry?: () => void
  error?: string
  className?: string
}

export const LoadingWithRetry: React.FC<LoadingWithRetryProps> = ({
  message = 'Loading...',
  retryCount = 0,
  maxRetries = 3,
  onRetry,
  error,
  className = ''
}) => (
  <div className={cn('flex flex-col items-center justify-center space-y-4 py-8', className)}>
    {!error ? (
      <>
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-gray-900 font-medium">{message}</p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-600">Attempt {retryCount} of {maxRetries}</p>
          )}
        </div>
      </>
    ) : (
      <>
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <div className="text-center space-y-2">
          <p className="text-red-900 font-medium">Something went wrong</p>
          <p className="text-red-700 text-sm">{error}</p>
          {onRetry && retryCount < maxRetries && (
            <button
              onClick={onRetry}
              className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </>
    )}
  </div>
)

export default Loading