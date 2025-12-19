import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { parseAPIError, NetworkError, TimeoutError, AppError } from './error-handling'
import { ApiResponse, FlightSearchParams, FlightSearchResponse } from '@/types'

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor - Add auth token if available
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor - Handle common errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const parsedError = parseAPIError(error)

        // Log the error for debugging
        console.error('API Error:', parsedError)

        // Reject with parsed error for consistent error handling
        return Promise.reject(parsedError)
      }
    )
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  // Enhanced request method with retry logic and better error handling
  private async handleRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    retryCount: number = 0,
    maxRetries: number = 3
  ): Promise<T> {
    try {
      const response = await this.client.request({
        method,
        url,
        data,
        ...config,
      })

      return response.data
    } catch (error) {
      const parsedError = parseAPIError(error)

      // Handle authentication errors
      if (parsedError.code === 'AUTHENTICATION_ERROR') {
        this.clearStoredToken()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        throw parsedError
      }

      // Handle network errors with retry logic
      if (parsedError instanceof NetworkError && retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.handleRequest<T>(method, url, data, config, retryCount + 1, maxRetries)
      }

      // Handle timeout errors
      if (parsedError instanceof TimeoutError && retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.handleRequest<T>(method, url, data, config, retryCount + 1, maxRetries)
      }

      throw parsedError
    }
  }

  private clearStoredToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
    }
  }


  // Generic HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.handleRequest<T>('GET', url, undefined, config)
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.handleRequest<T>('POST', url, data, config)
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.handleRequest<T>('PUT', url, data, config)
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.handleRequest<T>('DELETE', url, undefined, config)
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.handleRequest<T>('PATCH', url, data, config)
  }
}

// API endpoints
export const api = new ApiClient()

// Flight Search API
export const flightApi = {
  searchFlights: async (params: FlightSearchParams): Promise<FlightSearchResponse> => {
    return api.post<FlightSearchResponse>('/flights/search', params)
  },

  getFlightDetails: async (flightId: string): Promise<any> => {
    return api.get(`/flights/${flightId}`)
  },

  getFlightPrices: async (flightId: string): Promise<any> => {
    return api.get(`/flights/${flightId}/prices`)
  },

  getSeatMap: async (flightId: string, legId?: string): Promise<any> => {
    const url = legId ? `/flights/${flightId}/seatmap/${legId}` : `/flights/${flightId}/seatmap`
    return api.get(url)
  }
}

// Booking API
export const bookingApi = {
  createBooking: async (bookingData: any): Promise<any> => {
    return api.post('/bookings', bookingData)
  },

  getBooking: async (bookingId: string): Promise<any> => {
    return api.get(`/bookings/${bookingId}`)
  },

  updateBooking: async (bookingId: string, updateData: any): Promise<any> => {
    return api.patch(`/bookings/${bookingId}`, updateData)
  },

  cancelBooking: async (bookingId: string, reason?: string): Promise<any> => {
    return api.post(`/bookings/${bookingId}/cancel`, { reason })
  },

  getBookingsByUser: async (userId: string): Promise<any[]> => {
    return api.get(`/users/${userId}/bookings`)
  }
}

// User Authentication API
export const authApi = {
  login: async (email: string, password: string, rememberMe?: boolean): Promise<any> => {
    return api.post('/auth/login', { email, password, rememberMe })
  },

  register: async (userData: any): Promise<any> => {
    return api.post('/auth/register', userData)
  },

  logout: async (): Promise<any> => {
    return api.post('/auth/logout')
  },

  refreshToken: async (refreshToken: string): Promise<any> => {
    return api.post('/auth/refresh', { refreshToken })
  },

  getCurrentUser: async (): Promise<any> => {
    return api.get('/auth/me')
  },

  updateProfile: async (userData: any): Promise<any> => {
    return api.put('/auth/profile', userData)
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<any> => {
    return api.post('/auth/change-password', { currentPassword, newPassword })
  },

  forgotPassword: async (email: string): Promise<any> => {
    return api.post('/auth/forgot-password', { email })
  },

  resetPassword: async (token: string, password: string): Promise<any> => {
    return api.post('/auth/reset-password', { token, password })
  },

  verifyEmail: async (token: string): Promise<any> => {
    return api.post('/auth/verify-email', { token })
  }
}

// Payment API
export const paymentApi = {
  createPaymentIntent: async (bookingId: string, paymentData: any): Promise<any> => {
    return api.post('/payment/create-intent', { bookingId, ...paymentData })
  },

  confirmPayment: async (paymentIntentId: string, paymentMethodId?: string): Promise<any> => {
    return api.post('/payment/confirm', { paymentIntentId, paymentMethodId })
  },

  cancelPayment: async (paymentIntentId: string): Promise<any> => {
    return api.post('/payment/cancel', { paymentIntentId })
  },

  getPaymentStatus: async (paymentIntentId: string): Promise<any> => {
    return api.get(`/payment/status/${paymentIntentId}`)
  },

  processRefund: async (bookingId: string, refundData: any): Promise<any> => {
    return api.post(`/payment/refund/${bookingId}`, refundData)
  }
}

// Utility functions
export const createFormData = (data: any): FormData => {
  const formData = new FormData()

  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key])
    }
  })

  return formData
}

export const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams()

  Object.keys(params).forEach(key => {
    const value = params[key]
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v.toString()))
      } else {
        searchParams.append(key, value.toString())
      }
    }
  })

  return searchParams.toString()
}

export const getApiErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  if (error?.message) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unexpected error occurred'
}

export default api