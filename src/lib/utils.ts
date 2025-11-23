import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(dateObj)
}

export function formatTime(time: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(`2000-01-01T${time}`))
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) {
    return `${mins}m`
  } else if (mins === 0) {
    return `${hours}h`
  } else {
    return `${hours}h ${mins}m`
  }
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
}

export function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function calculateAge(birthDate: string | Date): number {
  const today = new Date()
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function getInitials(firstName: string, lastName?: string): string {
  const first = firstName.charAt(0).toUpperCase()
  const last = lastName ? lastName.charAt(0).toUpperCase() : ''
  return `${first}${last}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ')
}

export function getRelativeTime(date: string | Date): string {
  const now = new Date()
  const past = typeof date === 'string' ? new Date(date) : date
  const diffInMs = now.getTime() - past.getTime()
  const diffInMins = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMins < 1) {
    return 'just now'
  } else if (diffInMins < 60) {
    return `${diffInMins} minute${diffInMins !== 1 ? 's' : ''} ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
  } else {
    return formatDate(past)
  }
}

export function getAirportTimezone(airportCode: string): string {
  // Mock timezone mapping - in a real app, this would come from an API or database
  const timezoneMap: Record<string, string> = {
    'JFK': 'America/New_York',
    'LAX': 'America/Los_Angeles',
    'ORD': 'America/Chicago',
    'DFW': 'America/Chicago',
    'DEN': 'America/Denver',
    'SFO': 'America/Los_Angeles',
    'SEA': 'America/Los_Angeles',
    'LAS': 'America/Los_Angeles',
    'PHX': 'America/Phoenix',
    'IAH': 'America/Chicago',
    'CLT': 'America/New_York',
    'MIA': 'America/New_York',
    'BOS': 'America/New_York',
    'MSP': 'America/Chicago',
    'DTW': 'America/Detroit',
    'PHL': 'America/New_York',
    'LGA': 'America/New_York',
    'BWI': 'America/New_York',
    'SLC': 'America/Denver',
    'DCA': 'America/New_York',
    'LHR': 'Europe/London',
    'CDG': 'Europe/Paris',
    'FRA': 'Europe/Berlin',
    'AMS': 'Europe/Amsterdam',
    'MAD': 'Europe/Madrid',
    'FCO': 'Europe/Rome',
    'DXB': 'Asia/Dubai',
    'SIN': 'Asia/Singapore',
    'NRT': 'Asia/Tokyo',
    'HKG': 'Asia/Hong_Kong',
    'SYD': 'Australia/Sydney',
  }

  return timezoneMap[airportCode] || 'UTC'
}

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRates: Record<string, number>
): number {
  if (fromCurrency === toCurrency) return amount

  const fromRate = exchangeRates[fromCurrency] || 1
  const toRate = exchangeRates[toCurrency] || 1

  return (amount / fromRate) * toRate
}

export function getCarbonEmissionOffset(distance: number): {
  tonsCO2: number
  cost: number
} {
  // Rough calculation: 0.15 kg CO2 per km for commercial flights
  const tonsCO2 = (distance * 0.15) / 1000
  // Rough cost: $15 per ton of CO2
  const cost = tonsCO2 * 15

  return {
    tonsCO2: Math.round(tonsCO2 * 100) / 100,
    cost: Math.round(cost * 100) / 100,
  }
}

export function validatePassportNumber(passportNumber: string): boolean {
  // Basic passport number validation - this varies by country
  const passportRegex = /^[A-Z0-9]{6,20}$/
  return passportRegex.test(passportNumber.toUpperCase())
}

export function generateBookingReference(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let reference = ''

  // Format: XXXXXX (6 characters)
  for (let i = 0; i < 6; i++) {
    reference += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return reference
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
}

export function getAirlineLogoUrl(airlineCode: string): string {
  // Mock URL generation - in a real app, this would point to actual logo URLs
  return `https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&h=100&fit=crop&auto=format&${airlineCode}`
}

export function getFlightStatus(status: string): {
  label: string
  color: string
  bgColor: string
} {
  const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
    'on-time': { label: 'On Time', color: 'text-green-700', bgColor: 'bg-green-100' },
    'delayed': { label: 'Delayed', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
    'cancelled': { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100' },
    'boarding': { label: 'Boarding', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    'departed': { label: 'Departed', color: 'text-gray-700', bgColor: 'bg-gray-100' },
    'arrived': { label: 'Arrived', color: 'text-green-700', bgColor: 'bg-green-100' },
  }

  return statusMap[status.toLowerCase()] || {
    label: 'Unknown',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  }
}