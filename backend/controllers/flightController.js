/**
 * Flight Controller - Handles HTTP requests for flight operations
 * Integrates with AviationStack API for external flight data
 */

const FlightService = require('../services/flightService');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class FlightController {
  constructor() {
    this.flightService = new FlightService();
  }

  /**
   * Search flights by origin, destination, and date
   * POST /flights/search
   */
  async searchFlights(req, res) {
    const startTime = Date.now();

    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn('Flight search validation failed', {
          errors: errors.array(),
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
          timestamp: new Date().toISOString()
        });
      }

      const searchParams = {
        origin: req.body.origin?.trim().toUpperCase(),
        destination: req.body.destination?.trim().toUpperCase(),
        departureDate: req.body.departureDate,
        returnDate: req.body.returnDate,
        adults: parseInt(req.body.adults) || 1,
        children: parseInt(req.body.children) || 0,
        infants: parseInt(req.body.infants) || 0,
        cabinClass: req.body.cabinClass || 'economy',
        direct: req.body.direct || false,
        limit: Math.min(parseInt(req.body.limit) || 20, 100),
        offset: parseInt(req.body.offset) || 0
      };

      logger.info('Flight search request', {
        ...searchParams,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        requestId: req.id
      });

      // Validate date format
      const departureDate = new Date(searchParams.departureDate);
      if (isNaN(departureDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid departure date format. Use YYYY-MM-DD',
          timestamp: new Date().toISOString()
        });
      }

      // Check if departure date is in the future
      if (departureDate < new Date().setHours(0, 0, 0, 0)) {
        return res.status(400).json({
          success: false,
          message: 'Departure date cannot be in the past',
          timestamp: new Date().toISOString()
        });
      }

      // Validate return date if provided
      if (searchParams.returnDate) {
        const returnDate = new Date(searchParams.returnDate);
        if (isNaN(returnDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid return date format. Use YYYY-MM-DD',
            timestamp: new Date().toISOString()
          });
        }

        if (returnDate < departureDate) {
          return res.status(400).json({
            success: false,
            message: 'Return date must be after departure date',
            timestamp: new Date().toISOString()
          });
        }
      }

      // Validate passenger counts
      const totalPassengers = searchParams.adults + searchParams.children + searchParams.infants;
      if (totalPassengers > 9) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 9 passengers allowed per search',
          timestamp: new Date().toISOString()
        });
      }

      // Search flights
      const result = await this.flightService.searchFlights(searchParams);

      // Log successful search
      const responseTime = Date.now() - startTime;
      logger.info('Flight search completed', {
        origin: searchParams.origin,
        destination: searchParams.destination,
        departureDate: searchParams.departureDate,
        flightsFound: result.flights.length,
        responseTime: `${responseTime}ms`,
        requestId: req.id
      });

      // Add response metadata
      const response = {
        ...result,
        metadata: {
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`,
          requestId: req.id,
          version: '1.0.0'
        }
      };

      res.status(result.success ? 200 : 404).json(response);

    } catch (error) {
      const responseTime = Date.now() - startTime;

      logger.error('Flight search error', {
        error: error.message,
        stack: error.stack,
        body: req.body,
        ip: req.ip,
        responseTime: `${responseTime}ms`,
        requestId: req.id
      });

      // Handle specific error types
      let statusCode = 500;
      let message = 'An unexpected error occurred while searching for flights';

      if (error.message.includes('API key')) {
        statusCode = 503;
        message = 'Flight search service is temporarily unavailable';
      } else if (error.message.includes('Rate limit')) {
        statusCode = 429;
        message = 'Too many search requests. Please try again later.';
      } else if (error.message.includes('Origin and destination')) {
        statusCode = 400;
        message = error.message;
      } else if (error.message.includes('Departure date')) {
        statusCode = 400;
        message = error.message;
      }

      res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        metadata: {
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`,
          requestId: req.id
        }
      });
    }
  }

  /**
   * Get flight details by flight ID
   * GET /flights/:id
   */
  async getFlightDetails(req, res) {
    const startTime = Date.now();

    try {
      const flightId = req.params.id?.trim().toUpperCase();

      if (!flightId) {
        return res.status(400).json({
          success: false,
          message: 'Flight ID is required',
          timestamp: new Date().toISOString()
        });
      }

      logger.info('Flight details request', {
        flightId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        requestId: req.id
      });

      // Get flight details
      const result = await this.flightService.getFlightDetails(flightId);

      const responseTime = Date.now() - startTime;
      logger.info('Flight details retrieved', {
        flightId,
        responseTime: `${responseTime}ms`,
        requestId: req.id
      });

      const response = {
        ...result,
        metadata: {
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`,
          requestId: req.id,
          version: '1.0.0'
        }
      };

      res.status(200).json(response);

    } catch (error) {
      const responseTime = Date.now() - startTime;

      logger.error('Flight details error', {
        error: error.message,
        flightId: req.params.id,
        ip: req.ip,
        responseTime: `${responseTime}ms`,
        requestId: req.id
      });

      let statusCode = 500;
      let message = 'An unexpected error occurred while retrieving flight details';

      if (error.message.includes('not found')) {
        statusCode = 404;
        message = error.message;
      } else if (error.message.includes('Flight ID')) {
        statusCode = 400;
        message = error.message;
      }

      res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        metadata: {
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`,
          requestId: req.id
        }
      });
    }
  }

  /**
   * Get real-time flight status by IATA code
   * GET /flights/status/:iata_code
   */
  async getFlightStatus(req, res) {
    const startTime = Date.now();

    try {
      const iataCode = req.params.iata_code?.trim().toUpperCase();

      if (!iataCode) {
        return res.status(400).json({
          success: false,
          message: 'IATA code is required',
          timestamp: new Date().toISOString()
        });
      }

      // Validate IATA code format (should be 2-3 characters, letters and numbers)
      if (!/^[A-Z0-9]{2,3}$/.test(iataCode)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid IATA code format. Use 2-3 alphanumeric characters',
          timestamp: new Date().toISOString()
        });
      }

      logger.info('Flight status request', {
        iataCode,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        requestId: req.id
      });

      // Get flight status
      const result = await this.flightService.getFlightStatus(iataCode);

      const responseTime = Date.now() - startTime;
      logger.info('Flight status retrieved', {
        iataCode,
        status: result.flight?.status,
        responseTime: `${responseTime}ms`,
        requestId: req.id
      });

      const response = {
        ...result,
        metadata: {
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`,
          requestId: req.id,
          version: '1.0.0'
        }
      };

      res.status(200).json(response);

    } catch (error) {
      const responseTime = Date.now() - startTime;

      logger.error('Flight status error', {
        error: error.message,
        iataCode: req.params.iata_code,
        ip: req.ip,
        responseTime: `${responseTime}ms`,
        requestId: req.id
      });

      let statusCode = 500;
      let message = 'An unexpected error occurred while retrieving flight status';

      if (error.message.includes('not found')) {
        statusCode = 404;
        message = error.message;
      } else if (error.message.includes('IATA code')) {
        statusCode = 400;
        message = error.message;
      }

      res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        metadata: {
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`,
          requestId: req.id
        }
      });
    }
  }

  /**
   * Get airline information
   * GET /flights/airline/:iata_code
   */
  async getAirlineInfo(req, res) {
    const startTime = Date.now();

    try {
      const iataCode = req.params.iata_code?.trim().toUpperCase();

      if (!iataCode) {
        return res.status(400).json({
          success: false,
          message: 'Airline IATA code is required',
          timestamp: new Date().toISOString()
        });
      }

      logger.info('Airline info request', {
        iataCode,
        ip: req.ip,
        requestId: req.id
      });

      const result = await this.flightService.getAirlineInfo(iataCode);

      const responseTime = Date.now() - startTime;
      logger.info('Airline info retrieved', {
        iataCode,
        airlineName: result.name,
        responseTime: `${responseTime}ms`,
        requestId: req.id
      });

      const response = {
        success: true,
        airline: result,
        metadata: {
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`,
          requestId: req.id,
          version: '1.0.0'
        }
      };

      res.status(200).json(response);

    } catch (error) {
      const responseTime = Date.now() - startTime;

      logger.error('Airline info error', {
        error: error.message,
        iataCode: req.params.iata_code,
        ip: req.ip,
        responseTime: `${responseTime}ms`,
        requestId: req.id
      });

      let statusCode = 500;
      let message = 'An unexpected error occurred while retrieving airline information';

      if (error.message.includes('not found')) {
        statusCode = 404;
        message = error.message;
      }

      res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        metadata: {
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`,
          requestId: req.id
        }
      });
    }
  }

  /**
   * Get airport information
   * GET /flights/airport/:iata_code
   */
  async getAirportInfo(req, res) {
    const startTime = Date.now();

    try {
      const iataCode = req.params.iata_code?.trim().toUpperCase();

      if (!iataCode) {
        return res.status(400).json({
          success: false,
          message: 'Airport IATA code is required',
          timestamp: new Date().toISOString()
        });
      }

      logger.info('Airport info request', {
        iataCode,
        ip: req.ip,
        requestId: req.id
      });

      const result = await this.flightService.getAirportInfo(iataCode);

      const responseTime = Date.now() - startTime;
      logger.info('Airport info retrieved', {
        iataCode,
        airportName: result.airport_name,
        responseTime: `${responseTime}ms`,
        requestId: req.id
      });

      const response = {
        success: true,
        airport: result,
        metadata: {
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`,
          requestId: req.id,
          version: '1.0.0'
        }
      };

      res.status(200).json(response);

    } catch (error) {
      const responseTime = Date.now() - startTime;

      logger.error('Airport info error', {
        error: error.message,
        iataCode: req.params.iata_code,
        ip: req.ip,
        responseTime: `${responseTime}ms`,
        requestId: req.id
      });

      let statusCode = 500;
      let message = 'An unexpected error occurred while retrieving airport information';

      if (error.message.includes('not found')) {
        statusCode = 404;
        message = error.message;
      }

      res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        metadata: {
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`,
          requestId: req.id
        }
      });
    }
  }

  /**
   * Clear flight cache
   * DELETE /flights/cache
   */
  async clearCache(req, res) {
    try {
      const { key } = req.query;

      logger.info('Cache clear request', {
        key: key || 'all',
        ip: req.ip,
        requestId: req.id
      });

      await this.flightService.clearCache(key);

      res.status(200).json({
        success: true,
        message: key ? `Cache cleared for key: ${key}` : 'All flight cache cleared',
        timestamp: new Date().toISOString(),
        requestId: req.id
      });

    } catch (error) {
      logger.error('Cache clear error', {
        error: error.message,
        key: req.query.key,
        ip: req.ip,
        requestId: req.id
      });

      res.status(500).json({
        success: false,
        message: 'Failed to clear cache',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString(),
        requestId: req.id
      });
    }
  }

  /**
   * Get cache statistics
   * GET /flights/cache/stats
   */
  async getCacheStats(req, res) {
    try {
      const stats = await this.flightService.getCacheStats();

      logger.info('Cache stats request', {
        stats,
        ip: req.ip,
        requestId: req.id
      });

      res.status(200).json({
        success: true,
        cache: stats,
        timestamp: new Date().toISOString(),
        requestId: req.id
      });

    } catch (error) {
      logger.error('Cache stats error', {
        error: error.message,
        ip: req.ip,
        requestId: req.id
      });

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve cache statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString(),
        requestId: req.id
      });
    }
  }

  /**
   * Health check for flight service
   * GET /flights/health
   */
  async healthCheck(req, res) {
    try {
      // Test external API connectivity
      const startTime = Date.now();
      await this.flightService.makeApiRequest('/airlines', { limit: 1 });
      const responseTime = Date.now() - startTime;

      const cacheStats = await this.flightService.getCacheStats();

      res.status(200).json({
        success: true,
        status: 'healthy',
        service: 'Flight Service',
        version: '1.0.0',
        externalApi: {
          status: 'connected',
          responseTime: `${responseTime}ms`
        },
        cache: cacheStats,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Flight service health check failed', {
        error: error.message,
        requestId: req.id
      });

      const status = error.message.includes('API key') ? 'degraded' : 'unhealthy';

      res.status(status === 'degraded' ? 503 : 500).json({
        success: false,
        status,
        service: 'Flight Service',
        version: '1.0.0',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = FlightController;