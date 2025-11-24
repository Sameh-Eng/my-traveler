# Flight API Fallback Mode Documentation

This document explains the fallback mechanism implemented in the MyTraveler Flight API, which provides graceful degradation when the external AviationStack API is unavailable.

## 📋 Table of Contents

- [Overview](#overview)
- [Fallback Triggers](#fallback-triggers)
- [Mock Data Structure](#mock-data-structure)
- [Configuration](#configuration)
- [Behavior](#behavior)
- [Examples](#examples)
- [Testing](#testing)

## 🎯 Overview

The Flight API includes an intelligent fallback mechanism that seamlessly switches to mock data when the external AviationStack API experiences issues such as:

- **Network connectivity problems**
- **API rate limiting**
- **Service outages**
- **Invalid API keys**
- **Timeouts**

### Benefits

- **Continuous Service**: Flight search remains available even during external API failures
- **Fast Response**: Mock data responses are nearly instantaneous
- **Realistic Data**: 20 pre-configured flights with realistic details
- **Transparent Swapping**: Users don't need to know fallback is active
- **Automatic Recovery**: Service returns to external API when it becomes available

## 🔄 Fallback Triggers

### Automatic Triggers

The system automatically enters fallback mode when any of these conditions are met:

1. **Network Errors**:
   - `ECONNREFUSED` - Connection refused
   - `ENOTFOUND` - Host not found
   - `ECONNRESET` - Connection reset
   - `ETIMEDOUT` - Request timeout

2. **API Errors**:
   - `502/503/504` HTTP status codes (service unavailable)
   - `Rate limit exceeded` responses
   - Request timeouts (over 10 seconds)

3. **Configuration**:
   - `FLIGHT_FALLBACK_ENABLED=false` - Disable fallback entirely
   - Missing or invalid API key

### Manual Triggers

The system can be forced into fallback mode:

```javascript
// In flight service
flightService.setFallbackMode(true);
flightService.setFallbackMode(false);
```

## 📊 Mock Data Structure

### Flight Database

The mock system includes **20 realistic flights** covering:

#### Routes Covered
- **US Domestic**: JFK ↔ LAX, ORD ↔ LAX, DFW ↔ ORD, etc.
- **International**: JFK ↔ LHR, LAX ↔ NRT, DXB ↔ SYD, etc.
- **North America**: YYZ ↔ AMS, MEX ↔ CDG

#### Flight Details

Each mock flight includes:

```javascript
{
  "id": "MOCK-AA1234-1",
  "flightNumber": "AA1234",
  "airline": {
    "name": "American Airlines",
    "iata": "AA",
    "icao": "AAL"
  },
  "origin": {
    "iata": "JFK",
    "name": "John F. Kennedy International",
    "city": "New York",
    "country": "USA",
    "timezone": "America/New_York",
    "scheduled": "2024-12-25T10:30:00Z",
    "terminal": "4",
    "gate": "B22"
  },
  "destination": {
    "iata": "LAX",
    "name": "Los Angeles International",
    "city": "Los Angeles",
    "country": "USA",
    "timezone": "America/Los_Angeles",
    "scheduled": "2024-12-25T14:15:00Z",
    "terminal": "4",
    "gate": "45A"
  },
  "aircraft": {
    "iata": "A321",
    "icao": "A321",
    "name": "Airbus A321",
    "capacity": 185
  },
  "departure": "2024-12-25T10:30:00Z",
  "arrival": "2024-12-25T14:15:00Z",
  "duration": "6h 45m",
  "price": {
    "economy": 349,
    "business": 1117,
    "first": 2024
  },
  "seats": {
    "economy": 28,
    "business": 12,
    "first": 8
  },
  "status": "scheduled",
  "isDirect": false
}
```

#### Airlines Included

- **Major US Carriers**: American, Delta, United, Southwest
- **International Airlines**: British Airways, Lufthansa, Emirates
- **Regional Carriers**: JetBlue, Alaska, Spirit

#### Aircraft Types

- **Narrow Body**: A320, A321, B737, B738, E190
- **Wide Body**: A330, A350, B777, B788
- **Regional**: CRJ9

## ⚙️ Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Enable/disable fallback mode
FLIGHT_FALLBACK_ENABLED=true

# External API settings
AVIATIONSTACK_API_KEY=your_api_key_here
AVIATIONSTACK_BASE_URL=http://api.aviationstack.com/v1
FLIGHT_API_TIMEOUT=10000
FLIGHT_CACHE_TTL=300
```

### Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `FLIGHT_FALLBACK_ENABLED` | `true` | Enable/disable fallback mode |
| `AVIATIONSTACK_API_KEY` | Required | AviationStack API key |
| `FLIGHT_API_TIMEOUT` | `10000ms` | External API timeout |
| `FLIGHT_CACHE_TTL` | `300s` | Cache duration |

### Fallback Behavior

When `FLIGHT_FALLBACK_ENABLED=false`:
- API failures return errors immediately
- No fallback to mock data
- Service shows "unhealthy" status

When `FLIGHT_FALLBACK_ENABLED=true` (default):
- API failures trigger fallback mode
- Mock data provides continuous service
- Automatic recovery when API is restored

## 🔄 Behavior

### Normal Mode (External API Working)

1. **Request Received**: Flight search initiated
2. **API Call**: Request sent to AviationStack
3. **Response**: Real-time flight data returned
4. **Cache**: Response cached for 5 minutes
5. **Success**: Response sent to client

### Fallback Mode (External API Failed)

1. **Request Received**: Flight search initiated
2. **API Call**: External API fails (timeout, error, etc.)
3. **Fallback Triggered**: System detects fallback condition
4. **Mock Data**: Pre-configured mock data returned
5. **Response**: Mock data sent with `isMockData: true` flag
6. **Logging**: Warning logged about fallback activation

### Recovery Mode (External API Restored)

1. **Request Received**: Flight search initiated while in fallback
2. **API Call**: External API attempt succeeds
3. **Recovery**: System logs recovery and exits fallback mode
4. **Normal Operation**: Continues with external API data

## 📋 Response Examples

### External API Response (Normal)

```json
{
  "success": true,
  "message": "Found 5 flights",
  "flights": [...],
  "metadata": {
    "responseTime": "2450ms",
    "version": "1.0.0"
  },
  "isMockData": false
}
```

### Mock Data Response (Fallback Active)

```json
{
  "success": true,
  "message": "Found 15 flights (mock data)",
  "flights": [...],
  "pagination": {
    "total": 15,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  },
  "isMockData": true,
  "metadata": {
    "responseTime": "50ms",
    "version": "1.0.0"
  }
}
```

### Health Check Response

#### Healthy with External API
```json
{
  "success": true,
  "status": "healthy",
  "service": "Flight Service",
  "api": {
    "status": "connected",
    "responseTime": "1234ms",
    "provider": "AviationStack",
    "fallbackEnabled": true,
    "usingFallback": false
  },
  "cache": {
    "type": "redis",
    "keys": 25,
    "ttl": 300
  },
  "mockData": {
    "flightsAvailable": 20,
    "airlines": 20,
    "airports": 20
  }
}
```

#### Degraded with Fallback
```json
{
  "success": true,
  "status": "degraded",
  "service": "Flight Service",
  "api": {
    "status": "unhealthy",
    "responseTime": "0ms",
    "provider": "AviationStack",
    "fallbackEnabled": true,
    "usingFallback": true
  },
  "cache": {
    "type": "redis",
    "keys": 15,
    "ttl": 300
  },
  "mockData": {
    "flightsAvailable": 20,
    "airlines": 20,
    "airports": 20
  }
}
```

## 🧪 Testing Fallback Mode

### 1. Test with Invalid API Key

```bash
# Set invalid API key
export AVIATIONSTACK_API_KEY="invalid_key"

# Test flight search
curl -X POST http://localhost:8080/api/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "JFK",
    "destination": "LAX",
    "departureDate": "2024-12-25",
    "adults": 1
  }'
```

**Expected Response**: Mock data with `isMockData: true`

### 2. Test Health Check

```bash
curl http://localhost:8080/api/flights/health
```

**Expected Response**: Shows fallback status and mock data availability

### 3. Simulate Network Issues

```bash
# Block external API (simulate network issues)
iptables -A OUTPUT -p tcp --dport 80 -j DROP

# Test flight search
curl -X POST http://localhost:8080/api/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "JFK",
    "destination": "LAX",
    "departureDate": "2024-12-25",
    "adults": 1
  }'

# Unblock when done
iptables -D OUTPUT -p tcp --dport 80 -j DROP
```

### 4. Test Cache Behavior

```bash
# First request (should hit API)
curl -X POST http://localhost:8080/api/flights/search \
  -H "Content-Type: application/json" \
  -d '{"origin": "JFK", "destination": "LAX", "departureDate": "2024-12-25"}'

# Second request (should hit cache)
curl -X POST http://localhost:8080/api/flights/search \
  -H "Content-Type: application/json" \
  -d '{"origin": "JFK", "destination": "LAX", "departureDate": "2024-12-25"}'

# Check cache stats
curl http://localhost:8080/api/flights/cache/stats
```

## 🔍 Monitoring and Logging

### Fallback Mode Detection

The system logs when entering/exiting fallback mode:

```javascript
// Entering fallback
logger.warn('Entering fallback mode due to external API failure [req_1234567890_abc]');

// Exiting fallback
logger.info('External API recovered, exiting fallback mode [req_1234567890_xyz]');
```

### Log Levels

- **INFO**: Normal operations, fallback mode changes
- **WARN**: External API failures, fallback activation
- **ERROR**: System errors, configuration issues

### Monitoring Metrics

Track these metrics to monitor fallback usage:

1. **Fallback Activation Count**: How often fallback is triggered
2. **API Failure Rate**: Percentage of external API failures
3. **Response Times**: Compare external vs fallback response times
4. **Cache Hit Rates**: Effectiveness of caching in both modes

## 🚨 Troubleshooting

### Common Issues

#### 1. Fallback Not Working

**Symptom**: External API failures return errors instead of mock data

**Solutions**:
- Check `FLIGHT_FALLBACK_ENABLED=true` in environment
- Verify mock data module is loaded
- Check error logs for fallback detection issues

#### 2. Mock Data Always Used

**Symptom**: Always returns mock data even when API is working

**Solutions**:
- Verify AviationStack API key is valid
- Check network connectivity to api.aviationstack.com
- Review error logs for API connection issues
- Manually test API endpoint with curl

#### 3. Inconsistent Behavior

**Symptom**: Sometimes fallback works, sometimes it doesn't

**Solutions**:
- Check error message patterns in `shouldUseFallback()` method
- Review network stability and response patterns
- Verify cache keys don't conflict between modes

### Debug Mode

Enable detailed logging:

```javascript
// In flight service constructor
this.debugMode = process.env.NODE_ENV === 'development';
```

Add debug logging:

```javascript
if (this.debugMode) {
  logger.debug('Fallback decision', {
    error: error.message,
    shouldUseFallback: this.shouldUseFallback(error),
    fallbackMode: this.fallbackMode
  });
}
```

## 📈 Performance Considerations

### Response Times

| Mode | Average Response Time | Cache Hit Time |
|------|----------------------|---------------|
| External API | 2000-5000ms | 10-50ms |
| Fallback | 20-100ms | 10-50ms |

### Resource Usage

- **Memory**: Mock data uses ~1MB of RAM
- **CPU**: Fallback reduces CPU usage by avoiding external API calls
- **Network**: Fallback eliminates external API bandwidth usage

### Cache Impact

- **Fallback Mode**: Cache still works with mock data
- **Cache Keys**: Differentiated by data source
- **TTL**: Same cache duration for both modes

## 🔧 Maintenance

### Updating Mock Data

To update mock flights:

1. Edit `backend/services/flightMockData.js`
2. Modify route configurations in `generateMockFlights()`
3. Add/remove airlines in `airlines` array
4. Update aircraft types in `aircraft` array
5. Restart the service

### Adding New Routes

Add new mock flight routes:

```javascript
const routes = [
  { origin: 'BOS', destination: 'SFO', basePrice: 450 },
  // Add new routes here
];

// Will generate flights automatically
```

### Validating Mock Data

Test mock data consistency:

```javascript
const mockData = new FlightMockData();
const allFlights = mockData.getAllFlights();

console.log(`Total mock flights: ${allFlights.length}`);
console.log(`Routes covered: ${new Set(allFlights.map(f => `${f.origin.iata}-${f.destination.iata}`)).size}`);
```

---

This fallback mechanism ensures that the MyTraveler flight search service remains highly available and responsive, providing a seamless experience for users even when external services experience issues. The system intelligently manages the transition between real-time and mock data, with comprehensive logging and monitoring to ensure operational awareness.