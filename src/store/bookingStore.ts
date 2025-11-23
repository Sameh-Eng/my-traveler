import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Flight, Passenger, SeatAssignment, BookingExtras, PaymentInfo, Booking, BookingStep } from '@/types'

interface BookingState {
  // Booking data
  selectedFlights: Flight[]
  passengers: Partial<Passenger>[]
  seats: SeatAssignment[]
  extras: Partial<BookingExtras>
  payment: Partial<PaymentInfo>

  // Progress tracking
  currentStep: BookingStep
  completedSteps: BookingStep[]
  validationErrors: Record<string, string[]>
  isDirty: boolean

  // Draft and save state
  isDraft: boolean
  draftId?: string
  lastSaved?: string // ISO datetime
  autoSaveEnabled: boolean

  // Pricing
  basePrice: number
  taxes: number
  fees: number
  totalAmount: number
  currency: string

  // Metadata
  bookingId?: string
  confirmationCode?: string
  pnr?: string
  status: 'draft' | 'pending' | 'confirmed' | 'cancelled' | 'failed'

  // Actions
  // Flight selection
  selectFlight: (flight: Flight) => void
  removeFlight: (flightId: string) => void
  updateFlight: (flightId: string, updates: Partial<Flight>) => void
  clearSelectedFlights: () => void
  setSelectedFlights: (flights: Flight[]) => void

  // Passenger management
  addPassenger: () => void
  updatePassenger: (id: string, data: Partial<Passenger>) => void
  removePassenger: (id: string) => void
  setPassengers: (passengers: Partial<Passenger>[]) => void
  validatePassengers: () => boolean

  // Seat management
  addSeat: (seat: SeatAssignment) => void
  updateSeat: (seatId: string, updates: Partial<SeatAssignment>) => void
  removeSeat: (seatId: string) => void
  clearSeats: () => void
  setSeats: (seats: SeatAssignment[]) => void

  // Extras management
  updateExtras: (extras: Partial<BookingExtras>) => void
  addBaggage: (passengerId: string, weight: number, price: number) => void
  removeBaggage: (passengerId: string, index: number) => void
  addMeal: (passengerId: string, meal: any) => void
  removeMeal: (passengerId: string, index: number) => void
  toggleInsurance: () => void
  updatePriorityBoarding: (enabled: boolean) => void
  updateExtraLegroom: (enabled: boolean) => void
  updateWifiAccess: (enabled: boolean) => void
  updateLoungeAccess: (enabled: boolean) => void

  // Payment management
  updatePayment: (payment: Partial<PaymentInfo>) => void
  setPaymentMethod: (method: string) => void
  setPaymentAmount: (amount: number) => void

  // Step navigation
  nextStep: () => boolean
  previousStep: () => void
  goToStep: (step: BookingStep) => void
  markStepCompleted: (step: BookingStep) => void
  markStepIncomplete: (step: BookingStep) => void

  // Validation
  validateStep: (step: BookingStep) => boolean
  validateCurrentStep: () => boolean
  validateAll: () => boolean
  setValidationError: (field: string, error: string) => void
  clearValidationErrors: () => void
  clearFieldValidationError: (field: string) => void

  // Pricing calculations
  calculateTotal: () => void
  recalculatePricing: () => void
  setCurrency: (currency: string) => void

  // Draft management
  saveDraft: () => Promise<string>
  loadDraft: (draftId: string) => Promise<boolean>
  deleteDraft: (draftId: string) => Promise<void>
  enableAutoSave: () => void
  disableAutoSave: () => void
  clearBooking: () => void

  // Booking completion
  completeBooking: () => Promise<Booking>
  confirmBooking: (confirmation: any) => void
  resetBooking: () => void

  // Computed helpers
  getTotalPassengers: () => number
  getTotalAdults: () => number
  getTotalChildren: () => number
  getTotalInfants: () => number
  getSelectedFlightsTotal: () => number
  getExtrasTotal: () => number
  getSeatTotal: () => number
  isComplete: () => boolean
  canProceedToNextStep: () => boolean
  getStepProgress: () => number
  getBookingSummary: () => any
}

const steps: BookingStep[] = ['flights', 'passengers', 'seats', 'extras', 'payment', 'review']

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedFlights: [],
      passengers: [],
      seats: [],
      extras: {
        baggage: [],
        meals: [],
        insurance: false,
        priorityBoarding: false,
        extraLegroom: false,
        wifiAccess: false,
        loungeAccess: false,
        seatSelection: false,
      },
      payment: {},

      currentStep: 'flights',
      completedSteps: [],
      validationErrors: {},
      isDirty: false,

      isDraft: true,
      draftId: undefined,
      lastSaved: undefined,
      autoSaveEnabled: true,

      basePrice: 0,
      taxes: 0,
      fees: 0,
      totalAmount: 0,
      currency: 'USD',

      status: 'draft',

      // Flight selection actions
      selectFlight: (flight) =>
        set((state) => {
          const exists = state.selectedFlights.some((f) => f.id === flight.id)
          if (exists) return state

          const newSelectedFlights = [...state.selectedFlights, flight]
          return {
            selectedFlights: newSelectedFlights,
            isDirty: true,
            basePrice: newSelectedFlights.reduce((sum, f) => sum + f.price.total, 0),
          }
        }),

      removeFlight: (flightId) =>
        set((state) => {
          const newSelectedFlights = state.selectedFlights.filter((f) => f.id !== flightId)
          const newSeats = state.seats.filter((s) => s.flightId !== flightId)
          return {
            selectedFlights: newSelectedFlights,
            seats: newSeats,
            isDirty: true,
            basePrice: newSelectedFlights.reduce((sum, f) => sum + f.price.total, 0),
          }
        }),

      updateFlight: (flightId, updates) =>
        set((state) => ({
          selectedFlights: state.selectedFlights.map((f) =>
            f.id === flightId ? { ...f, ...updates } : f
          ),
          isDirty: true,
        })),

      clearSelectedFlights: () =>
        set({
          selectedFlights: [],
          seats: [],
          basePrice: 0,
          isDirty: true,
        }),

      setSelectedFlights: (flights) =>
        set({
          selectedFlights: flights,
          basePrice: flights.reduce((sum, f) => sum + f.price.total, 0),
          isDirty: true,
        }),

      // Passenger management
      addPassenger: () =>
        set((state) => {
          const newPassenger: Partial<Passenger> = {
            id: `passenger_${Date.now()}`,
            frequentFlyer: [],
            specialAssistance: [],
          }
          return {
            passengers: [...state.passengers, newPassenger],
            isDirty: true,
          }
        }),

      updatePassenger: (id, data) =>
        set((state) => ({
          passengers: state.passengers.map((p) => (p.id === id ? { ...p, ...data } : p)),
          isDirty: true,
        })),

      removePassenger: (id) =>
        set((state) => ({
          passengers: state.passengers.filter((p) => p.id !== id),
          seats: state.seats.filter((s) => s.passengerId !== id),
          extras: {
            ...state.extras,
            baggage: state.extras.baggage?.filter((b) => b.passengerId !== id) || [],
            meals: state.extras.meals?.filter((m) => m.passengerId !== id) || [],
          },
          isDirty: true,
        })),

      setPassengers: (passengers) =>
        set({
          passengers,
          isDirty: true,
        }),

      validatePassengers: () => {
        const state = get()
        const errors: Record<string, string[]> = {}

        state.passengers.forEach((passenger, index) => {
          const passengerErrors: string[] = []

          if (!passenger.firstName) passengerErrors.push('First name is required')
          if (!passenger.lastName) passengerErrors.push('Last name is required')
          if (!passenger.dateOfBirth) passengerErrors.push('Date of birth is required')
          if (!passenger.gender) passengerErrors.push('Gender is required')

          if (passenger.contact) {
            if (!passenger.contact.email) passengerErrors.push('Email is required')
            if (!passenger.contact.phone) passengerErrors.push('Phone is required')
          }

          if (passengerErrors.length > 0) {
            errors[`passenger_${index}`] = passengerErrors
          }
        })

        set({ validationErrors: { ...get().validationErrors, ...errors } })
        return Object.keys(errors).length === 0
      },

      // Seat management
      addSeat: (seat) =>
        set((state) => {
          // Remove existing seat for the same passenger/flight
          const filteredSeats = state.seats.filter(
            (s) => !(s.passengerId === seat.passengerId && s.flightId === seat.flightId)
          )
          return {
            seats: [...filteredSeats, seat],
            isDirty: true,
          }
        }),

      updateSeat: (seatId, updates) =>
        set((state) => ({
          seats: state.seats.map((s) => (s.id === seatId ? { ...s, ...updates } : s)),
          isDirty: true,
        })),

      removeSeat: (seatId) =>
        set((state) => ({
          seats: state.seats.filter((s) => s.id !== seatId),
          isDirty: true,
        })),

      clearSeats: () =>
        set({
          seats: [],
          isDirty: true,
        }),

      setSeats: (seats) =>
        set({
          seats,
          isDirty: true,
        }),

      // Extras management
      updateExtras: (extras) =>
        set((state) => ({
          extras: { ...state.extras, ...extras },
          isDirty: true,
        })),

      addBaggage: (passengerId, weight, price) =>
        set((state) => {
          const baggage = [...(state.extras.baggage || [])]
          baggage.push({ passengerId, weight, price })
          return {
            extras: { ...state.extras, baggage },
            isDirty: true,
          }
        }),

      removeBaggage: (passengerId, index) =>
        set((state) => {
          const baggage = state.extras.baggage?.filter(
            (b, i) => !(b.passengerId === passengerId && i === index)
          )
          return {
            extras: { ...state.extras, baggage },
            isDirty: true,
          }
        }),

      addMeal: (passengerId, meal) =>
        set((state) => {
          const meals = [...(state.extras.meals || [])]
          meals.push({ passengerId, ...meal })
          return {
            extras: { ...state.extras, meals },
            isDirty: true,
          }
        }),

      removeMeal: (passengerId, index) =>
        set((state) => {
          const meals = state.extras.meals?.filter(
            (m, i) => !(m.passengerId === passengerId && i === index)
          )
          return {
            extras: { ...state.extras, meals },
            isDirty: true,
          }
        }),

      toggleInsurance: () =>
        set((state) => ({
          extras: { ...state.extras, insurance: !state.extras.insurance },
          isDirty: true,
        })),

      updatePriorityBoarding: (enabled) =>
        set((state) => ({
          extras: { ...state.extras, priorityBoarding: enabled },
          isDirty: true,
        })),

      updateExtraLegroom: (enabled) =>
        set((state) => ({
          extras: { ...state.extras, extraLegroom: enabled },
          isDirty: true,
        })),

      updateWifiAccess: (enabled) =>
        set((state) => ({
          extras: { ...state.extras, wifiAccess: enabled },
          isDirty: true,
        })),

      updateLoungeAccess: (enabled) =>
        set((state) => ({
          extras: { ...state.extras, loungeAccess: enabled },
          isDirty: true,
        })),

      // Payment management
      updatePayment: (payment) =>
        set((state) => ({
          payment: { ...state.payment, ...payment },
          isDirty: true,
        })),

      setPaymentMethod: (method) =>
        set((state) => ({
          payment: { ...state.payment, method },
          isDirty: true,
        })),

      setPaymentAmount: (amount) =>
        set((state) => ({
          payment: { ...state.payment, amount },
          isDirty: true,
        })),

      // Step navigation
      nextStep: () => {
        const state = get()
        if (!state.validateCurrentStep()) return false

        const currentIndex = steps.indexOf(state.currentStep)
        if (currentIndex < steps.length - 1) {
          const nextStep = steps[currentIndex + 1]
          set((prev) => ({
            currentStep: nextStep,
            completedSteps: [...prev.completedSteps, prev.currentStep],
          }))
          return true
        }
        return false
      },

      previousStep: () => {
        const state = get()
        const currentIndex = steps.indexOf(state.currentStep)
        if (currentIndex > 0) {
          const previousStep = steps[currentIndex - 1]
          set({ currentStep: previousStep })
        }
      },

      goToStep: (step) => {
        const state = get()
        const currentIndex = steps.indexOf(state.currentStep)
        const targetIndex = steps.indexOf(step)

        // Allow going back to any completed step
        if (targetIndex <= currentIndex || state.completedSteps.includes(step)) {
          set({ currentStep: step })
        }
      },

      markStepCompleted: (step) =>
        set((state) => ({
          completedSteps: [...state.completedSteps, step],
        })),

      markStepIncomplete: (step) =>
        set((state) => ({
          completedSteps: state.completedSteps.filter((s) => s !== step),
        })),

      // Validation
      validateStep: (step) => {
        const state = get()
        switch (step) {
          case 'flights':
            return state.selectedFlights.length > 0
          case 'passengers':
            return state.validatePassengers()
          case 'seats':
            // Seats are optional, but if flights require seat selection, validate here
            return true
          case 'extras':
            // Extras are optional
            return true
          case 'payment':
            return !!state.payment.method && !!state.payment.amount
          case 'review':
            // Final review - validate everything
            return state.validateAll()
          default:
            return false
        }
      },

      validateCurrentStep: () => {
        const state = get()
        return state.validateStep(state.currentStep)
      },

      validateAll: () => {
        const state = get()
        const allValid = steps.every((step) => state.validateStep(step))
        return allValid && state.selectedFlights.length > 0 && state.passengers.length > 0
      },

      setValidationError: (field, error) =>
        set((state) => ({
          validationErrors: { ...state.validationErrors, [field]: [error] },
        })),

      clearValidationErrors: () =>
        set({ validationErrors: {} }),

      clearFieldValidationError: (field) =>
        set((state) => {
          const newErrors = { ...state.validationErrors }
          delete newErrors[field]
          return { validationErrors: newErrors }
        }),

      // Pricing calculations
      calculateTotal: () => {
        const state = get()
        const flightTotal = state.basePrice
        const seatTotal = state.getSeatTotal()
        const extrasTotal = state.getExtrasTotal()
        const taxes = Math.round((flightTotal + seatTotal) * 0.12) // 12% tax
        const fees = 25 // Fixed booking fee
        const total = flightTotal + seatTotal + extrasTotal + taxes + fees

        set({
          taxes,
          fees,
          totalAmount: total,
        })
      },

      recalculatePricing: () => {
        get().calculateTotal()
      },

      setCurrency: (currency) =>
        set({ currency }),

      // Draft management
      saveDraft: async () => {
        const state = get()
        const draftId = state.draftId || `draft_${Date.now()}`
        const draftData = {
          id: draftId,
          data: {
            selectedFlights: state.selectedFlights,
            passengers: state.passengers,
            seats: state.seats,
            extras: state.extras,
            payment: state.payment,
            currentStep: state.currentStep,
            completedSteps: state.completedSteps,
          },
          lastSaved: new Date().toISOString(),
        }

        // In a real app, save to API/localStorage
        localStorage.setItem(`booking_draft_${draftId}`, JSON.stringify(draftData))

        set({
          draftId,
          lastSaved: draftData.lastSaved,
          isDirty: false,
        })

        return draftId
      },

      loadDraft: async (draftId) => {
        try {
          const draftData = localStorage.getItem(`booking_draft_${draftId}`)
          if (!draftData) return false

          const draft = JSON.parse(draftData)
          set({
            ...draft.data,
            draftId: draft.id,
            lastSaved: draft.lastSaved,
            isDirty: false,
          })

          return true
        } catch (error) {
          console.error('Failed to load draft:', error)
          return false
        }
      },

      deleteDraft: async (draftId) => {
        localStorage.removeItem(`booking_draft_${draftId}`)
        if (get().draftId === draftId) {
          get().resetBooking()
        }
      },

      enableAutoSave: () =>
        set({ autoSaveEnabled: true }),

      disableAutoSave: () =>
        set({ autoSaveEnabled: false }),

      clearBooking: () =>
        set({
          selectedFlights: [],
          passengers: [],
          seats: [],
          extras: {
            baggage: [],
            meals: [],
            insurance: false,
            priorityBoarding: false,
            extraLegroom: false,
            wifiAccess: false,
            loungeAccess: false,
            seatSelection: false,
          },
          payment: {},
          currentStep: 'flights',
          completedSteps: [],
          validationErrors: {},
          isDirty: false,
          basePrice: 0,
          taxes: 0,
          fees: 0,
          totalAmount: 0,
          status: 'draft',
          bookingId: undefined,
          confirmationCode: undefined,
          pnr: undefined,
        }),

      // Booking completion
      completeBooking: async () => {
        const state = get()
        if (!state.validateAll()) {
          throw new Error('Booking validation failed')
        }

        // In a real app, call booking API
        const booking = {
          id: `booking_${Date.now()}`,
          confirmationCode: 'ABC123',
          pnr: 'XYZ789',
          status: 'confirmed' as const,
          selectedFlights: state.selectedFlights,
          passengers: state.passengers,
          seats: state.seats,
          extras: state.extras,
          payment: state.payment,
          totalAmount: state.totalAmount,
          currency: state.currency,
        }

        set({
          bookingId: booking.id,
          confirmationCode: booking.confirmationCode,
          pnr: booking.pnr,
          status: booking.status,
        })

        return booking
      },

      confirmBooking: (confirmation) =>
        set((state) => ({
          ...confirmation,
          status: 'confirmed',
          isDraft: false,
        })),

      resetBooking: () => {
        get().clearBooking()
      },

      // Computed helpers
      getTotalPassengers: () => get().passengers.length,
      getTotalAdults: () => get().passengers.filter((p) => {
        if (!p.dateOfBirth) return 0
        const age = new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()
        return age >= 12
      }).length,
      getTotalChildren: () => get().passengers.filter((p) => {
        if (!p.dateOfBirth) return 0
        const age = new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()
        return age >= 2 && age < 12
      }).length,
      getTotalInfants: () => get().passengers.filter((p) => {
        if (!p.dateOfBirth) return 0
        const age = new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()
        return age < 2
      }).length,
      getSelectedFlightsTotal: () => get().basePrice,
      getExtrasTotal: () => {
        const state = get()
        let total = 0

        // Baggage
        if (state.extras.baggage) {
          total += state.extras.baggage.reduce((sum, b) => sum + b.price, 0)
        }

        // Meals
        if (state.extras.meals) {
          total += state.extras.meals.reduce((sum, m) => sum + m.price, 0)
        }

        // Insurance
        if (state.extras.insurance) {
          total += 50 // Fixed insurance price
        }

        // Priority boarding
        if (state.extras.priorityBoarding) {
          total += 25
        }

        // Extra legroom
        if (state.extras.extraLegroom) {
          total += state.passengers.length * 15
        }

        // WiFi access
        if (state.extras.wifiAccess) {
          total += state.passengers.length * 10
        }

        // Lounge access
        if (state.extras.loungeAccess) {
          total += state.passengers.length * 50
        }

        return total
      },
      getSeatTotal: () => {
        const state = get()
        return state.seats.reduce((sum, seat) => sum + seat.price, 0)
      },
      isComplete: () => {
        const state = get()
        return (
          state.selectedFlights.length > 0 &&
          state.passengers.length > 0 &&
          state.validateAll()
        )
      },
      canProceedToNextStep: () => {
        const state = get()
        return state.validateCurrentStep()
      },
      getStepProgress: () => {
        const state = get()
        const currentIndex = steps.indexOf(state.currentStep)
        const completedCount = state.completedSteps.length
        return ((completedCount + (state.validateCurrentStep() ? 1 : 0)) / steps.length) * 100
      },
      getBookingSummary: () => {
        const state = get()
        return {
          flights: state.selectedFlights,
          passengers: state.passengers,
          seats: state.seats,
          extras: state.extras,
          pricing: {
            basePrice: state.basePrice,
            taxes: state.taxes,
            fees: state.fees,
            extrasTotal: state.getExtrasTotal(),
            seatTotal: state.getSeatTotal(),
            totalAmount: state.totalAmount,
          },
          status: state.status,
          confirmationCode: state.confirmationCode,
          currentStep: state.currentStep,
          progress: state.getStepProgress(),
        }
      },
    }),
    {
      name: 'booking-storage',
      partialize: (state) => ({
        // Only persist essential booking data
        selectedFlights: state.selectedFlights,
        passengers: state.passengers,
        seats: state.seats,
        extras: state.extras,
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        currency: state.currency,
        autoSaveEnabled: state.autoSaveEnabled,
      }),
    }
  )
)