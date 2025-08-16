# GitHub Pages API Setup Guide

## Overview

This document provides a comprehensive guide for creating and deploying a client-side API on GitHub Pages that can handle requests for Movies, Persons, and Producers data. The solution works entirely with static files and can be accessed via a custom domain.

## Project Structure

```
your-repo/
├── index.html          # Main API documentation and testing interface
├── app.js             # Core API logic and routing system
├── style.css          # Styling for the interface
├── data/              # JSON data files (optional separate files)
│   ├── movies.json
│   ├── persons.json
│   └── producers.json
├── CNAME              # Custom domain configuration
└── README.md          # Project documentation
```

## Core Features

### 1. API Endpoints

The client-side API supports the following endpoints:

- **Movies API**
  - `GET /api/movies` - Get all movies
  - `GET /api/movies/{id}` - Get specific movie by ID
  - `GET /api/movies/search?q={query}` - Search movies
  
- **Persons API**
  - `GET /api/persons` - Get all persons
  - `GET /api/persons/{id}` - Get specific person by ID
  - `GET /api/persons/search?q={query}` - Search persons
  
- **Producers API**
  - `GET /api/producers` - Get all producers  
  - `GET /api/producers/{id}` - Get specific producer by ID
  - `GET /api/producers/search?q={query}` - Search producers

### 2. Query Parameters

All endpoints support pagination and filtering:
- `limit` - Number of results to return (default: 10)
- `offset` - Number of results to skip (default: 0)
- `sort` - Sort field (default: id)
- `order` - Sort order: asc/desc (default: asc)

### 3. Response Format

All API responses follow this structure:

```json
{
  "status": 200,
  "data": [...],
  "meta": {
    "total": 100,
    "limit": 10,
    "offset": 0,
    "count": 10
  }
}
```

## Implementation Details

### Client-Side Routing

The API uses hash-based routing to simulate real API endpoints:

```javascript
// Hash-based routing examples
yoursite.com/#/api/movies
yoursite.com/#/api/movies/1997
yoursite.com/#/api/persons/110756

// Query parameter routing (alternative)
yoursite.com/?endpoint=/api/movies
yoursite.com/?endpoint=/api/movies/1997&format=json
```

### Data Management

Data can be managed in two ways:

1. **Embedded Data** (Recommended for small datasets)
   - Data is embedded directly in the JavaScript file
   - Faster loading, no additional HTTP requests
   - Used in the provided application

2. **External JSON Files** (Better for larger datasets)
   - Data stored in separate JSON files
   - Loaded via fetch() requests
   - Easier to maintain and update

### Error Handling

The API includes comprehensive error handling:
- 404 errors for non-existent resources
- 400 errors for malformed requests
- 500 errors for server-side issues
- Proper HTTP status codes and error messages

## Deployment Steps

### Step 1: Repository Setup

1. Create a new GitHub repository
2. Upload all project files to the repository
3. Ensure `index.html` is in the root directory

### Step 2: Enable GitHub Pages

1. Go to repository Settings
2. Navigate to Pages section
3. Select source branch (usually `main` or `gh-pages`)
4. Save settings
5. Note the generated GitHub Pages URL

### Step 3: Custom Domain Setup (Optional)

#### 3.1 Add Custom Domain to GitHub

1. In repository Settings → Pages
2. Add your custom domain (e.g., `api.yourdomain.com`)
3. This creates a `CNAME` file in your repository

#### 3.2 Configure DNS Records

Add these DNS records at your domain provider:

**For apex domain (yourdomain.com):**
```
Type: A
Name: @
Value: 185.199.108.153

Type: A  
Name: @
Value: 185.199.109.153

Type: A
Name: @  
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

**For subdomain (api.yourdomain.com):**
```
Type: CNAME
Name: api
Value: yourusername.github.io
```

### Step 4: SSL Configuration

GitHub Pages automatically provides SSL certificates for custom domains. Enable "Enforce HTTPS" in the Pages settings.

## Usage Examples

### Basic API Calls

```javascript
// Get all movies
const response = await fetch('https://api.yourdomain.com/#/api/movies');
const data = await response.json();

// Get specific movie
const movie = await fetch('https://api.yourdomain.com/#/api/movies/1997');

// Search movies
const results = await fetch('https://api.yourdomain.com/#/api/movies/search?q=adventure');

// With pagination
const page2 = await fetch('https://api.yourdomain.com/#/api/movies?limit=5&offset=10');
```

### CORS Configuration

Since everything is served from the same domain, CORS is not an issue. However, the API includes proper CORS headers for external requests:

```javascript
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};
```

## Data Structure Examples

### Movie Object
```json
{
  "id": 1997,
  "title": "Two Brothers",
  "overview": "Two tigers are separated as cubs...",
  "release_date": "2004-04-07",
  "runtime": 109,
  "genres": ["Adventure", "Drama", "Family"],
  "spoken_languages": ["English", "French", "Thai"],
  "poster_url": "https://image.tmdb.org/t/p/w500/...",
  "backdrop_url": "https://image.tmdb.org/t/p/w780/...",
  "cast_ids": [529, 13687, 1281],
  "crew_ids": [2358, 17063, 2352],
  "production_company_ids": [866, 116231, 356],
  "trailer_url": "https://www.youtube.com/watch?v=...",
  "imdb_rating": 7.103,
  "vote_count": 836
}
```

### Person Object
```json
{
  "id": 110756,
  "name": "Juuso Hirvikangas",
  "profile_url": "https://image.tmdb.org/t/p/w300/...",
  "roles": [
    {
      "movie_id": 2,
      "character": "Man in Harbour (uncredited)"
    }
  ],
  "crew_roles": [
    {
      "movie_id": 2,
      "job": "Gaffer",
      "department": "Lighting"
    }
  ]
}
```

### Producer Object
```json
{
  "id": 3448,
  "name": "ITV",
  "origin_country": "GB",
  "logo_url": "https://image.tmdb.org/t/p/w300/..."
}
```

## Advanced Features

### Rate Limiting Simulation
The API can simulate rate limiting for demonstration purposes:

```javascript
// Add rate limiting headers to responses
headers['X-RateLimit-Limit'] = '1000';
headers['X-RateLimit-Remaining'] = '999';
headers['X-RateLimit-Reset'] = Date.now() + 3600000;
```

### Caching Strategy
For better performance, implement client-side caching:

```javascript
// Simple cache implementation
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}
```

### Mock Authentication
For demonstration purposes, you can implement mock authentication:

```javascript
// Mock JWT token validation
function validateToken(token) {
  // In a real API, this would validate against a service
  return token === 'demo-token';
}
```

## Limitations and Considerations

### GitHub Pages Limitations
1. **Static Only**: No server-side processing
2. **File Size Limits**: 100MB per file, 1GB per repository  
3. **Bandwidth**: 100GB per month soft limit
4. **Build Time**: 10-minute timeout for builds

### Client-Side API Limitations
1. **Data Security**: All data is publicly accessible
2. **No Real Authentication**: Cannot securely store API keys
3. **Limited Complexity**: Cannot perform complex database operations
4. **CORS**: May face CORS issues when called from other domains

### Recommended Use Cases
- **Portfolio Projects**: Demonstrating API design skills
- **Prototyping**: Quick mock APIs for frontend development
- **Documentation**: Interactive API documentation
- **Educational**: Learning about API design and client-side development
- **Small Datasets**: Public data that doesn't require real-time updates

## Monitoring and Analytics

### Usage Tracking
While GitHub Pages doesn't provide detailed analytics, you can add client-side tracking:

```javascript
// Simple usage tracking
function trackAPIUsage(endpoint, method) {
  // Send to analytics service like Google Analytics
  gtag('event', 'api_request', {
    'endpoint': endpoint,
    'method': method,
    'timestamp': new Date().toISOString()
  });
}
```

### Performance Monitoring
Monitor API performance on the client side:

```javascript
function measureAPIPerformance(startTime, endpoint) {
  const endTime = performance.now();
  const duration = endTime - startTime;
  console.log(`API ${endpoint} took ${duration}ms`);
}
```

## Maintenance and Updates

### Updating Data
1. **Direct File Updates**: Edit data directly in JavaScript files
2. **JSON File Updates**: Update separate JSON files if using external data
3. **Automated Updates**: Use GitHub Actions to update data from external sources

### Version Control
Consider implementing API versioning:

```javascript
// Version in URL path
https://api.yourdomain.com/#/v1/api/movies
https://api.yourdomain.com/#/v2/api/movies

// Version in query parameter
https://api.yourdomain.com/#/api/movies?version=1
```

## Troubleshooting

### Common Issues

1. **404 Errors on Custom Domain**
   - Verify DNS records are correctly configured
   - Wait for DNS propagation (up to 24 hours)
   - Check CNAME file exists in repository

2. **CORS Errors**
   - Ensure API and client are on same domain
   - Check if HTTPS is enforced consistently

3. **Large File Issues**
   - Split large JSON files into smaller chunks
   - Implement lazy loading for data

4. **Performance Issues**
   - Enable browser caching
   - Minimize JSON file sizes
   - Use CDN for assets

### Support Resources
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Custom Domain Setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [DNS Configuration Guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

## Conclusion

This client-side API solution provides a robust foundation for hosting API-like functionality on GitHub Pages. While it has limitations compared to traditional server-side APIs, it offers an excellent starting point for portfolio projects, prototyping, and educational purposes.

The combination of professional documentation, interactive testing tools, and comprehensive deployment instructions makes this solution suitable for both learning and demonstration purposes.