/**
 * Flight Mock Data - Fallback flight data when external API fails
 * Contains 20 realistic flight entries for major routes
 */

/**
 * Generate realistic flight data for fallback mode
 */
class FlightMockData {
  constructor() {
    this.airports = {
      'JFK': { name: 'John F. Kennedy International', city: 'New York', country: 'USA', timezone: 'America/New_York' },
      'LAX': { name: 'Los Angeles International', city: 'Los Angeles', country: 'USA', timezone: 'America/Los_Angeles' },
      'ORD': { name: "O'Hare International", city: 'Chicago', country: 'USA', timezone: 'America/Chicago' },
      'DFW': { name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'USA', timezone: 'America/Chicago' },
      'DEN': { name: 'Denver International', city: 'Denver', country: 'USA', timezone: 'America/Denver' },
      'SFO': { name: 'San Francisco International', city: 'San Francisco', country: 'USA', timezone: 'America/Los_Angeles' },
      'SEA': { name: 'Seattle-Tacoma International', city: 'Seattle', country: 'USA', timezone: 'America/Los_Angeles' },
      'BOS': { name: 'Logan International', city: 'Boston', country: 'USA', timezone: 'America/New_York' },
      'MIA': { name: 'Miami International', city: 'Miami', country: 'USA', timezone: 'America/New_York' },
      'ATL': { name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', country: 'USA', timezone: 'America/New_York' },
      'LHR': { name: 'London Heathrow', city: 'London', country: 'UK', timezone: 'Europe/London' },
      'CDG': { name: 'Charles de Gaulle', city: 'Paris', country: 'France', timezone: 'Europe/Paris' },
      'AMS': { name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', timezone: 'Europe/Amsterdam' },
      'FRA': { name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', timezone: 'Europe/Berlin' },
      'DXB': { name: 'Dubai International', city: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai' },
      'SIN': { name: 'Singapore Changi', city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore' },
      'NRT': { name: 'Narita International', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
      'SYD': { name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney' },
      'YYZ': { name: 'Toronto Pearson International', city: 'Toronto', country: 'Canada', timezone: 'America/Toronto' },
      'MEX': { name: 'Mexico City International', city: 'Mexico City', country: 'Mexico', timezone: 'America/Mexico_City' }
    };

    this.airlines = [
      { name: 'American Airlines', iata: 'AA', icao: 'AAL' },
      { name: 'Delta Air Lines', iata: 'DL', icao: 'DAL' },
      { name: 'United Airlines', iata: 'UA', icao: 'UAL' },
      { name: 'Southwest Airlines', iata: 'WN', icao: 'SWA' },
      { name: 'JetBlue Airways', iata: 'B6', icao: 'JBU' },
      { name: 'Alaska Airlines', iata: 'AS', icao: 'ASA' },
      { name: 'Spirit Airlines', iata: 'NK', icao: 'NKS' },
      { name: 'Frontier Airlines', iata: 'F9', icao: 'FFT' },
      { name: 'British Airways', iata: 'BA', icao: 'BAW' },
      { name: 'Lufthansa', iata: 'LH', icao: 'DLH' },
      { name: 'Air France', iata: 'AF', icao: 'AFR' },
      { name: 'Emirates', iata: 'EK', icao: 'UAE' },
      { name: 'Qatar Airways', iata: 'QR', icao: 'QTR' },
      { name: 'Singapore Airlines', iata: 'SQ', icao: 'SIA' },
      { name: 'Cathay Pacific', iata: 'CX', icao: 'CPA' },
      { name: 'ANA All Nippon Airways', iata: 'NH', icao: 'ANA' },
      { name: 'Korean Air', iata: 'KE', icao: 'KAL' },
      { name: 'Qantas', iata: 'QF', icao: 'QFA' },
      { name: 'Air Canada', iata: 'AC', icao: 'ACA' },
      { name: 'Mexicana', iata: 'MX', icao: 'MXA' }
    ];

    this.aircraft = [
      { iata: 'A320', icao: 'A320', name: 'Airbus A320', capacity: 150 },
      { iata: 'A321', icao: 'A321', name: 'Airbus A321', capacity: 185 },
      { iata: 'A330', icao: 'A330', name: 'Airbus A330', capacity: 290 },
      { iata: 'A350', icao: 'A350', name: 'Airbus A350', capacity: 325 },
      { iata: 'B737', icao: 'B737', name: 'Boeing 737', capacity: 160 },
      { iata: 'B738', icao: 'B738', name: 'Boeing 737-800', capacity: 162 },
      { iata: 'B739', icao: 'B739', name: 'Boeing 737-900', capacity: 178 },
      { iata: 'B752', icao: 'B752', name: 'Boeing 757-200', capacity: 200 },
      { iata: 'B763', icao: 'B763', name: 'Boeing 767-300', capacity: 269 },
      { iata: 'B772', icao: 'B772', name: 'Boeing 777-200', capacity: 317 },
      { iata: 'B773', icao: 'B773', name: 'Boeing 777-300', capacity: 396 },
      { iata: 'B788', icao: 'B788', name: 'Boeing 787-8', capacity: 248 },
      { iata: 'B789', icao: 'B789', name: 'Boeing 787-9', capacity: 290 },
      { iata: 'E190', icao: 'E190', name: 'Embraer E190', capacity: 96 },
      { iata: 'CRJ9', icao: 'CRJ9', name: 'Bombardier CRJ-900', capacity: 76 }
    ];

    this.mockFlights = this.generateMockFlights();
  }

  /**
   * Generate realistic mock flight data
   * @returns {Array} Array of mock flight objects
   */
  generateMockFlights() {
    const flights = [];
    const routes = [
      // US Domestic Routes
      { origin: 'JFK', destination: 'LAX', basePrice: 350 },
      { origin: 'LAX', destination: 'JFK', basePrice: 350 },
      { origin: 'ORD', destination: 'LAX', basePrice: 280 },
      { origin: 'DFW', destination: 'ORD', basePrice: 220 },
      { origin: 'SFO', destination: 'SEA', basePrice: 180 },
      { origin: 'BOS', destination: 'MIA', basePrice: 240 },
      { origin: 'ATL', destination: 'DEN', basePrice: 200 },
      { origin: 'SEA', destination: 'BOS', basePrice: 320 },

      // International Routes
      { origin: 'JFK', destination: 'LHR', basePrice: 650 },
      { origin: 'LHR', destination: 'JFK', basePrice: 650 },
      { origin: 'LAX', destination: 'NRT', basePrice: 890 },
      { origin: 'NRT', destination: 'LAX', basePrice: 890 },
      { origin: 'DXB', destination: 'SYD', basePrice: 1200 },
      { origin: 'SYD', destination: 'DXB', basePrice: 1200 },
      { origin: 'SIN', destination: 'FRA', basePrice: 780 },
      { origin: 'FRA', destination: 'SIN', basePrice: 780 },
      { origin: 'CDG', destination: 'MEX', basePrice: 890 },
      { origin: 'MEX', destination: 'CDG', basePrice: 890 },
      { origin: 'YYZ', destination: 'AMS', basePrice: 520 },
      { origin: 'AMS', destination: 'YYZ', basePrice: 520 },
      { origin: 'ORD', destination: 'YYZ', basePrice: 180 },
      { origin: 'YYZ', destination: 'ORD', basePrice: 180 },
      // Europe Short Haul
      { origin: 'LHR', destination: 'CDG', basePrice: 220 },
      { origin: 'CDG', destination: 'LHR', basePrice: 220 }
    ];

    // Generate 20 flights
    for (let i = 0; i < 20; i++) {
      const route = routes[i % routes.length];
      const airline = this.airlines[Math.floor(Math.random() * this.airlines.length)];
      const aircraft = this.aircraft[Math.floor(Math.random() * this.aircraft.length)];
      const flightNumber = this.generateFlightNumber(airline.iata, i + 1);
      const departureTime = this.generateDepartureTime();
      const duration = this.calculateDuration(route.origin, route.destination);
      const arrivalTime = new Date(departureTime.getTime() + duration);

      flights.push({
        id: `MOCK-${flightNumber}-${i + 1}`,
        flightNumber: flightNumber,
        airline: airline,
        aircraft: aircraft,
        origin: {
          iata: route.origin,
          name: this.airports[route.origin].name,
          city: this.airports[route.origin].city,
          country: this.airports[route.origin].country,
          timezone: this.airports[route.origin].timezone,
          scheduled: departureTime.toISOString(),
          terminal: this.generateTerminal(),
          gate: this.generateGate()
        },
        destination: {
          iata: route.destination,
          name: this.airports[route.destination].name,
          city: this.airports[route.destination].city,
          country: this.airports[route.destination].country,
          timezone: this.airports[route.destination].timezone,
          scheduled: arrivalTime.toISOString(),
          terminal: this.generateTerminal(),
          gate: this.generateGate()
        },
        departure: departureTime.toISOString(),
        arrival: arrivalTime.toISOString(),
        duration: this.formatDuration(duration),
        price: this.generatePrice(route.basePrice),
        seats: this.generateSeats(aircraft.capacity),
        status: this.generateStatus(),
        isDirect: Math.random() > 0.3,
        aircraftRegistration: this.generateAircraftRegistration()
      });
    }

    return flights;
  }

  /**
   * Generate flight number
   * @param {string} airlineIATA - Airline IATA code
   * @param {number} index - Flight index
   * @returns {string} Flight number
   */
  generateFlightNumber(airlineIATA, index) {
    const number = String(100 + index).padStart(4, '0');
    return `${airlineIATA}${number}`;
  }

  /**
   * Generate departure time within next 30 days
   * @returns {Date} Departure time
   */
  generateDepartureTime() {
    const now = new Date();
    const daysUntilFlight = Math.floor(Math.random() * 30);
    const departureDate = new Date(now);
    departureDate.setDate(now.getDate() + daysUntilFlight);

    // Random time during the day
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);
    departureDate.setHours(hours, minutes, 0, 0);

    return departureDate;
  }

  /**
   * Calculate flight duration in milliseconds
   * @param {string} origin - Origin IATA code
   * @param {string} destination - Destination IATA code
   * @returns {number} Duration in milliseconds
   */
  calculateDuration(origin, destination) {
    // Simplified duration calculation based on route type
    const durations = {
      // US Domestic flights (2-6 hours)
      'JFK-LAX': 6 * 60 * 60 * 1000,
      'LAX-JFK': 6 * 60 * 60 * 1000,
      'ORD-LAX': 4 * 60 * 60 * 1000,
      'LAX-ORD': 4 * 60 * 60 * 1000,
      'DFW-ORD': 2.5 * 60 * 60 * 1000,
      'SFO-SEA': 2 * 60 * 60 * 1000,
      'BOS-MIA': 3 * 60 * 60 * 1000,
      'ATL-DEN': 2.5 * 60 * 60 * 1000,
      'SEA-BOS': 5 * 60 * 60 * 1000,
      'ORD-YYZ': 1.5 * 60 * 60 * 1000,

      // International flights (6-16 hours)
      'JFK-LHR': 7 * 60 * 60 * 1000,
      'LHR-JFK': 8 * 60 * 60 * 1000,
      'LAX-NRT': 11 * 60 * 60 * 1000,
      'NRT-LAX': 11 * 60 * 60 * 1000,
      'DXB-SYD': 14 * 60 * 60 * 1000,
      'SYD-DXB': 13 * 60 * 60 * 1000,
      'SIN-FRA': 12 * 60 * 60 * 1000,
      'CDG-MEX': 9 * 60 * 60 * 1000,
      'AMS-YYZ': 8 * 60 * 60 * 1000,
      'LHR-CDG': 1.25 * 60 * 60 * 1000,
      'CDG-LHR': 1.25 * 60 * 60 * 1000
    };

    const routeKey = `${origin}-${destination}`;
    return durations[routeKey] || (4 * 60 * 60 * 1000); // Default 4 hours
  }

  /**
   * Format duration in human readable format
   * @param {number} durationMs - Duration in milliseconds
   * @returns {string} Formatted duration
   */
  formatDuration(durationMs) {
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  /**
   * Generate terminal number
   * @returns {string} Terminal number or letter
   */
  generateTerminal() {
    const terminals = ['1', '2', '3', '4', '5', 'A', 'B', 'C', 'D', 'E', 'F'];
    return terminals[Math.floor(Math.random() * terminals.length)];
  }

  /**
   * Generate gate number
   * @returns {string} Gate number
   */
  generateGate() {
    const gateLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
    const gateNumber = Math.floor(Math.random() * 50) + 1; // 1-50
    return `${gateLetter}${gateNumber}`;
  }

  /**
   * Generate aircraft registration
   * @returns {string} Aircraft registration number
   */
  generateAircraftRegistration() {
    const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
      String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const numbers = Math.floor(Math.random() * 10000);
    return `${letters}${numbers}`;
  }

  /**
   * Generate flight prices for different cabin classes
   * @param {number} basePrice - Base economy price
   * @returns {Object} Prices for all cabin classes
   */
  generatePrice(basePrice) {
    const economyPrice = basePrice + Math.floor(Math.random() * 100) - 50;
    const businessPrice = Math.round(economyPrice * 3.2);
    const firstPrice = Math.round(economyPrice * 5.8);

    return {
      economy: Math.max(100, economyPrice),
      business: Math.max(300, businessPrice),
      first: Math.max(500, firstPrice)
    };
  }

  /**
   * Generate available seats
   * @param {number} capacity - Aircraft capacity
   * @returns {Object} Available seats per cabin
   */
  generateSeats(capacity) {
    const economySeats = Math.floor(capacity * 0.7);
    const businessSeats = Math.floor(capacity * 0.2);
    const firstSeats = Math.floor(capacity * 0.1);

    return {
      economy: Math.floor(economySeats * (0.3 + Math.random() * 0.6)), // 30-90% occupied
      business: Math.floor(businessSeats * (0.2 + Math.random() * 0.6)), // 20-80% occupied
      first: Math.floor(firstSeats * (0.1 + Math.random() * 0.4)) // 10-50% occupied
    };
  }

  /**
   * Generate flight status
   * @returns {string} Flight status
   */
  generateStatus() {
    const statuses = ['scheduled', 'on-time', 'delayed', 'boarding', 'departed', 'in-flight', 'landed'];
    const weights = [30, 25, 10, 5, 10, 15, 5]; // Weight distribution
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    let random = Math.random() * totalWeight;
    for (let i = 0; i < statuses.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return statuses[i];
      }
    }
    return statuses[0];
  }

  /**
   * Search flights using mock data
   * @param {Object} searchParams - Search parameters
   * @returns {Object} Search results
   */
  searchFlights(searchParams) {
    const { origin, destination, departureDate, adults = 1, children = 0, infants = 0 } = searchParams;

    let filteredFlights = this.mockFlights.filter(flight => {
      // Filter by origin and destination
      if (origin && flight.origin.iata !== origin.toUpperCase()) return false;
      if (destination && flight.destination.iata !== destination.toUpperCase()) return false;

      // Filter by departure date (within same day)
      if (departureDate) {
        const searchDate = new Date(departureDate);
        const flightDate = new Date(flight.departure);

        if (searchDate.toDateString() !== flightDate.toDateString()) {
          return false;
        }
      }

      // Filter direct flights if requested
      if (searchParams.direct && !flight.isDirect) {
        return false;
      }

      return true;
    });

    // Sort by departure time
    filteredFlights.sort((a, b) => new Date(a.departure) - new Date(b.departure));

    // Apply pagination
    const limit = Math.min(searchParams.limit || 20, 100);
    const offset = Math.max(searchParams.offset || 0, 0);
    const paginatedFlights = filteredFlights.slice(offset, offset + limit);

    // Transform to API response format
    const transformedFlights = paginatedFlights.map(flight => ({
      flightId: flight.id,
      flightNumber: flight.flightNumber,
      airline: {
        name: flight.airline.name,
        iata: flight.airline.iata,
        icao: flight.airline.icao
      },
      departure: {
        airport: flight.origin.name,
        iata: flight.origin.iata,
        icao: flight.origin.iata,
        city: flight.origin.city,
        country: flight.origin.country,
        terminal: flight.origin.terminal,
        gate: flight.origin.gate,
        scheduled: flight.origin.scheduled,
        estimated: flight.origin.scheduled,
        actual: null,
        delayed: false,
        timezone: flight.origin.timezone
      },
      arrival: {
        airport: flight.destination.name,
        iata: flight.destination.iata,
        icao: flight.destination.icao,
        city: flight.destination.city,
        country: flight.destination.country,
        terminal: flight.destination.terminal,
        gate: flight.destination.gate,
        scheduled: flight.destination.scheduled,
        estimated: flight.destination.scheduled,
        actual: null,
        delayed: false,
        timezone: flight.destination.timezone
      },
      aircraft: {
        iata: flight.aircraft.iata,
        icao: flight.aircraft.icao,
        name: flight.aircraft.name,
        registration: flight.aircraftRegistration
      },
      flight: {
        iata: flight.flightNumber,
        number: flight.flightNumber.replace(/^[A-Z]+/, '')
      },
      status: flight.status,
      duration: flight.duration,
      distance: this.estimateDistance(flight.origin.iata, flight.destination.iata),
      price: flight.price,
      seats: flight.seats,
      isDirect: flight.isDirect,
      totalPassengers: adults + children + infants
    }));

    return {
      success: true,
      message: `Found ${filteredFlights.length} flights (mock data)`,
      flights: transformedFlights,
      pagination: {
        total: filteredFlights.length,
        limit,
        offset,
        hasMore: offset + limit < filteredFlights.length
      },
      searchParams,
      isMockData: true,
      metadata: {
        timestamp: new Date().toISOString(),
        responseTime: '50ms', // Mock data is fast
        version: '1.0.0'
      }
    };
  }

  /**
   * Get flight details by ID
   * @param {string} flightId - Flight ID
   * @returns {Object} Flight details
   */
  getFlightDetails(flightId) {
    const flight = this.mockFlights.find(f => f.id === flightId);

    if (!flight) {
      throw new Error('Flight not found');
    }

    return {
      success: true,
      flight: {
        flightId: flight.id,
        flightNumber: flight.flightNumber,
        airline: {
          name: flight.airline.name,
          iata: flight.airline.iata,
          icao: flight.airline.icao
        },
        departure: {
          airport: flight.origin.name,
          iata: flight.origin.iata,
          icao: flight.origin.iata,
          city: flight.origin.city,
          country: flight.origin.country,
          terminal: flight.origin.terminal,
          gate: flight.origin.gate,
          scheduled: flight.origin.scheduled,
          estimated: flight.origin.scheduled,
          actual: null,
          delayed: false,
          timezone: flight.origin.timezone
        },
        arrival: {
          airport: flight.destination.name,
          iata: flight.destination.iata,
          icao: flight.destination.icao,
          city: flight.destination.city,
          country: flight.destination.country,
          terminal: flight.destination.terminal,
          gate: flight.destination.gate,
          scheduled: flight.destination.scheduled,
          estimated: flight.destination.scheduled,
          actual: null,
          delayed: false,
          timezone: flight.destination.timezone
        },
        aircraft: {
          iata: flight.aircraft.iata,
          icao: flight.aircraft.icao,
          name: flight.aircraft.name,
          registration: flight.aircraftRegistration,
          capacity: flight.aircraft.capacity
        },
        flight: {
          iata: flight.flightNumber,
          number: flight.flightNumber.replace(/^[A-Z]+/, '')
        },
        status: flight.status,
        duration: flight.duration,
        distance: this.estimateDistance(flight.origin.iata, flight.destination.iata),
        price: flight.price,
        seats: flight.seats,
        isDirect: flight.isDirect
      },
      isMockData: true,
      metadata: {
        timestamp: new Date().toISOString(),
        responseTime: '25ms',
        version: '1.0.0'
      }
    };
  }

  /**
   * Get flight status by flight number
   * @param {string} flightNumber - Flight number
   * @returns {Object} Flight status
   */
  getFlightStatus(flightNumber) {
    const flight = this.mockFlights.find(f => f.flightNumber === flightNumber);

    if (!flight) {
      throw new Error('Flight not found');
    }

    const now = new Date();
    const departureTime = new Date(flight.departure);
    const arrivalTime = new Date(flight.arrival);

    let statusText = 'On Time';
    if (flight.status === 'delayed') {
      statusText = 'Delayed';
    } else if (now >= departureTime && now <= arrivalTime) {
      statusText = 'In Flight';
    } else if (now > arrivalTime) {
      statusText = 'Landed';
    } else {
      statusText = 'Scheduled';
    }

    return {
      success: true,
      flightId: flight.id,
      flightNumber: flight.flightNumber,
      status: flight.status,
      statusText,
      departure: {
        airport: flight.origin.name,
        iata: flight.origin.iata,
        terminal: flight.origin.terminal,
        gate: flight.origin.gate,
        scheduled: flight.origin.scheduled,
        estimated: flight.status === 'delayed' ? new Date(departureTime.getTime() + 30 * 60 * 1000).toISOString() : flight.origin.scheduled,
        actual: flight.status === 'delayed' ? null : flight.origin.scheduled,
        delayed: flight.status === 'delayed',
        isDelayed: flight.status === 'delayed',
        delayMinutes: flight.status === 'delayed' ? 30 : 0
      },
      arrival: {
        airport: flight.destination.name,
        iata: flight.destination.iata,
        terminal: flight.destination.terminal,
        gate: flight.destination.gate,
        scheduled: flight.destination.scheduled,
        estimated: flight.status === 'delayed' ? new Date(arrivalTime.getTime() + 30 * 60 * 1000).toISOString() : flight.destination.scheduled,
        actual: flight.status === 'delayed' ? null : flight.destination.scheduled,
        delayed: flight.status === 'delayed',
        isDelayed: flight.status === 'delayed',
        delayMinutes: flight.status === 'delayed' ? 30 : 0
      },
      airline: {
        name: flight.airline.name,
        iata: flight.airline.iata
      },
      aircraft: {
        iata: flight.aircraft.iata,
        registration: flight.aircraftRegistration
      },
      lastUpdated: new Date().toISOString(),
      isMockData: true
    };
  }

  /**
   * Estimate distance between airports (simplified)
   * @param {string} origin - Origin IATA code
   * @param {string} destination - Destination IATA code
   * @returns {string} Distance in km
   */
  estimateDistance(origin, destination) {
    // Simplified distance estimates for major routes
    const distances = {
      'JFK-LAX': '3983 km',
      'LAX-JFK': '3983 km',
      'ORD-LAX': '2808 km',
      'LAX-ORD': '2808 km',
      'JFK-LHR': '5570 km',
      'LHR-JFK': '5570 km',
      'LAX-NRT': '8751 km',
      'NRT-LAX': '8751 km',
      'DXB-SYD': '12039 km',
      'SYD-DXB': '12039 km',
      'LHR-CDG': '344 km',
      'CDG-LHR': '344 km'
    };

    const routeKey = `${origin}-${destination}`;
    return distances[routeKey] || `${Math.floor(1000 + Math.random() * 8000)} km`;
  }

  /**
   * Get all mock flights
   * @returns {Array} All mock flights
   */
  getAllFlights() {
    return this.mockFlights;
  }

  /**
   * Get flight by IATA code
   * @param {string} iataCode - Flight IATA code
   * @returns {Object|null} Flight details or null
   */
  getFlightByIata(iataCode) {
    return this.mockFlights.find(flight =>
      flight.flightNumber === iataCode.toUpperCase()
    ) || null;
  }
}

module.exports = FlightMockData;