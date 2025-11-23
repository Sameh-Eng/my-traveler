'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Grid,
  List,
  MapPin,
  Calendar,
  Users,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Plane,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { FlightCard } from '@/components/flights/FlightCard'
import { FlightFilters } from '@/components/flights/FlightFilters'
import { LoadingPage } from '@/components/ui/Loading'
import { useFlightStore } from '@/store'
import { formatCurrency } from '@/lib/utils'

const FlightResultsPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [searchQuery, setSearchQuery] = useState('')

  const {
    searchResults,
    loading,
    error,
    filters,
    setSortBy,
    sortBy,
    viewMode: storeViewMode,
    setViewMode,
    getFilteredResults,
    currentPage,
    totalPages,
    setCurrentPage,
    resultsPerPage,
    totalResults,
    searchParams: flightSearchParams,
    hasSearched
  } = useFlightStore()

  const filteredResults = getFilteredResults()

  useEffect(() => {
    // Get search parameters from URL if available
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const departureDate = searchParams.get('departureDate')
    const returnDate = searchParams.get('returnDate')
    const tripType = searchParams.get('tripType') || 'round-trip'

    if (from && to && departureDate) {
      // This would typically trigger a search with the URL parameters
      console.log('Search params from URL:', { from, to, departureDate, returnDate, tripType })
    }
  }, [searchParams])

  const sortOptions = [
    { value: 'best', label: 'Best' },
    { value: 'price-low', label: 'Price (Low to High)' },
    { value: 'price-high', label: 'Price (High to Low)' },
    { value: 'duration', label: 'Duration (Shortest)' },
    { value: 'departure-early', label: 'Departure (Earliest)' },
    { value: 'departure-late', label: 'Departure (Latest)' },
    { value: 'arrival-early', label: 'Arrival (Earliest)' },
    { value: 'arrival-late', label: 'Arrival (Latest)' }
  ]

  const handleSortChange = (value: string) => {
    setSortBy(value as any)
  }

  const handleViewModeChange = (mode: 'list' | 'grid') => {
    setViewMode(mode)
    setViewMode(mode)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleModifySearch = () => {
    router.push('/flights')
  }

  const handleFlightSelect = (flight: any) => {
    // Navigate to booking page with selected flight
    router.push(`/booking?flightId=${flight.id}`)
  }

  if (loading) {
    return <LoadingPage message="Searching for flights..." />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Info className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Search Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/flights')}>
              Try New Search
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!hasSearched) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Search Performed</h3>
            <p className="text-gray-600 mb-4">
              Please search for flights to see results
            </p>
            <Button onClick={() => router.push('/flights')}>
              Search Flights
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Summary Bar */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Info */}
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {totalResults} flights found
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {flightSearchParams?.flights[0]?.from || 'Origin'} → {flightSearchParams?.flights[0]?.to || 'Destination'}
                  </span>
                  <span>•</span>
                  <Calendar className="h-4 w-4" />
                  <span>
                    {flightSearchParams?.flights[0]?.departureDate || 'Select date'}
                  </span>
                  {flightSearchParams?.tripType === 'round-trip' && (
                    <>
                      <span>•</span>
                      <span>Return: {flightSearchParams?.flights[0]?.returnDate || 'Select date'}</span>
                    </>
                  )}
                  <span>•</span>
                  <Users className="h-4 w-4" />
                  <span>
                    {flightSearchParams?.passengers?.adults || 1} Adults
                    {flightSearchParams?.passengers?.children && `, ${flightSearchParams.passengers.children} Children`}
                    {flightSearchParams?.passengers?.infants && `, ${flightSearchParams.passengers.infants} Infants`}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleModifySearch}
                size="sm"
              >
                Modify Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <FlightFilters />
          </div>

          {/* Mobile Filters Toggle */}
          <div className="lg:hidden">
            <FlightFilters
              isOpen={showMobileFilters}
              onToggle={() => setShowMobileFilters(!showMobileFilters)}
            />
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center justify-between sm:justify-start space-x-4">
                  {/* Sort */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Sort by:</span>
                    <Select value={sortBy} onValueChange={handleSortChange}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* View Mode */}
                  <div className="flex items-center space-x-1">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="icon"
                      onClick={() => handleViewModeChange('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="icon"
                      onClick={() => handleViewModeChange('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Results Count */}
                <div className="text-sm text-gray-600">
                  Showing {Math.min((currentPage - 1) * resultsPerPage + 1, filteredResults.length)}-
                  {Math.min(currentPage * resultsPerPage, filteredResults.length)} of {filteredResults.length} flights
                </div>
              </div>
            </div>

            {/* Flight Results */}
            {filteredResults.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No flights found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search criteria to find more options
                  </p>
                  <div className="space-x-3">
                    <Button variant="outline" onClick={() => router.push('/flights')}>
                      New Search
                    </Button>
                    <Button onClick={() => router.push('/flights/results')}>
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className={`space-y-4 ${viewMode === 'grid' ? 'lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0' : ''}`}>
                  {filteredResults
                    .slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage)
                    .map(flight => (
                      <FlightCard
                        key={flight.id}
                        flight={flight}
                        onSelect={handleFlightSelect}
                        compact={viewMode === 'grid'}
                      />
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlightResultsPage