import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Flight, FlightSearch, FlightFilters, SortOption } from '@/types'

interface FlightSearchState {
  // Search parameters
  searchParams: FlightSearch | null
  searchResults: Flight[]
  loading: boolean
  error: string | null
  hasSearched: boolean

  // UI state
  filters: FlightFilters
  sortBy: SortOption
  viewMode: 'list' | 'grid' | 'map'
  selectedFlights: Flight[]
  comparisonFlights: Flight[]

  // Pagination
  currentPage: number
  totalPages: number
  totalResults: number
  resultsPerPage: number

  // Cache and suggestions
  searchHistory: Array<{
    id: string
    params: FlightSearch
    timestamp: number
    resultCount: number
  }>
  recentSearches: Array<{
    from: string
    to: string
    date: string
  }>
  savedSearches: Array<{
    id: string
    name: string
    params: FlightSearch
    alerts: boolean
  }>

  // Actions
  setSearchParams: (params: FlightSearch) => void
  updateSearchParams: (updates: Partial<FlightSearch>) => void
  setSearchResults: (results: Flight[], total?: number) => void
  appendSearchResults: (results: Flight[], total?: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearSearch: () => void

  // Filter actions
  setFilters: (filters: FlightFilters) => void
  updateFilters: (filters: Partial<FlightFilters>) => void
  clearFilters: () => void
  resetFiltersToDefaults: () => void

  // Sort and view actions
  setSortBy: (sort: SortOption) => void
  setViewMode: (mode: 'list' | 'grid' | 'map') => void

  // Flight selection actions
  selectFlight: (flight: Flight) => void
  deselectFlight: (flightId: string) => void
  toggleFlightSelection: (flight: Flight) => void
  clearSelectedFlights: () => void
  selectMultipleFlights: (flights: Flight[]) => void

  // Comparison actions
  addToComparison: (flight: Flight) => void
  removeFromComparison: (flightId: string) => void
  clearComparison: () => void
  toggleComparison: (flight: Flight) => void

  // Pagination actions
  setCurrentPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
  setResultsPerPage: (perPage: number) => void

  // Search history and saved searches
  addToSearchHistory: (params: FlightSearch, resultCount: number) => void
  addToRecentSearches: (from: string, to: string, date: string) => void
  saveSearch: (name: string, params: FlightSearch, alerts?: boolean) => void
  deleteSavedSearch: (id: string) => void
  toggleSearchAlerts: (id: string) => void
  loadSavedSearch: (id: string) => void
  clearSearchHistory: () => void
  clearRecentSearches: () => void

  // Computed values
  getFilteredResults: () => Flight[]
  getSelectedFlightsCount: () => number
  getComparisonFlightsCount: () => number
  getTotalPrice: () => number
  getAveragePrice: () => number
  getPriceRange: () => [number, number]
  getUniqueAirlines: () => string[]
  getUniqueAirports: () => string[]
  hasActiveFilters: () => boolean
}

const defaultFilters: FlightFilters = {
  priceRange: [0, 5000],
  airlines: [],
  stops: [0, 1, 2],
  durationRange: [0, 24 * 60], // 0 to 24 hours in minutes
  departureTimeRanges: [
    { label: 'Morning', start: '06:00', end: '12:00' },
    { label: 'Afternoon', start: '12:00', end: '18:00' },
    { label: 'Evening', start: '18:00', end: '24:00' },
    { label: 'Night', start: '00:00', end: '06:00' },
  ],
  arrivalTimeRanges: [
    { label: 'Morning', start: '06:00', end: '12:00' },
    { label: 'Afternoon', start: '12:00', end: '18:00' },
    { label: 'Evening', start: '18:00', end: '24:00' },
    { label: 'Night', start: '00:00', end: '06:00' },
  ],
  airports: [],
  directFlightsOnly: false,
  ecoFriendlyOnly: false,
}

export const useFlightStore = create<FlightSearchState>()(
  persist(
    (set, get) => ({
      // Initial state
      searchParams: null,
      searchResults: [],
      loading: false,
      error: null,
      hasSearched: false,

      filters: defaultFilters,
      sortBy: 'best',
      viewMode: 'list',
      selectedFlights: [],
      comparisonFlights: [],

      currentPage: 1,
      totalPages: 1,
      totalResults: 0,
      resultsPerPage: 10,

      searchHistory: [],
      recentSearches: [],
      savedSearches: [],

      // Search actions
      setSearchParams: (params) =>
        set({
          searchParams: params,
          hasSearched: true,
          currentPage: 1,
          selectedFlights: [],
        }),

      updateSearchParams: (updates) =>
        set((state) => ({
          searchParams: state.searchParams ? { ...state.searchParams, ...updates } : null,
        })),

      setSearchResults: (results, total = results.length) =>
        set({
          searchResults: results,
          totalResults: total,
          currentPage: 1,
          totalPages: Math.ceil(total / get().resultsPerPage),
          loading: false,
          error: null,
        }),

      appendSearchResults: (results, total) =>
        set((state) => {
          const newResults = [...state.searchResults, ...results]
          return {
            searchResults: newResults,
            totalResults: total || newResults.length,
            loading: false,
          }
        }),

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error, loading: false }),
      clearSearch: () =>
        set({
          searchParams: null,
          searchResults: [],
          selectedFlights: [],
          comparisonFlights: [],
          currentPage: 1,
          totalPages: 1,
          totalResults: 0,
          hasSearched: false,
          error: null,
          filters: defaultFilters,
        }),

      // Filter actions
      setFilters: (filters) => set({ filters }),
      updateFilters: (updates) =>
        set((state) => ({
          filters: { ...state.filters, ...updates },
          currentPage: 1, // Reset to first page when filters change
        })),
      clearFilters: () => set({ filters: defaultFilters }),
      resetFiltersToDefaults: () => set({ filters: defaultFilters }),

      // Sort and view actions
      setSortBy: (sortBy) => set({ sortBy, currentPage: 1 }),
      setViewMode: (viewMode) => set({ viewMode }),

      // Flight selection actions
      selectFlight: (flight) =>
        set((state) => ({
          selectedFlights: [...state.selectedFlights.filter((f) => f.id !== flight.id), flight],
        })),

      deselectFlight: (flightId) =>
        set((state) => ({
          selectedFlights: state.selectedFlights.filter((f) => f.id !== flightId),
        })),

      toggleFlightSelection: (flight) =>
        set((state) => {
          const isSelected = state.selectedFlights.some((f) => f.id === flight.id)
          if (isSelected) {
            return {
              selectedFlights: state.selectedFlights.filter((f) => f.id !== flight.id),
            }
          } else {
            return { selectedFlights: [...state.selectedFlights, flight] }
          }
        }),

      clearSelectedFlights: () => set({ selectedFlights: [] }),
      selectMultipleFlights: (flights) => set({ selectedFlights: flights }),

      // Comparison actions
      addToComparison: (flight) =>
        set((state) => {
          if (state.comparisonFlights.length >= 4) {
            return state // Limit comparison to 4 flights
          }
          const alreadyAdded = state.comparisonFlights.some((f) => f.id === flight.id)
          if (!alreadyAdded) {
            return { comparisonFlights: [...state.comparisonFlights, flight] }
          }
          return state
        }),

      removeFromComparison: (flightId) =>
        set((state) => ({
          comparisonFlights: state.comparisonFlights.filter((f) => f.id !== flightId),
        })),

      clearComparison: () => set({ comparisonFlights: [] }),

      toggleComparison: (flight) =>
        set((state) => {
          const isComparing = state.comparisonFlights.some((f) => f.id === flight.id)
          if (isComparing) {
            return {
              comparisonFlights: state.comparisonFlights.filter((f) => f.id !== flight.id),
            }
          } else if (state.comparisonFlights.length < 4) {
            return { comparisonFlights: [...state.comparisonFlights, flight] }
          }
          return state
        }),

      // Pagination actions
      setCurrentPage: (currentPage) => set({ currentPage }),
      nextPage: () =>
        set((state) => ({
          currentPage: Math.min(state.currentPage + 1, state.totalPages),
        })),
      previousPage: () =>
        set((state) => ({
          currentPage: Math.max(state.currentPage - 1, 1),
        })),
      setResultsPerPage: (perPage) =>
        set((state) => ({
          resultsPerPage: perPage,
          totalPages: Math.ceil(state.totalResults / perPage),
          currentPage: 1,
        })),

      // Search history and saved searches
      addToSearchHistory: (params, resultCount) =>
        set((state) => {
          const historyItem = {
            id: Date.now().toString(),
            params,
            timestamp: Date.now(),
            resultCount,
          }
          const updatedHistory = [historyItem, ...state.searchHistory.slice(0, 49)] // Keep last 50
          return { searchHistory: updatedHistory }
        }),

      addToRecentSearches: (from, to, date) =>
        set((state) => {
          const search = { from, to, date }
          const filtered = state.recentSearches.filter(
            (s) => !(s.from === from && s.to === to && s.date === date)
          )
          return { recentSearches: [search, ...filtered.slice(0, 9)] } // Keep last 10
        }),

      saveSearch: (name, params, alerts = false) =>
        set((state) => {
          const savedSearch = {
            id: Date.now().toString(),
            name,
            params,
            alerts,
          }
          return { savedSearches: [...state.savedSearches, savedSearch] }
        }),

      deleteSavedSearch: (id) =>
        set((state) => ({
          savedSearches: state.savedSearches.filter((s) => s.id !== id),
        })),

      toggleSearchAlerts: (id) =>
        set((state) => ({
          savedSearches: state.savedSearches.map((s) =>
            s.id === id ? { ...s, alerts: !s.alerts } : s
          ),
        })),

      loadSavedSearch: (id) => {
        const saved = get().savedSearches.find((s) => s.id === id)
        if (saved) {
          get().setSearchParams(saved.params)
        }
      },

      clearSearchHistory: () => set({ searchHistory: [] }),
      clearRecentSearches: () => set({ recentSearches: [] }),

      // Computed values
      getFilteredResults: () => {
        const state = get()
        let results = state.searchResults

        // Apply filters
        results = results.filter((flight) => {
          // Price filter
          if (flight.price.total < state.filters.priceRange[0] || flight.price.total > state.filters.priceRange[1]) {
            return false
          }

          // Airlines filter
          if (state.filters.airlines.length > 0 && !state.filters.airlines.includes(flight.airline.code)) {
            return false
          }

          // Stops filter
          if (state.filters.stops.length > 0 && !state.filters.stops.includes(flight.stops)) {
            return false
          }

          // Duration filter
          if (
            flight.totalDuration < state.filters.durationRange[0] ||
            flight.totalDuration > state.filters.durationRange[1]
          ) {
            return false
          }

          // Direct flights only
          if (state.filters.directFlightsOnly && flight.stops > 0) {
            return false
          }

          // Eco friendly only
          if (state.filters.ecoFriendlyOnly && !flight.isEcoFriendly) {
            return false
          }

          // Airport filter
          if (state.filters.airports.length > 0) {
            const hasMatchingAirport = flight.legs.some(
              (leg) => state.filters.airports.includes(leg.from.code) || state.filters.airports.includes(leg.to.code)
            )
            if (!hasMatchingAirport) return false
          }

          return true
        })

        // Apply sorting
        results.sort((a, b) => {
          switch (state.sortBy) {
            case 'price-low':
              return a.price.total - b.price.total
            case 'price-high':
              return b.price.total - a.price.total
            case 'duration':
              return a.totalDuration - b.totalDuration
            case 'departure-early':
              return new Date(a.legs[0].departure).getTime() - new Date(b.legs[0].departure).getTime()
            case 'departure-late':
              return new Date(b.legs[0].departure).getTime() - new Date(a.legs[0].departure).getTime()
            case 'arrival-early':
              const aArrival = a.legs[a.legs.length - 1].arrival
              const bArrival = b.legs[b.legs.length - 1].arrival
              return new Date(aArrival).getTime() - new Date(bArrival).getTime()
            case 'arrival-late':
              const aArrivalLate = a.legs[a.legs.length - 1].arrival
              const bArrivalLate = b.legs[b.legs.length - 1].arrival
              return new Date(bArrivalLate).getTime() - new Date(aArrivalLate).getTime()
            default:
              // 'best' - default sorting by relevance
              return 0
          }
        })

        return results
      },

      getSelectedFlightsCount: () => get().selectedFlights.length,
      getComparisonFlightsCount: () => get().comparisonFlights.length,
      getTotalPrice: () => get().selectedFlights.reduce((sum, flight) => sum + flight.price.total, 0),
      getAveragePrice: () => {
        const results = get().searchResults
        return results.length > 0 ? results.reduce((sum, f) => sum + f.price.total, 0) / results.length : 0
      },
      getPriceRange: () => {
        const results = get().searchResults
        if (results.length === 0) return [0, 0]
        const prices = results.map((f) => f.price.total)
        return [Math.min(...prices), Math.max(...prices)]
      },
      getUniqueAirlines: () => [...new Set(get().searchResults.map((f) => f.airline.code))],
      getUniqueAirports: () => {
        const airports = new Set<string>()
        get().searchResults.forEach((flight) => {
          flight.legs.forEach((leg) => {
            airports.add(leg.from.code)
            airports.add(leg.to.code)
          })
        })
        return [...airports]
      },
      hasActiveFilters: () => {
        const state = get()
        return (
          state.filters.airlines.length > 0 ||
          state.filters.stops.length < 3 ||
          state.filters.airports.length > 0 ||
          state.filters.directFlightsOnly ||
          state.filters.ecoFriendlyOnly ||
          state.filters.priceRange[0] > 0 ||
          state.filters.priceRange[1] < 5000
        )
      },
    }),
    {
      name: 'flight-search-storage',
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        recentSearches: state.recentSearches,
        savedSearches: state.savedSearches,
        viewMode: state.viewMode,
        resultsPerPage: state.resultsPerPage,
      }),
    }
  )
)