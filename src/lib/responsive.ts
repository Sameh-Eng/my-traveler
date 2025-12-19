// Responsive design utilities and breakpoints
import React from 'react'

export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

export type Breakpoint = keyof typeof breakpoints

// Responsive utility functions
export const isMobile = (width: number): boolean => width < parseInt(breakpoints.sm)
export const isTablet = (width: number): boolean => width >= parseInt(breakpoints.sm) && width < parseInt(breakpoints.lg)
export const isDesktop = (width: number): boolean => width >= parseInt(breakpoints.lg)

// Hook for responsive design
export const useResponsive = () => {
  const [windowSize, setWindowSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  })

  React.useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    width: windowSize.width,
    height: windowSize.height,
    isMobile: isMobile(windowSize.width),
    isTablet: isTablet(windowSize.width),
    isDesktop: isDesktop(windowSize.width),
    breakpoints,
  }
}

// Responsive class generators
export const responsiveClasses = {
  // Spacing
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-8 sm:py-12 lg:py-16',
  card: 'p-4 sm:p-6 lg:p-8',

  // Grid layouts
  grid1: 'grid-cols-1',
  grid2: 'grid-cols-1 md:grid-cols-2',
  grid3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  grid4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',

  // Flex layouts
  flexColMobile: 'flex flex-col lg:flex-row',
  flexColTablet: 'flex flex-col md:flex-row lg:flex-row',

  // Text sizes
  heading1: 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl',
  heading2: 'text-xl sm:text-2xl lg:text-3xl',
  heading3: 'text-lg sm:text-xl lg:text-2xl',
  body: 'text-sm sm:text-base',
  small: 'text-xs sm:text-sm',

  // Button sizes
  buttonSm: 'px-3 py-2 text-sm sm:px-4 sm:py-2',
  buttonMd: 'px-4 py-2 sm:px-6 sm:py-3',
  buttonLg: 'px-6 py-3 sm:px-8 sm:py-4',
}

// Responsive utilities for specific use cases
export const getFlightCardResponsiveClasses = () => ({
  container: 'w-full',
  header: 'flex flex-col sm:flex-row sm:items-center sm:justify-between',
  airlineInfo: 'flex items-center space-x-3 mb-3 sm:mb-0',
  actions: 'flex space-x-1',
  flightLegs: 'space-y-4',
  flightLeg: 'flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4',
  departure: 'flex-1 text-left sm:text-left',
  duration: 'px-4 sm:px-6',
  arrival: 'flex-1 text-left sm:text-right',
  price: 'flex flex-col sm:flex-row sm:items-end sm:justify-between space-y-2 sm:space-y-0 sm:space-x-4',
})

export const getBookingWizardResponsiveClasses = () => ({
  container: 'w-full max-w-4xl mx-auto',
  steps: 'flex flex-col sm:flex-row sm:items-center sm:justify-between',
  stepIndicator: 'flex items-center space-x-2',
  content: 'w-full',
  navigation: 'flex flex-col sm:flex-row sm:justify-between space-y-4 sm:space-y-0',
})

export const getDashboardResponsiveClasses = () => ({
  container: 'flex flex-col lg:flex-row min-h-screen',
  sidebar: 'w-full lg:w-64 lg:fixed lg:h-screen',
  mainContent: 'flex-1 lg:ml-64',
  header: 'px-4 sm:px-6 lg:px-8 py-4',
  stats: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6',
  cards: 'space-y-4 sm:space-y-6',
})

// Mobile-first responsive design patterns
export const mobileFirstPatterns = {
  // Hide on mobile, show on larger screens
  hiddenMobile: 'hidden sm:block',
  visibleMobile: 'block sm:hidden',

  // Show as full width on mobile, constrained on desktop
  fullWidthMobile: 'w-full sm:w-auto lg:w-1/2 xl:w-1/3',

  // Stack vertically on mobile, side by side on desktop
  stackMobile: 'flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0',

  // Center on mobile, left align on desktop
  centerMobileLeftDesktop: 'text-center sm:text-left',

  // Small padding on mobile, larger on desktop
  paddingResponsive: 'p-4 sm:p-6 lg:p-8',
}

// Touch-friendly sizing for mobile
export const touchTargets = {
  minimum: 44, // Minimum touch target size in pixels (Apple HIG)
  button: 'min-h-[44px] min-w-[44px]',
  link: 'py-3 px-4',
  icon: 'p-3',
}

// Responsive image utilities
export const responsiveImage = {
  container: 'w-full h-auto',
  avatar: 'w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12',
  hero: 'w-full h-48 sm:h-64 md:h-80 lg:h-96',
  card: 'w-full h-32 sm:h-40 md:h-48',
}

// Form responsive utilities
export const responsiveForm = {
  container: 'w-full max-w-md sm:max-w-lg lg:max-w-xl',
  input: 'w-full text-base sm:text-sm', // Larger text on mobile for iOS
  label: 'text-sm font-medium text-gray-700 mb-1',
  field: 'space-y-2',
  submitButton: 'w-full sm:w-auto',
}

// Navigation responsive utilities
export const responsiveNav = {
  container: 'flex flex-col lg:flex-row lg:items-center lg:justify-between',
  brand: 'text-lg sm:text-xl lg:text-2xl',
  mobileMenu: 'lg:hidden',
  desktopMenu: 'hidden lg:flex',
  mobileButton: 'p-2',
}

// Table responsive utilities
export const responsiveTable = {
  container: 'block overflow-x-auto',
  wrapper: 'min-w-full',
  responsive: 'block lg:table',
  responsiveRow: 'block lg:table-row',
  responsiveCell: 'block lg:table-cell',
}