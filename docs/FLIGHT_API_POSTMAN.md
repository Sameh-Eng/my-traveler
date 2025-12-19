# MyTraveler Flight API - Postman Testing Guide

This guide provides comprehensive instructions for testing the flight search API endpoints using Postman. The API integrates with AviationStack to provide real-time flight data.

## 📋 Table of Contents

- [API Base URL](#api-base-url)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
- [Test Collections](#test-collections)
- [Example Responses](#example-responses)
- [Error Handling](#error-handling)
- [Troubleshooting](#troubleshooting)

## 🔗 API Base URL

### Development Environment
```
http://localhost:8080/api/flights
```

### Production Environment
```
https://api.mytraveler.com/flights
```

## 🔐 Authentication

Most flight endpoints are **public** and do not require authentication. However, admin endpoints for cache management require JWT authentication.

### Public Endpoints
- `POST /flights/search`
- `GET /flights/:id`
- `GET /flights/status/:iata_code`
- `GET /flights/airline/:iata_code`
- `GET /flights/airport/:iata_code`
- `GET /flights/health`

### Admin Endpoints (Requires Authentication)
- `DELETE /flights/cache`
- `GET /flights/cache/stats`

## ⏱️ Rate Limiting

The API implements rate limiting to prevent abuse:

- **Flight Search**: 30 requests per minute per IP
- **General Flight Endpoints**: 100 requests per minute per IP
- **Admin Endpoints**: 50 requests per minute per authenticated user

If rate limit is exceeded, you'll receive a `429 Too Many Requests` response.

## 🛠️ Setting Up Postman

### 1. Import Environment Variables

Create an environment in Postman with the following variables:

```json
{
  "name": "MyTraveler API",
  "values": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080",
      "enabled": true
    },
    {
      "key": "apiVersion",
      "value": "api",
      "enabled": true
    },
    {
      "key": "flightsEndpoint",
      "value": "{{baseUrl}}/{{apiVersion}}/flights",
      "enabled": true
    }
  ]
}
```

### 2. Import Test Collection

Copy the collection JSON below and import it into Postman.

## 📡 Endpoints

### 1. Search Flights

**Endpoint**: `POST /flights/search`

**Description**: Search for flights by origin, destination, and date

#### Request Parameters

| Parameter | Type | Required | Validation | Example |
|-----------|------|----------|------------|---------|
| `origin` | string | Yes | 3-character IATA code | `"JFK"` |
| `destination` | string | Yes | 3-character IATA code | `"LAX"` |
| `departureDate` | string | Yes | YYYY-MM-DD format | `"2024-12-25"` |
| `returnDate` | string | No | YYYY-MM-DD format | `"2024-12-30"` |
| `adults` | number | No | 1-9 | `2` |
| `children` | number | No | 0-8 | `1` |
| `infants` | number | No | 0-4 | `0` |
| `cabinClass` | string | No | economy/business/first | `"business"` |
| `direct` | boolean | No | true/false | `true` |
| `limit` | number | No | 1-100 | `20` |
| `offset` | number | No | ≥0 | `0` |

#### Postman Configuration

**Method**: `POST`
**URL**: `{{flightsEndpoint}}/search`
**Headers**:
- `Content-Type`: `application/json`

**Body (raw JSON)**:
```json
{
  "origin": "JFK",
  "destination": "LAX",
  "departureDate": "2024-12-25",
  "returnDate": "2024-12-30",
  "adults": 2,
  "children": 1,
  "infants": 0,
  "cabinClass": "economy",
  "direct": false,
  "limit": 20,
  "offset": 0
}
```

#### Test Script (Pre-request)
```javascript
// Validate required fields
const body = JSON.parse(pm.request.body.raw);

if (!body.origin || !body.destination || !body.departureDate) {
    postman.setNextRequest(null);
    throw new Error("Missing required fields: origin, destination, or departureDate");
}

// Auto-uppercase IATA codes
body.origin = body.origin.toUpperCase();
body.destination = body.destination.toUpperCase();

pm.request.body.update(JSON.stringify(body, null, 2));
```

#### Test Script (Tests)
```javascript
pm.test("Status code is 200 or 404", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 404]);
});

pm.test("Response has proper structure", function () {
    const jsonData = pm.response.json();

    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData).to.have.property('metadata');

    if (jsonData.success && jsonData.flights) {
        pm.expect(jsonData).to.have.property('flights');
        pm.expect(jsonData).to.have.property('pagination');
    }
});

pm.test("Response time is reasonable", function () {
    pm.expect(pm.response.responseTime).to.be.below(10000);
});
```

### 2. Get Flight Details

**Endpoint**: `GET /flights/:id`

**Description**: Get detailed information about a specific flight

#### Postman Configuration

**Method**: `GET`
**URL**: `{{flightsEndpoint}}/{{flightId}}`

**Path Variables**:
- `flightId`: Flight identifier (e.g., "AA123", "UA456")

**Example URL**: `{{flightsEndpoint}}/AA123`

#### Test Script (Tests)
```javascript
pm.test("Status code is 200 or 404", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 404]);
});

pm.test("Response has flight details", function () {
    const jsonData = pm.response.json();

    if (jsonData.success) {
        pm.expect(jsonData).to.have.property('flight');
        pm.expect(jsonData.flight).to.have.property('flightId');
        pm.expect(jsonData.flight).to.have.property('airline');
        pm.expect(jsonData.flight).to.have.property('departure');
        pm.expect(jsonData.flight).to.have.property('arrival');
    }
});
```

### 3. Get Flight Status

**Endpoint**: `GET /flights/status/:iata_code`

**Description**: Get real-time flight status

#### Postman Configuration

**Method**: `GET`
**URL**: `{{flightsEndpoint}}/status/{{iataCode}}`

**Path Variables**:
- `iataCode`: Flight IATA code (e.g., "AA123")

**Example URL**: `{{flightsEndpoint}}/status/AA123`

#### Test Script (Tests)
```javascript
pm.test("Status code is 200 or 404", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 404]);
});

pm.test("Response has status information", function () {
    const jsonData = pm.response.json();

    if (jsonData.success) {
        pm.expect(jsonData).to.have.property('flightId');
        pm.expect(jsonData).to.have.property('status');
        pm.expect(jsonData).to.have.property('statusText');
        pm.expect(jsonData).to.have.property('departure');
        pm.expect(jsonData).to.have.property('arrival');
    }
});
```

### 4. Get Airline Information

**Endpoint**: `GET /flights/airline/:iata_code`

**Description**: Get information about an airline

#### Postman Configuration

**Method**: `GET`
**URL**: `{{flightsEndpoint}}/airline/{{airlineCode}}`

**Path Variables**:
- `airlineCode`: Airline IATA code (e.g., "AA", "UA")

**Example URL**: `{{flightsEndpoint}}/airline/AA`

### 5. Get Airport Information

**Endpoint**: `GET /flights/airport/:iata_code`

**Description**: Get information about an airport

#### Postman Configuration

**Method**: `GET`
**URL**: `{{flightsEndpoint}}/airport/{{airportCode}}`

**Path Variables**:
- `airportCode`: Airport IATA code (e.g., "JFK", "LAX")

**Example URL**: `{{flightsEndpoint}}/airport/JFK`

### 6. Health Check

**Endpoint**: `GET /flights/health`

**Description**: Check the health of the flight service

#### Postman Configuration

**Method**: `GET`
**URL**: `{{flightsEndpoint}}/health`

#### Test Script (Tests)
```javascript
pm.test("Health check returns 200", function () {
    pm.expect(pm.response.code).to.equal(200);
});

pm.test("Response has health information", function () {
    const jsonData = pm.response.json();

    pm.expect(jsonData).to.have.property('success', true);
    pm.expect(jsonData).to.have.property('status', 'healthy');
    pm.expect(jsonData).to.have.property('externalApi');
});
```

### 7. Clear Cache (Admin Only)

**Endpoint**: `DELETE /flights/cache`

**Description**: Clear flight search cache

#### Postman Configuration

**Method**: `DELETE`
**URL**: `{{flightsEndpoint}}/cache`
**Authorization**: `Bearer {{jwtToken}}`

**Query Parameters** (Optional):
- `key`: Specific cache key to clear (if not provided, clears all)

#### Headers**:
- `Authorization`: `Bearer YOUR_JWT_TOKEN`

## 📋 Postman Collection

```json
{
  "info": {
    "_postman_id": "mytraveler-flight-api",
    "name": "MyTraveler Flight API",
    "description": "Complete collection for testing MyTraveler Flight API endpoints",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Flight Search",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"origin\": \"JFK\",\n  \"destination\": \"LAX\",\n  \"departureDate\": \"2024-12-25\",\n  \"returnDate\": \"2024-12-30\",\n  \"adults\": 2,\n  \"children\": 1,\n  \"infants\": 0,\n  \"cabinClass\": \"economy\",\n  \"direct\": false,\n  \"limit\": 20,\n  \"offset\": 0\n}"
        },
        "url": {
          "raw": "{{flightsEndpoint}}/search",
          "host": ["{{flightsEndpoint}}"],
          "path": ["search"]
        }
      },
      "event": [
        {
          "listen": "prerequest",
          "script": {
            "exec": [
              "// Validate required fields",
              "const body = JSON.parse(pm.request.body.raw);",
              "",
              "if (!body.origin || !body.destination || !body.departureDate) {",
              "    postman.setNextRequest(null);",
              "    throw new Error(\"Missing required fields: origin, destination, or departureDate\");",
              "}",
              "",
              "// Auto-uppercase IATA codes",
              "body.origin = body.origin.toUpperCase();",
              "body.destination = body.destination.toUpperCase();",
              "",
              "pm.request.body.update(JSON.stringify(body, null, 2));"
            ]
          }
        },
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status code is 200 or 404\", function () {",
              "    pm.expect(pm.response.code).to.be.oneOf([200, 404]);",
              "});",
              "",
              "pm.test(\"Response has proper structure\", function () {",
              "    const jsonData = pm.response.json();",
              "    ",
              "    pm.expect(jsonData).to.have.property('success');",
              "    pm.expect(jsonData).to.have.property('metadata');",
              "    ",
              "    if (jsonData.success && jsonData.flights) {",
              "        pm.expect(jsonData).to.have.property('flights');",
              "        pm.expect(jsonData).to.have.property('pagination');",
              "    }",
              "});",
              "",
              "pm.test(\"Response time is reasonable\", function () {",
              "    pm.expect(pm.response.responseTime).to.be.below(10000);",
              "});"
            ]
          }
        }
      ]
    },
    {
      "name": "Get Flight Details",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{flightsEndpoint}}/AA123",
          "host": ["{{flightsEndpoint}}"],
          "path": ["AA123"]
        }
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status code is 200 or 404\", function () {",
              "    pm.expect(pm.response.code).to.be.oneOf([200, 404]);",
              "});",
              "",
              "pm.test(\"Response has flight details\", function () {",
              "    const jsonData = pm.response.json();",
              "    ",
              "    if (jsonData.success) {",
              "        pm.expect(jsonData).to.have.property('flight');",
              "        pm.expect(jsonData.flight).to.have.property('flightId');",
              "        pm.expect(jsonData.flight).to.have.property('airline');",
              "        pm.expect(jsonData.flight).to.have.property('departure');",
              "        pm.expect(jsonData.flight).to.have.property('arrival');",
              "    }",
              "});"
            ]
          }
        }
      ]
    },
    {
      "name": "Get Flight Status",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{flightsEndpoint}}/status/AA123",
          "host": ["{{flightsEndpoint}}"],
          "path": ["status", "AA123"]
        }
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status code is 200 or 404\", function () {",
              "    pm.expect(pm.response.code).to.be.oneOf([200, 404]);",
              "});",
              "",
              "pm.test(\"Response has status information\", function () {",
              "    const jsonData = pm.response.json();",
              "    ",
              "    if (jsonData.success) {",
              "        pm.expect(jsonData).to.have.property('flightId');",
              "        pm.expect(jsonData).to.have.property('status');",
              "        pm.expect(jsonData).to.have.property('statusText');",
              "        pm.expect(jsonData).to.have.property('departure');",
              "        pm.expect(jsonData).to.have.property('arrival');",
              "    }",
              "});"
            ]
          }
        }
      ]
    },
    {
      "name": "Get Airline Info",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{flightsEndpoint}}/airline/AA",
          "host": ["{{flightsEndpoint}}"],
          "path": ["airline", "AA"]
        }
      }
    },
    {
      "name": "Get Airport Info",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{flightsEndpoint}}/airport/JFK",
          "host": ["{{flightsEndpoint}}"],
          "path": ["airport", "JFK"]
        }
      }
    },
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{flightsEndpoint}}/health",
          "host": ["{{flightsEndpoint}}"],
          "path": ["health"]
        }
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Health check returns 200\", function () {",
              "    pm.expect(pm.response.code).to.equal(200);",
              "});",
              "",
              "pm.test(\"Response has health information\", function () {",
              "    const jsonData = pm.response.json();",
              "    ",
              "    pm.expect(jsonData).to.have.property('success', true);",
              "    pm.expect(jsonData).to.have.property('status', 'healthy');",
              "    pm.expect(jsonData).to.have.property('externalApi');",
              "});"
            ]
          }
        }
      ]
    }
  ],
  "event": [
    {
      "listen": "prerequest",
      "script": {
        "exec": [
          "// Add request ID for tracking",
          "const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);",
          "pm.globals.set('requestId', requestId);",
          "",
          "// Log request start",
          "console.log('[' + requestId + '] Starting request: ' + pm.info.requestName);"
        ]
      }
    },
    {
      "listen": "test",
      "script": {
        "exec": [
          "// Log request completion",
          "const requestId = pm.globals.get('requestId');",
          "console.log('[' + requestId + '] Request completed with status: ' + pm.response.code + ' (' + pm.response.responseTime + 'ms)');"
        ]
      }
    }
  ]
}
```

## 📊 Example Responses

### Successful Flight Search Response

```json
{
  "success": true,
  "message": "Found 15 flights",
  "flights": [
    {
      "flightId": "AA123",
      "flightNumber": "AA123",
      "airline": {
        "name": "American Airlines",
        "iata": "AA",
        "icao": "AAL"
      },
      "departure": {
        "airport": "John F. Kennedy International",
        "iata": "JFK",
        "icao": "KJFK",
        "terminal": "4",
        "gate": "B22",
        "scheduled": "2024-12-25T10:30:00Z",
        "estimated": "2024-12-25T10:35:00Z",
        "actual": null,
        "delayed": false,
        "timezone": "America/New_York"
      },
      "arrival": {
        "airport": "Los Angeles International",
        "iata": "LAX",
        "icao": "KLAX",
        "terminal": "4",
        "gate": "45A",
        "scheduled": "2024-12-25T14:15:00Z",
        "estimated": "2024-12-25T14:10:00Z",
        "actual": null,
        "delayed": false,
        "timezone": "America/Los_Angeles"
      },
      "aircraft": {
        "registration": "N12345",
        "iata": "A321",
        "icao": "A321",
        "icao24": "A1B2C3"
      },
      "flight": {
        "iata": "AA123",
        "icao": "AAL123",
        "codeshared": null,
        "number": "123"
      },
      "status": "scheduled",
      "duration": "6h 45m",
      "price": {
        "economy": 349,
        "business": 1047,
        "first": 2094
      },
      "seats": {
        "economy": 45,
        "business": 12,
        "first": 8
      }
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  },
  "searchParams": {
    "origin": "JFK",
    "destination": "LAX",
    "departureDate": "2024-12-25",
    "returnDate": "2024-12-30",
    "adults": 2,
    "children": 1,
    "infants": 0,
    "cabinClass": "economy",
    "direct": false,
    "limit": 20,
    "offset": 0
  },
  "metadata": {
    "timestamp": "2024-11-24T10:30:00.000Z",
    "responseTime": "2450ms",
    "requestId": "req_1732444200000_abc123def",
    "version": "1.0.0"
  }
}
```

### Flight Details Response

```json
{
  "success": true,
  "flight": {
    "flightId": "AA123",
    "flightNumber": "AA123",
    "airline": {
      "name": "American Airlines",
      "iata": "AA",
      "icao": "AAL"
    },
    "departure": {
      "airport": "John F. Kennedy International",
      "iata": "JFK",
      "icao": "KJFK",
      "terminal": "4",
      "gate": "B22",
      "scheduled": "2024-12-25T10:30:00Z",
      "estimated": "2024-12-25T10:35:00Z",
      "actual": null,
      "delayed": false,
      "timezone": "America/New_York"
    },
    "arrival": {
      "airport": "Los Angeles International",
      "iata": "LAX",
      "icao": "KLAX",
      "terminal": "4",
      "gate": "45A",
      "scheduled": "2024-12-25T14:15:00Z",
      "estimated": "2024-12-25T14:10:00Z",
      "actual": null,
      "delayed": false,
      "timezone": "America/Los_Angeles"
    },
    "aircraft": {
      "registration": "N12345",
      "iata": "A321",
      "icao": "A321",
      "icao24": "A1B2C3"
    },
    "flight": {
      "iata": "AA123",
      "icao": "AAL123",
      "codeshared": null,
      "number": "123"
    },
    "status": "scheduled",
    "duration": "6h 45m",
    "distance": "3975 km"
  },
  "metadata": {
    "timestamp": "2024-11-24T10:35:00.000Z",
    "responseTime": "1234ms",
    "requestId": "req_1732444500000_xyz456abc",
    "version": "1.0.0"
  }
}
```

### Flight Status Response

```json
{
  "success": true,
  "flightId": "AA123",
  "flightNumber": "AA123",
  "status": "active",
  "statusText": "In Flight",
  "departure": {
    "airport": "John F. Kennedy International",
    "iata": "JFK",
    "terminal": "4",
    "gate": "B22",
    "scheduled": "2024-12-25T10:30:00Z",
    "estimated": "2024-12-25T10:35:00Z",
    "actual": "2024-12-25T10:36:00Z",
    "delayed": false,
    "isDelayed": false,
    "delayMinutes": 0
  },
  "arrival": {
    "airport": "Los Angeles International",
    "iata": "LAX",
    "terminal": "4",
    "gate": "45A",
    "scheduled": "2024-12-25T14:15:00Z",
    "estimated": "2024-12-25T14:10:00Z",
    "actual": null,
    "delayed": false,
    "isDelayed": false,
    "delayMinutes": 0
  },
  "airline": {
    "name": "American Airlines",
    "iata": "AA"
  },
  "aircraft": {
    "registration": "N12345",
    "iata": "A321"
  },
  "lastUpdated": "2024-11-24T10:35:00.000Z"
}
```

## ❌ Error Handling

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Origin must be a 3-character IATA code",
      "param": "origin",
      "location": "body"
    }
  ],
  "timestamp": "2024-11-24T10:30:00.000Z"
}
```

### Rate Limit Error (429)
```json
{
  "success": false,
  "message": "Too many flight search requests, please try again later.",
  "retryAfter": 60,
  "timestamp": "2024-11-24T10:30:00.000Z"
}
```

### Flight Not Found (404)
```json
{
  "success": false,
  "message": "Flight not found",
  "metadata": {
    "timestamp": "2024-11-24T10:30:00.000Z",
    "responseTime": "234ms",
    "requestId": "req_1732444200000_abc123def"
  }
}
```

### API Service Error (503)
```json
{
  "success": false,
  "message": "Flight search service is temporarily unavailable",
  "metadata": {
    "timestamp": "2024-11-24T10:30:00.000Z",
    "responseTime": "5000ms",
    "requestId": "req_1732444200000_abc123def"
  }
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "Invalid API key" Error
- **Cause**: AviationStack API key is not configured or invalid
- **Solution**: Check environment variable `AVIATIONSTACK_API_KEY`

#### 2. "No flights found" Response
- **Cause**: No flights available for the specified criteria
- **Solution**: Try different dates, routes, or broaden search criteria

#### 3. Rate Limit Exceeded
- **Cause**: Too many requests in a short period
- **Solution**: Wait and retry, or reduce request frequency

#### 4. "Invalid date format" Error
- **Cause**: Date not in YYYY-MM-DD format
- **Solution**: Ensure dates are properly formatted

#### 5. Slow Response Times
- **Cause**: External API latency or network issues
- **Solution**: Check response time and consider implementing caching

### Debugging Tips

1. **Check Request Headers**:
   - Ensure `Content-Type: application/json` for POST requests
   - Add `User-Agent` header if required

2. **Verify Request Body**:
   - Use Postman's "Pretty" format to validate JSON
   - Check for trailing commas or syntax errors

3. **Monitor Response Times**:
   - Normal response time should be under 10 seconds
   - Longer times may indicate API issues

4. **Check Network Connectivity**:
   - Verify you can reach the API endpoint
   - Test with a simple GET request first

5. **Review Logs**:
   - Check server logs for detailed error information
   - Look for request ID in logs for correlation

### Testing Best Practices

1. **Start Simple**: Begin with basic health check endpoint
2. **Test Validation**: Try invalid inputs to test error handling
3. **Check Edge Cases**: Test boundary values and special characters
4. **Monitor Performance**: Track response times for different query sizes
5. **Test Caching**: Make subsequent requests to verify caching works

### Environment Variables

Ensure these are set in your backend environment:

```bash
# AviationStack API Configuration
AVIATIONSTACK_API_KEY=3db8755aa61b80e79168c3374801b21a
AVIATIONSTACK_BASE_URL=http://api.aviationstack.com/v1

# Cache Configuration
FLIGHT_API_TIMEOUT=10000
FLIGHT_CACHE_TTL=300

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password
```

---

This comprehensive testing guide should help you thoroughly test the MyTraveler Flight API using Postman. The API provides robust flight search capabilities with proper error handling, caching, and performance optimization.