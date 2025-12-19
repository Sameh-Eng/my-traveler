/**
 * Flight Service - External API Integration with AviationStack
 * Handles flight search, details, and real-time status
 * Includes fallback to mock data when external API fails
 */

const axios = require('axios');
const redis = require('redis');
const logger = require('../utils/logger');
const FlightMockData = require('./flightMockData');

class FlightService {
  constructor() {
    this.apiKey = process.env.AVIATIONSTACK_API_KEY;
    this.baseURL = process.env.AVIATIONSTACK_BASE_URL || 'http://api.aviationstack.com/v1';
    this.timeout = parseInt(process.env.FLIGHT_API_TIMEOUT) || 10000;
    this.cacheTTL = parseInt(process.env.FLIGHT_CACHE_TTL) || 300; // 5 minutes
    this.fallbackEnabled = process.env.FLIGHT_FALLBACK_ENABLED !== 'false';
    this.fallbackMode = false; // Track if we're currently in fallback mode

    // Initialize Redis client for caching
    this.redisClient = null;
    this.initializeRedis();

    // Initialize mock data for fallback
    this.mockData = new FlightMockData();
  }

  /**
   * Initialize Redis connection for caching
   */
  async initializeRedis() {
    // Always initialize memory cache as fallback first
    this.memoryCache = new Map();

    try {
      if (process.env.REDIS_URL) {
        this.redisClient = redis.createClient({
          url: process.env.REDIS_URL,
          socket: {
            connectTimeout: 5000,
            lazyConnect: true
          }
        });

        await this.redisClient.connect();
        logger.info('Redis connected for flight service caching');
      } else {
        logger.warn('Redis not configured, using in-memory cache');
        this.redisClient = null;
      }
    } catch (error) {
      logger.error('Failed to initialize Redis:', error.message);
      this.redisClient = null; // Ensure we don't try to use a broken Redis client
    }
  }

  /**
   * Get cached data or set new cache
   * @param {string} key - Cache key
   * @param {Function} dataFetcher - Function to fetch data if not cached
   * @returns {Promise<any>} - Cached or fresh data
   */
  async getCachedOrFetch(key, dataFetcher) {
    try {
      // Try Redis cache first
      if (this.redisClient) {
        const cached = await this.redisClient.get(key);
        if (cached) {
          logger.debug(`Cache hit for key: ${key}`);
          return JSON.parse(cached);
        }
      } else if (this.memoryCache) {
        // Fallback to memory cache
        const cached = this.memoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
          logger.debug(`Memory cache hit for key: ${key}`);
          return cached.data;
        }
      }

      // Fetch fresh data
      logger.debug(`Cache miss for key: ${key}, fetching fresh data`);
      const data = await dataFetcher();

      // Set cache
      if (this.redisClient) {
        await this.redisClient.setEx(key, this.cacheTTL, JSON.stringify(data));
      } else if (this.memoryCache) {
        this.memoryCache.set(key, {
          data,
          expiry: Date.now() + (this.cacheTTL * 1000)
        });
      }

      return data;
    } catch (error) {
      logger.error(`Cache operation failed for key ${key}:`, error.message);
      // Fallback to direct fetch if cache fails
      return await dataFetcher();
    }
  }

  /**
   * Make HTTP request to external API with error handling and fallback
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - API response
   */
  async makeApiRequest(endpoint, params = {}) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check if fallback mode is disabled
    if (!this.fallbackEnabled) {
      return this.makeDirectApiRequest(requestId, endpoint, params);
    }

    try {
      const response = await this.makeDirectApiRequest(requestId, endpoint, params);

      // If we were in fallback mode and now it works, log recovery
      if (this.fallbackMode) {
        logger.info(`External API recovered, exiting fallback mode [${requestId}]`);
        this.fallbackMode = false;
      }

      return response;

    } catch (error) {
      logger.warn(`External API failed, checking fallback mode [${requestId}]`, {
        error: error.message,
        fallbackEnabled: this.fallbackEnabled,
        currentlyInFallback: this.fallbackMode
      });

      // Check if we should use fallback
      if (this.shouldUseFallback(error)) {
        if (!this.fallbackMode) {
          logger.warn(`Entering fallback mode due to external API failure [${requestId}]`);
          this.fallbackMode = true;
        }

        // Throw a specific error to trigger fallback
        throw new Error(`FALLBACK_MODE: ${error.message}`);
      }

      // Re-throw the error if fallback is not appropriate
      throw error;
    }
  }

  /**
   * Make direct HTTP request to external API
   * @param {string} requestId - Request identifier for logging
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - API response
   */
  async makeDirectApiRequest(requestId, endpoint, params = {}) {
    try {
      // Validate API key
      if (!this.apiKey) {
        throw new Error('AviationStack API key is not configured');
      }

      const url = `${this.baseURL}${endpoint}`;
      const requestParams = {
        access_key: this.apiKey,
        ...params
      };

      logger.info(`Flight API Request [${requestId}]`, {
        endpoint,
        params: { ...requestParams, access_key: '[REDACTED]' }
      });

      const startTime = Date.now();

      const response = await axios.get(url, {
        params: requestParams,
        timeout: this.timeout,
        headers: {
          'User-Agent': 'MyTraveler/1.0.0'
        }
      });

      const responseTime = Date.now() - startTime;

      logger.info(`Flight API Response [${requestId}]`, {
        status: response.status,
        responseTime: `${responseTime}ms`,
        dataCount: response.data?.pagination?.total || 0
      });

      // Check for API-level errors
      if (response.data.error) {
        throw new Error(`API Error: ${response.data.error.message}`);
      }

      // Check rate limit headers
      const remainingRequests = response.headers['x-ratelimit-remaining'];
      if (remainingRequests && parseInt(remainingRequests) < 10) {
        logger.warn('Rate limit approaching', { remaining: remainingRequests });
      }

      return response.data;

    } catch (error) {
      logger.error(`Flight API Error [${requestId}]`, {
        error: error.message,
        code: error.code,
        endpoint,
        params: { ...params, access_key: '[REDACTED]' }
      });

      // Handle specific error types
      if (error.code === 'ECONNABORTED') {
        throw new Error('Flight API request timed out');
      } else if (error.response) {
        const statusCode = error.response.status;

        if (statusCode === 401) {
          throw new Error('Invalid API key for flight service');
        } else if (statusCode === 429) {
          throw new Error('Rate limit exceeded for flight service');
        } else if (statusCode >= 500) {
          throw new Error('Flight service temporarily unavailable');
        } else {
          throw new Error(`Flight API error: ${error.response.data?.error?.message || error.message}`);
        }
      } else {
        throw new Error(`Flight service error: ${error.message}`);
      }
    }
  }

  /**
   * Determine if fallback should be used based on error
   * @param {Error} error - The error that occurred
   * @returns {boolean} - Whether to use fallback
   */
  shouldUseFallback(error) {
    const errorMessage = error.message.toLowerCase();

    // Use fallback for these error types
    const fallbackErrors = [
      'flight api request timed out',
      'flight service temporarily unavailable',
      'rate limit exceeded',
      'connection refused',
      'enotfound',
      'econnreset',
      'timeout'
    ];

    return fallbackErrors.some(fallbackError =>
      errorMessage.includes(fallbackError)
    );
  }

  /**
   * Check if currently in fallback mode
   * @returns {boolean} - Whether fallback mode is active
   */
  isInFallbackMode() {
    return this.fallbackMode;
  }

  /**
   * Enable or disable fallback mode
   * @param {boolean} enabled - Whether to enable fallback mode
   */
  setFallbackMode(enabled) {
    this.fallbackMode = enabled;
    logger.info(`Fallback mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Search flights by origin, destination, and date
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} - Search results
   */
  async searchFlights(searchParams) {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults = 1,
      children = 0,
      infants = 0,
      cabinClass = 'economy',
      direct = false,
      limit = 20,
      offset = 0
    } = searchParams;

    // Validate required parameters
    if (!origin || !destination) {
      throw new Error('Origin and destination are required');
    }

    if (!departureDate) {
      throw new Error('Departure date is required');
    }

    // Create cache key
    const cacheKey = `flights:search:${JSON.stringify({
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      cabinClass,
      direct,
      limit,
      offset
    })}`;

    return await this.getCachedOrFetch(cacheKey, async () => {
      try {
        // First, try external API
        // NOTE: AviationStack free tier does NOT support date filtering or passenger parameters
        // It only supports real-time flight data with basic origin/destination filters
        const apiParams = {
          dep_iata: origin.toUpperCase(),
          arr_iata: destination.toUpperCase(),
          limit: Math.min(limit, 100), // API limit
          offset
        };

        // NOTE: These parameters are NOT supported on free tier:
        // - flight_date / dep_date / return_date (requires paid subscription)
        // - cabin_class (requires paid subscription)  
        // - adults, children, infants (not supported by AviationStack)
        // - direct (not supported by flights endpoint)

        logger.info('Calling AviationStack API with params', {
          ...apiParams,
          note: 'Free tier - date filtering not supported'
        });

        const response = await this.makeApiRequest('/flights', apiParams);

        // Transform API response to our format
        return this.transformSearchResults(response.data, searchParams);

      } catch (error) {
        // Check if this is a fallback mode error
        if (error.message.startsWith('FALLBACK_MODE:')) {
          logger.warn('External API failed, using mock fallback data', {
            originalError: error.message.replace('FALLBACK_MODE: ', ''),
            searchParams
          });

          // Use mock data as fallback
          return this.mockData.searchFlights(searchParams);
        } else {
          // Log the error but return empty results for graceful degradation
          logger.error('Flight search failed:', error.message);
          return {
            success: false,
            message: error.message,
            flights: [],
            pagination: {
              total: 0,
              limit,
              offset,
              hasMore: false
            },
            searchParams,
            isMockData: false
          };
        }
      }
    });
  }

  /**
   * Get detailed flight information
   * @param {string} flightId - Flight identifier
   * @returns {Promise<Object>} - Flight details
   */
  async getFlightDetails(flightId) {
    if (!flightId) {
      throw new Error('Flight ID is required');
    }

    const cacheKey = `flights:details:${flightId}`;

    return await this.getCachedOrFetch(cacheKey, async () => {
      try {
        const response = await this.makeApiRequest('/flights', {
          flight_iata: flightId.toUpperCase(),
          limit: 1
        });

        if (!response.data || response.data.length === 0) {
          throw new Error('Flight not found');
        }

        return this.transformFlightDetails(response.data[0]);

      } catch (error) {
        // Check if this is a fallback mode error
        if (error.message.startsWith('FALLBACK_MODE:')) {
          logger.warn('External API failed, using mock fallback for flight details', {
            flightId,
            originalError: error.message.replace('FALLBACK_MODE: ', '')
          });

          // Try to find mock flight by flight ID or flight number
          const mockFlight = this.mockData.getFlightDetails(flightId);
          if (mockFlight) {
            return mockFlight;
          }

          // Try finding by IATA code
          const flightByIata = this.mockData.getFlightByIata(flightId);
          if (flightByIata) {
            return this.mockData.getFlightDetails(flightByIata.id);
          }

          throw new Error('Flight not found');
        } else if (error.message === 'Flight not found') {
          // Try mock data as fallback even for regular "not found" errors
          const mockFlight = this.mockData.getFlightDetails(flightId);
          if (mockFlight) {
            logger.info('Flight not found in external API, found in mock data', { flightId });
            return mockFlight;
          }
        }

        logger.error(`Failed to get flight details for ${flightId}:`, error.message);
        throw error;
      }
    });
  }

  /**
   * Get real-time flight status
   * @param {string} iataCode - Flight IATA code
   * @returns {Promise<Object>} - Flight status
   */
  async getFlightStatus(iataCode) {
    if (!iataCode) {
      throw new Error('IATA code is required');
    }

    const cacheKey = `flights:status:${iataCode}`;

    return await this.getCachedOrFetch(cacheKey, async () => {
      try {
        const response = await this.makeApiRequest('/flights', {
          flight_iata: iataCode.toUpperCase(),
          limit: 1
        });

        if (!response.data || response.data.length === 0) {
          throw new Error('Flight not found');
        }

        const flight = response.data[0];
        return this.transformFlightStatus(flight);

      } catch (error) {
        // Check if this is a fallback mode error
        if (error.message.startsWith('FALLBACK_MODE:')) {
          logger.warn('External API failed, using mock fallback for flight status', {
            iataCode,
            originalError: error.message.replace('FALLBACK_MODE: ', '')
          });

          // Try mock data
          const mockStatus = this.mockData.getFlightStatus(iataCode);
          if (mockStatus) {
            return mockStatus;
          }

          throw new Error('Flight not found');
        } else if (error.message === 'Flight not found') {
          // Try mock data as fallback even for regular "not found" errors
          const mockStatus = this.mockData.getFlightStatus(iataCode);
          if (mockStatus) {
            logger.info('Flight not found in external API, found in mock data', { iataCode });
            return mockStatus;
          }
        }

        logger.error(`Failed to get flight status for ${iataCode}:`, error.message);
        throw error;
      }
    });
  }

  /**
   * Get airline information
   * @param {string} iataCode - Airline IATA code
   * @returns {Promise<Object>} - Airline details
   */
  async getAirlineInfo(iataCode) {
    if (!iataCode) {
      throw new Error('Airline IATA code is required');
    }

    const cacheKey = `airlines:${iataCode}`;

    return await this.getCachedOrFetch(cacheKey, async () => {
      try {
        const response = await this.makeApiRequest('/airlines', {
          airline_iata: iataCode.toUpperCase(),
          limit: 1
        });

        if (!response.data || response.data.length === 0) {
          throw new Error('Airline not found');
        }

        return response.data[0];

      } catch (error) {
        logger.error(`Failed to get airline info for ${iataCode}:`, error.message);
        throw error;
      }
    });
  }

  /**
   * Get airport information
   * @param {string} iataCode - Airport IATA code
   * @returns {Promise<Object>} - Airport details
   */
  async getAirportInfo(iataCode) {
    if (!iataCode) {
      throw new Error('Airport IATA code is required');
    }

    const cacheKey = `airports:${iataCode}`;

    return await this.getCachedOrFetch(cacheKey, async () => {
      try {
        const response = await this.makeApiRequest('/airports', {
          airport_iata: iataCode.toUpperCase(),
          limit: 1
        });

        if (!response.data || response.data.length === 0) {
          throw new Error('Airport not found');
        }

        return response.data[0];

      } catch (error) {
        logger.error(`Failed to get airport info for ${iataCode}:`, error.message);
        throw error;
      }
    });
  }

  /**
   * Transform search results to our format
   * @param {Array} flights - Raw flight data
   * @param {Object} searchParams - Original search parameters
   * @returns {Object} - Transformed results
   */
  transformSearchResults(flights, searchParams) {
    if (!flights || flights.length === 0) {
      return {
        success: true,
        message: 'No flights found for the specified criteria',
        flights: [],
        pagination: {
          total: 0,
          limit: searchParams.limit || 20,
          offset: searchParams.offset || 0,
          hasMore: false
        },
        searchParams
      };
    }

    const transformedFlights = flights.map(flight => ({
      flightId: flight.flight?.iata || flight.flight?.icao,
      flightNumber: flight.flight?.iata || flight.flight?.icao,
      airline: {
        name: flight.airline?.name,
        iata: flight.airline?.iata,
        icao: flight.airline?.icao
      },
      departure: {
        airport: flight.departure?.airport || flight.departure?.timezone,
        iata: flight.departure?.iata,
        icao: flight.departure?.icao,
        terminal: flight.departure?.terminal,
        gate: flight.departure?.gate,
        scheduled: flight.departure?.scheduled,
        estimated: flight.departure?.estimated,
        actual: flight.departure?.actual,
        delayed: flight.departure?.delayed,
        timezone: flight.departure?.timezone
      },
      arrival: {
        airport: flight.arrival?.airport || flight.arrival?.timezone,
        iata: flight.arrival?.iata,
        icao: flight.arrival?.icao,
        terminal: flight.arrival?.terminal,
        gate: flight.arrival?.gate,
        scheduled: flight.arrival?.scheduled,
        estimated: flight.arrival?.estimated,
        actual: flight.arrival?.actual,
        delayed: flight.arrival?.delayed,
        timezone: flight.arrival?.timezone
      },
      aircraft: {
        registration: flight.aircraft?.registration,
        iata: flight.aircraft?.iata_type,
        icao: flight.aircraft?.icao_code,
        icao24: flight.aircraft?.icao24
      },
      flight: {
        iata: flight.flight?.iata,
        icao: flight.flight?.icao,
        codeshared: flight.flight?.codeshared,
        number: flight.flight?.number
      },
      status: flight.flight_status,
      duration: this.calculateDuration(flight.departure?.scheduled, flight.arrival?.scheduled),
      price: {
        economy: this.generateMockPrice('economy'),
        business: this.generateMockPrice('business'),
        first: this.generateMockPrice('first')
      },
      seats: {
        economy: this.generateMockSeats(),
        business: this.generateMockSeats(),
        first: this.generateMockSeats()
      }
    }));

    return {
      success: true,
      message: `Found ${flights.length} flights`,
      flights: transformedFlights,
      pagination: {
        total: flights.length,
        limit: searchParams.limit || 20,
        offset: searchParams.offset || 0,
        hasMore: flights.length === (searchParams.limit || 20)
      },
      searchParams
    };
  }

  /**
   * Transform flight details to our format
   * @param {Object} flight - Raw flight data
   * @returns {Object} - Transformed flight details
   */
  transformFlightDetails(flight) {
    return {
      success: true,
      flight: {
        flightId: flight.flight?.iata || flight.flight?.icao,
        flightNumber: flight.flight?.iata || flight.flight?.icao,
        airline: {
          name: flight.airline?.name,
          iata: flight.airline?.iata,
          icao: flight.airline?.icao
        },
        departure: {
          airport: flight.departure?.airport,
          iata: flight.departure?.iata,
          icao: flight.departure?.icao,
          terminal: flight.departure?.terminal,
          gate: flight.departure?.gate,
          scheduled: flight.departure?.scheduled,
          estimated: flight.departure?.estimated,
          actual: flight.departure?.actual,
          delayed: flight.departure?.delayed,
          timezone: flight.departure?.timezone
        },
        arrival: {
          airport: flight.arrival?.airport,
          iata: flight.arrival?.iata,
          icao: flight.arrival?.icao,
          terminal: flight.arrival?.terminal,
          gate: flight.arrival?.gate,
          scheduled: flight.arrival?.scheduled,
          estimated: flight.arrival?.estimated,
          actual: flight.arrival?.actual,
          delayed: flight.arrival?.delayed,
          timezone: flight.arrival?.timezone
        },
        aircraft: {
          registration: flight.aircraft?.registration,
          iata: flight.aircraft?.iata_type,
          icao: flight.aircraft?.icao_code,
          icao24: flight.aircraft?.icao24
        },
        flight: {
          iata: flight.flight?.iata,
          icao: flight.flight?.icao,
          codeshared: flight.flight?.codeshared,
          number: flight.flight?.number
        },
        status: flight.flight_status,
        duration: this.calculateDuration(flight.departure?.scheduled, flight.arrival?.scheduled),
        distance: flight?.flight?.distance ? `${flight.flight.distance} km` : null
      }
    };
  }

  /**
   * Transform flight status to our format
   * @param {Object} flight - Raw flight data
   * @returns {Object} - Transformed flight status
   */
  transformFlightStatus(flight) {
    return {
      success: true,
      flightId: flight.flight?.iata || flight.flight?.icao,
      flightNumber: flight.flight?.iata || flight.flight?.icao,
      status: flight.flight_status,
      statusText: this.getStatusText(flight.flight_status),
      departure: {
        airport: flight.departure?.airport,
        iata: flight.departure?.iata,
        terminal: flight.departure?.terminal,
        gate: flight.departure?.gate,
        scheduled: flight.departure?.scheduled,
        estimated: flight.departure?.estimated,
        actual: flight.departure?.actual,
        delayed: flight.departure?.delayed,
        isDelayed: !!flight.departure?.delayed,
        delayMinutes: this.calculateDelayMinutes(flight.departure)
      },
      arrival: {
        airport: flight.arrival?.airport,
        iata: flight.arrival?.iata,
        terminal: flight.arrival?.terminal,
        gate: flight.arrival?.gate,
        scheduled: flight.arrival?.scheduled,
        estimated: flight.arrival?.estimated,
        actual: flight.arrival?.actual,
        delayed: flight.arrival?.delayed,
        isDelayed: !!flight.arrival?.delayed,
        delayMinutes: this.calculateDelayMinutes(flight.arrival)
      },
      airline: {
        name: flight.airline?.name,
        iata: flight.airline?.iata
      },
      aircraft: {
        registration: flight.aircraft?.registration,
        iata: flight.aircraft?.iata_type
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Format date for API
   * @param {string|Date} date - Date to format
   * @returns {string} - Formatted date string
   */
  formatDateForAPI(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  /**
   * Calculate flight duration
   * @param {string} departure - Departure time
   * @param {string} arrival - Arrival time
   * @returns {string} - Duration in hours and minutes
   */
  calculateDuration(departure, arrival) {
    if (!departure || !arrival) return null;

    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diff = arr - dep;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  /**
   * Calculate delay minutes
   * @param {Object} flightTime - Flight time object
   * @returns {number} - Delay in minutes
   */
  calculateDelayMinutes(flightTime) {
    if (!flightTime?.estimated || !flightTime?.scheduled) return 0;

    const scheduled = new Date(flightTime.scheduled);
    const estimated = new Date(flightTime.estimated);

    return Math.floor((estimated - scheduled) / (1000 * 60));
  }

  /**
   * Get status text from status code
   * @param {string} status - Status code
   * @returns {string} - Human readable status
   */
  getStatusText(status) {
    const statusMap = {
      'scheduled': 'On Schedule',
      'active': 'In Flight',
      'landed': 'Landed',
      'cancelled': 'Cancelled',
      'incident': 'Incident',
      'diverted': 'Diverted'
    };

    return statusMap[status] || status;
  }

  /**
   * Generate realistic EGP price for flights
   * @param {string} cabinClass - Cabin class
   * @returns {number} - Price in EGP (Egyptian Pounds)
   */
  generateMockPrice(cabinClass) {
    // Realistic EGP prices for Egypt flights
    const priceRanges = {
      'economy': { min: 3000, max: 7000 },
      'business': { min: 9000, max: 21000 },
      'first': { min: 18000, max: 42000 }
    };

    const range = priceRanges[cabinClass] || priceRanges['economy'];
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }

  /**
   * Generate mock seat availability
   * @returns {number} - Mock seat count
   */
  generateMockSeats() {
    return Math.floor(Math.random() * 50) + 10;
  }

  /**
   * Clear cache for specific key or all cache
   * @param {string} key - Cache key (optional)
   */
  async clearCache(key = null) {
    try {
      if (this.redisClient) {
        if (key) {
          await this.redisClient.del(key);
          logger.info(`Cache cleared for key: ${key}`);
        } else {
          // Clear all flight-related cache
          const keys = await this.redisClient.keys('flights:*');
          if (keys.length > 0) {
            await this.redisClient.del(keys);
            logger.info(`Cleared ${keys.length} flight cache entries`);
          }
        }
      } else if (this.memoryCache) {
        if (key) {
          this.memoryCache.delete(key);
        } else {
          this.memoryCache.clear();
        }
      }
    } catch (error) {
      logger.error('Failed to clear cache:', error.message);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache stats
   */
  async getCacheStats() {
    try {
      const baseStats = {};

      if (this.redisClient) {
        const keys = await this.redisClient.keys('flights:*');
        baseStats.type = 'redis';
        baseStats.keys = keys.length;
        baseStats.ttl = this.cacheTTL;
      } else if (this.memoryCache) {
        baseStats.type = 'memory';
        baseStats.keys = this.memoryCache.size;
        baseStats.ttl = this.cacheTTL;
      } else {
        baseStats.type = 'none';
      }

      // Add fallback mode status
      baseStats.fallbackMode = this.fallbackMode;
      baseStats.fallbackEnabled = this.fallbackEnabled;
      baseStats.mockDataFlights = this.mockData.getAllFlights().length;

      return baseStats;
    } catch (error) {
      logger.error('Failed to get cache stats:', error.message);
      return {
        type: 'error',
        error: error.message,
        fallbackMode: this.fallbackMode,
        fallbackEnabled: this.fallbackEnabled,
        mockDataFlights: this.mockData.getAllFlights().length
      };
    }
  }

  /**
   * Get service status including fallback mode
   * @returns {Object} - Service status
   */
  async getServiceStatus() {
    try {
      const cacheStats = await this.getCacheStats();

      // Test external API connectivity
      let apiStatus = 'healthy';
      let apiResponseTime = 0;
      let usingFallback = this.fallbackMode;

      if (!usingFallback) {
        try {
          const startTime = Date.now();
          await this.makeDirectApiRequest('test_conn', '/airlines', { limit: 1 });
          apiResponseTime = Date.now() - startTime;
        } catch (error) {
          apiStatus = 'unhealthy';
          if (this.fallbackEnabled) {
            usingFallback = true;
          }
        }
      }

      return {
        success: true,
        api: {
          status: apiStatus,
          responseTime: `${apiResponseTime}ms`,
          provider: 'AviationStack',
          fallbackEnabled: this.fallbackEnabled,
          usingFallback: usingFallback
        },
        cache: cacheStats,
        mockData: {
          flightsAvailable: this.mockData.getAllFlights().length,
          airlines: this.mockData.airlines.length,
          airports: Object.keys(this.mockData.airports).length,
          aircraft: this.mockData.aircraft.length
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Failed to get service status:', error.message);
      return {
        success: false,
        error: error.message,
        fallbackMode: this.fallbackMode,
        fallbackEnabled: this.fallbackEnabled,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = FlightService;