export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly context?: Record<string, any>

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.context = context

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }

    // Set the prototype explicitly for TypeScript to recognize this as AppError
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

// Specific error types
export class ValidationError extends AppError {
  constructor(message: string, field?: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, true, { field, ...context })
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: Record<string, any>) {
    super(message, 'AUTHENTICATION_ERROR', 401, true, context)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', context?: Record<string, any>) {
    super(message, 'AUTHORIZATION_ERROR', 403, true, context)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', context?: Record<string, any>) {
    super(message, 'NOT_FOUND_ERROR', 404, true, context)
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred', context?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', 0, true, context)
  }
}

export class TimeoutError extends AppError {
  constructor(message: string = 'Request timed out', timeout?: number, context?: Record<string, any>) {
    super(message, 'TIMEOUT_ERROR', 408, true, { timeout, ...context })
  }
}

export class PaymentError extends AppError {
  constructor(message: string, paymentContext?: Record<string, any>) {
    super(message, 'PAYMENT_ERROR', 400, true, paymentContext)
  }
}

export class BookingError extends AppError {
  constructor(message: string, bookingContext?: Record<string, any>) {
    super(message, 'BOOKING_ERROR', 400, true, bookingContext)
  }
}

export class APIError extends AppError {
  constructor(
    message: string,
    statusCode: number,
    response?: Response,
    context?: Record<string, any>
  ) {
    super(
      message,
      `API_ERROR_${statusCode}`,
      statusCode,
      true,
      { response: response?.status, ...context }
    )
  }
}

// Error handler utility
export class ErrorHandler {
  private static instance: ErrorHandler
  private errorListeners: Array<(error: Error) => void> = []

  private constructor() { }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  public addErrorListener(listener: (error: Error) => void): void {
    this.errorListeners.push(listener)
  }

  public removeErrorListener(listener: (error: Error) => void): void {
    const index = this.errorListeners.indexOf(listener)
    if (index > -1) {
      this.errorListeners.splice(index, 1)
    }
  }

  public notifyListeners(error: Error): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error)
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError)
      }
    })
  }

  public handle(error: Error): void {
    // Log the error
    this.logError(error)

    // Notify listeners
    this.notifyListeners(error)

    // In production, send to error reporting service
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      this.reportError(error)
    }
  }

  private logError(error: Error): void {
    if (error instanceof AppError) {
      console.error(`[${error.code}] ${error.message}`, error.context)
    } else {
      console.error('Unexpected error:', error)
    }
  }

  private async reportError(error: Error): Promise<void> {
    try {
      const errorData = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as AppError).code,
        statusCode: (error as AppError).statusCode,
        context: (error as AppError).context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: this.getCurrentUserId()
      }

      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData)
      })
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  private getCurrentUserId(): string | null {
    try {
      // Get user ID from auth store or localStorage
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        return user.id || null
      }
    } catch {
      // Ignore errors getting user ID
    }
    return null
  }
}

// Global error handler functions
export const handleError = (error: Error): void => {
  const errorHandler = ErrorHandler.getInstance()
  errorHandler.handle(error)
}

export const createError = (
  message: string,
  code: string = 'UNKNOWN_ERROR',
  statusCode: number = 500,
  context?: Record<string, any>
): AppError => {
  return new AppError(message, code, statusCode, true, context)
}

// Error parsing utilities
export const parseAPIError = (error: any): AppError => {
  if (error instanceof AppError) {
    return error
  }

  if (error?.response) {
    const status = error.response.status
    const data = error.response.data

    if (status === 400 && data?.errors) {
      // Validation errors - handle both array and object formats
      let errorMessage = 'Validation failed'
      if (Array.isArray(data.errors)) {
        // Backend returns array of {msg, path} objects
        errorMessage = data.errors.map((e: any) => e.msg || e.message).join(', ')
      } else if (typeof data.errors === 'object') {
        // Handle object format {field: message}
        const firstError = Object.values(data.errors)[0] as string
        errorMessage = firstError || 'Validation failed'
      }
      return new ValidationError(errorMessage, undefined, data)
    }

    if (status === 401) {
      return new AuthenticationError(data?.message || 'Authentication required')
    }

    if (status === 403) {
      return new AuthorizationError(data?.message || 'Insufficient permissions')
    }

    if (status === 404) {
      return new NotFoundError(data?.message || 'Resource not found')
    }

    if (status === 408) {
      return new TimeoutError(data?.message || 'Request timed out')
    }

    if (status >= 500) {
      return new APIError(
        data?.message || 'Server error occurred',
        status,
        error.response,
        data
      )
    }

    return new APIError(
      data?.message || error.message,
      status,
      error.response,
      data
    )
  }

  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network')) {
    return new NetworkError(error.message)
  }

  if (error?.code === 'TIMEOUT_ERROR' || error?.message?.includes('timeout')) {
    return new TimeoutError(error.message)
  }

  // Default case
  return new AppError(
    error?.message || 'An unexpected error occurred',
    'UNKNOWN_ERROR',
    500,
    true,
    { originalError: error }
  )
}

// Retry utility with exponential backoff
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  onRetry?: (error: Error, attempt: number) => void
): Promise<T> => {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt === maxRetries) {
        throw lastError
      }

      // Don't retry on client errors (4xx)
      if (lastError instanceof AppError && lastError.statusCode >= 400 && lastError.statusCode < 500) {
        throw lastError
      }

      // Calculate exponential backoff delay
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000

      // Notify retry callback
      if (onRetry) {
        onRetry(lastError, attempt + 1)
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

// Safe async wrapper that handles errors automatically
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  errorHandler?: (error: Error) => void
): Promise<T | null> => {
  try {
    return await operation()
  } catch (error) {
    const appError = parseAPIError(error)
    handleError(appError)

    if (errorHandler) {
      errorHandler(appError)
    }

    return null
  }
}

// Error message formatter for user display
export const formatErrorMessage = (error: Error): string => {
  if (error instanceof AppError) {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return error.message
      case 'AUTHENTICATION_ERROR':
        return 'Please log in to continue'
      case 'AUTHORIZATION_ERROR':
        return 'You don\'t have permission to perform this action'
      case 'NOT_FOUND_ERROR':
        return 'The requested resource was not found'
      case 'NETWORK_ERROR':
        return 'Network connection error. Please check your internet connection'
      case 'TIMEOUT_ERROR':
        return 'Request timed out. Please try again'
      case 'PAYMENT_ERROR':
        return 'Payment processing failed. Please try again or use a different payment method'
      case 'BOOKING_ERROR':
        return 'Booking failed. Please check your information and try again'
      default:
        return error.message || 'An unexpected error occurred'
    }
  }

  return error.message || 'An unexpected error occurred'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Get error severity
export const getErrorSeverity = (error: Error): ErrorSeverity => {
  if (error instanceof AppError) {
    if (error.statusCode >= 500) return ErrorSeverity.HIGH
    if (error.statusCode >= 400) return ErrorSeverity.MEDIUM
    return ErrorSeverity.LOW
  }

  return ErrorSeverity.MEDIUM
}