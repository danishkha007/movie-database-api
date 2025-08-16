// Movie Database API - Client-side Implementation
class MovieDatabaseAPI {
  constructor() {
    this.data = {
      movies: [
        {
          id: 1997,
          title: "Two Brothers",
          overview: "Two tigers are separated as cubs and taken into captivity, only to be reunited years later as enemies by an explorer (Pearce) who inadvertently forces them to fight each other.",
          release_date: "2004-04-07",
          runtime: 109,
          genres: ["Adventure", "Drama", "Family"],
          spoken_languages: ["English", "French", "Thai"],
          poster_url: "https://image.tmdb.org/t/p/w500/5I2pRuJI3SZVsxP5iaorGaczzkI.jpg",
          backdrop_url: "https://image.tmdb.org/t/p/w780/aB5123I8MNi3NIg0t9RrP6A7Yla.jpg",
          cast_ids: [529, 13687, 1281, 20527, 20530],
          crew_ids: [2358, 17063, 2352, 2359, 469],
          production_company_ids: [866, 116231, 356],
          trailer_url: "https://www.youtube.com/watch?v=xvRZIAwkTvQ",
          imdb_rating: 7.103,
          vote_count: 836,
          seo_title: "Two Brothers: Cast, Crew, Production, Box-Office - TimesEntertain",
          seo_description: "Two Brothers: Two tigers are separated as cubs and taken into captivity, only to be reunited years later as enemies by an explorer (Pearce) who inadvertently forces them to fight each other.",
          seo_focus_keywords: "Two Brothers,Adventure,Drama,Family,Two Brothers in English,Two Brothers in French,Two Brothers in Thai"
        },
        {
          id: 1998,
          title: "Sample Movie 2",
          overview: "Another sample movie for demonstration.",
          release_date: "2005-05-15",
          runtime: 120,
          genres: ["Action", "Thriller"],
          spoken_languages: ["English"],
          poster_url: "https://via.placeholder.com/500x750/1FB8CD/FFFFFF?text=Movie+2",
          backdrop_url: "https://via.placeholder.com/780x439/5D878F/FFFFFF?text=Movie+2+Backdrop",
          cast_ids: [110756],
          crew_ids: [110756],
          production_company_ids: [3448],
          trailer_url: "https://www.youtube.com/watch?v=sample",
          imdb_rating: 6.5,
          vote_count: 425,
          seo_title: "Sample Movie 2: Action Thriller",
          seo_description: "An action-packed thriller for demonstration purposes.",
          seo_focus_keywords: "Sample,Action,Thriller,Movie"
        }
      ],
      persons: [
        {
          id: 110756,
          name: "Juuso Hirvikangas",
          profile_url: "https://image.tmdb.org/t/p/w300/7rvAPTsfz9U2E5tYghfY8YQlZ94.jpg",
          roles: [
            {
              movie_id: 2,
              character: "Man in Harbour (uncredited)"
            }
          ],
          crew_roles: [
            {
              movie_id: 2,
              job: "Gaffer",
              department: "Lighting"
            },
            {
              movie_id: 3,
              job: "Sound Assistant",
              department: "Sound"
            }
          ]
        },
        {
          id: 110757,
          name: "Sample Actor",
          profile_url: "https://via.placeholder.com/300x450/FFC185/000000?text=Sample+Actor",
          roles: [
            {
              movie_id: 1997,
              character: "Leading Role"
            }
          ],
          crew_roles: []
        }
      ],
      producers: [
        {
          id: 3448,
          name: "ITV",
          origin_country: "GB",
          logo_url: "https://image.tmdb.org/t/p/w300/dcA8JDfnnQPMaq8lv2CCiYrNe0S.png"
        },
        {
          id: 3449,
          name: "Sample Productions",
          origin_country: "US",
          logo_url: "https://via.placeholder.com/300x200/B4413C/FFFFFF?text=Sample+Productions"
        }
      ]
    };
    
    this.baseUrl = window.location.origin + window.location.pathname;
  }

  init() {
    this.updateBaseUrl();
    this.setupRouting();
    this.setupEventListeners();
    // Initialize the UI after DOM is ready
    setTimeout(() => {
      this.showDataType('movies');
      this.updateEndpointForm();
    }, 100);
  }

  updateBaseUrl() {
    const baseUrlElement = document.getElementById('base-url');
    if (baseUrlElement) {
      baseUrlElement.textContent = this.baseUrl;
    }
  }

  setupRouting() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  }

  setupEventListeners() {
    // Handle endpoint parameter changes
    document.addEventListener('change', (e) => {
      if (e.target.matches('.endpoint-param')) {
        this.updateRequestUrl();
      }
    });

    // Handle input changes for real-time URL updates
    document.addEventListener('input', (e) => {
      if (e.target.matches('.endpoint-param')) {
        this.updateRequestUrl();
      }
    });
  }

  handleRoute() {
    const hash = window.location.hash.slice(1);
    if (hash.startsWith('/api/')) {
      this.handleAPIRequest(hash);
    }
  }

  handleAPIRequest(path) {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    
    const response = this.processAPIRequest(path, params);
    console.log('API Response:', response);
  }

  processAPIRequest(path, params) {
    const pathParts = path.split('/').filter(p => p);
    const endpoint = pathParts[1]; // 'movies', 'persons', 'producers', 'search'
    const id = pathParts[2]; // specific ID if present

    try {
      switch (endpoint) {
        case 'movies':
          return id ? this.getMovieById(parseInt(id)) : this.getMovies(params);
        case 'persons':
          return id ? this.getPersonById(parseInt(id)) : this.getPersons(params);
        case 'producers':
          return id ? this.getProducerById(parseInt(id)) : this.getProducers(params);
        case 'search':
          return this.search(params);
        default:
          return this.createErrorResponse(404, 'Endpoint not found');
      }
    } catch (error) {
      return this.createErrorResponse(500, error.message);
    }
  }

  getMovies(params) {
    let movies = [...this.data.movies];
    
    // Filter by genre if specified
    const genre = params.get('genre');
    if (genre) {
      movies = movies.filter(movie => 
        movie.genres.some(g => g.toLowerCase().includes(genre.toLowerCase()))
      );
    }

    // Apply pagination
    const limit = parseInt(params.get('limit')) || 10;
    const offset = parseInt(params.get('offset')) || 0;
    
    const paginatedMovies = movies.slice(offset, offset + limit);
    
    return this.createSuccessResponse({
      data: paginatedMovies,
      pagination: {
        total: movies.length,
        limit,
        offset,
        has_more: offset + limit < movies.length
      }
    });
  }

  getMovieById(id) {
    const movie = this.data.movies.find(m => m.id === id);
    if (!movie) {
      return this.createErrorResponse(404, `Movie with id ${id} not found`);
    }
    return this.createSuccessResponse({ data: movie });
  }

  getPersons(params) {
    const limit = parseInt(params.get('limit')) || 10;
    const offset = parseInt(params.get('offset')) || 0;
    
    const paginatedPersons = this.data.persons.slice(offset, offset + limit);
    
    return this.createSuccessResponse({
      data: paginatedPersons,
      pagination: {
        total: this.data.persons.length,
        limit,
        offset,
        has_more: offset + limit < this.data.persons.length
      }
    });
  }

  getPersonById(id) {
    const person = this.data.persons.find(p => p.id === id);
    if (!person) {
      return this.createErrorResponse(404, `Person with id ${id} not found`);
    }
    return this.createSuccessResponse({ data: person });
  }

  getProducers(params) {
    const limit = parseInt(params.get('limit')) || 10;
    const offset = parseInt(params.get('offset')) || 0;
    
    const paginatedProducers = this.data.producers.slice(offset, offset + limit);
    
    return this.createSuccessResponse({
      data: paginatedProducers,
      pagination: {
        total: this.data.producers.length,
        limit,
        offset,
        has_more: offset + limit < this.data.producers.length
      }
    });
  }

  getProducerById(id) {
    const producer = this.data.producers.find(p => p.id === id);
    if (!producer) {
      return this.createErrorResponse(404, `Producer with id ${id} not found`);
    }
    return this.createSuccessResponse({ data: producer });
  }

  search(params) {
    const query = params.get('q');
    if (!query) {
      return this.createErrorResponse(400, 'Search query parameter "q" is required');
    }

    const type = params.get('type');
    const results = {
      movies: [],
      persons: [],
      producers: []
    };

    const searchTerm = query.toLowerCase();

    // Search movies
    if (!type || type === 'movies') {
      results.movies = this.data.movies.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm) ||
        movie.overview.toLowerCase().includes(searchTerm) ||
        movie.genres.some(genre => genre.toLowerCase().includes(searchTerm))
      );
    }

    // Search persons
    if (!type || type === 'persons') {
      results.persons = this.data.persons.filter(person =>
        person.name.toLowerCase().includes(searchTerm)
      );
    }

    // Search producers
    if (!type || type === 'producers') {
      results.producers = this.data.producers.filter(producer =>
        producer.name.toLowerCase().includes(searchTerm) ||
        producer.origin_country.toLowerCase().includes(searchTerm)
      );
    }

    const totalResults = results.movies.length + results.persons.length + results.producers.length;

    return this.createSuccessResponse({
      query,
      total_results: totalResults,
      results
    });
  }

  createSuccessResponse(data) {
    return {
      status: 200,
      success: true,
      timestamp: new Date().toISOString(),
      ...data
    };
  }

  createErrorResponse(status, message) {
    return {
      status,
      success: false,
      error: {
        message,
        timestamp: new Date().toISOString()
      }
    };
  }

  formatJSON(obj) {
    return JSON.stringify(obj, null, 2);
  }

  syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  }

  showDataType(type) {
    // Update active tab
    document.querySelectorAll('.browser-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    const activeTab = document.querySelector(`[data-type="${type}"]`);
    if (activeTab) {
      activeTab.classList.add('active');
    }
    
    // Display data
    const dataDisplay = document.getElementById('data-display');
    if (!dataDisplay) return;
    
    const data = this.data[type];
    
    let cardsHTML = '';
    
    data.forEach(item => {
      let cardHTML = '';
      
      switch (type) {
        case 'movies':
          cardHTML = `
            <div class="data-card">
              <div class="data-card-header">
                <img src="${item.poster_url}" alt="${item.title}" class="data-card-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="data-card-image" style="display:none;">🎬</div>
                <div>
                  <h4 class="data-card-title">${item.title}</h4>
                  <p class="data-card-subtitle">ID: ${item.id} | ${item.release_date}</p>
                </div>
              </div>
              <div class="data-card-content">
                <p>${item.overview.substring(0, 150)}${item.overview.length > 150 ? '...' : ''}</p>
                <div class="data-card-meta">
                  ${item.genres.map(genre => `<span class="data-tag">${genre}</span>`).join('')}
                </div>
              </div>
            </div>
          `;
          break;
        case 'persons':
          cardHTML = `
            <div class="data-card">
              <div class="data-card-header">
                <img src="${item.profile_url}" alt="${item.name}" class="data-card-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="data-card-image" style="display:none;">👤</div>
                <div>
                  <h4 class="data-card-title">${item.name}</h4>
                  <p class="data-card-subtitle">ID: ${item.id}</p>
                </div>
              </div>
              <div class="data-card-content">
                <p><strong>Acting Roles:</strong> ${item.roles.length}</p>
                <p><strong>Crew Roles:</strong> ${item.crew_roles.length}</p>
                ${item.crew_roles.length > 0 ? `<p><strong>Departments:</strong> ${[...new Set(item.crew_roles.map(role => role.department))].join(', ')}</p>` : ''}
              </div>
            </div>
          `;
          break;
        case 'producers':
          cardHTML = `
            <div class="data-card">
              <div class="data-card-header">
                <img src="${item.logo_url}" alt="${item.name}" class="data-card-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="data-card-image" style="display:none;">🏢</div>
                <div>
                  <h4 class="data-card-title">${item.name}</h4>
                  <p class="data-card-subtitle">ID: ${item.id}</p>
                </div>
              </div>
              <div class="data-card-content">
                <p><strong>Origin Country:</strong> ${item.origin_country}</p>
                <div class="data-card-meta">
                  <span class="data-tag">${item.origin_country}</span>
                </div>
              </div>
            </div>
          `;
          break;
      }
      
      cardsHTML += cardHTML;
    });
    
    dataDisplay.innerHTML = cardsHTML;
  }
}

// Global API instance
let api;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  api = new MovieDatabaseAPI();
  api.init();
});

// UI Helper Functions
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

function copyBaseUrl() {
  if (!api) return;
  navigator.clipboard.writeText(api.baseUrl).then(() => {
    showNotification('Base URL copied to clipboard!');
  }).catch(() => {
    showNotification('Failed to copy URL');
  });
}

function updateEndpointForm() {
  const select = document.getElementById('endpoint-select');
  const paramsContainer = document.getElementById('endpoint-params');
  
  if (!select || !paramsContainer) return;
  
  const endpoint = select.value;
  
  let paramsHTML = '';
  
  switch (endpoint) {
    case 'movies':
      paramsHTML = `
        <div class="param-group">
          <label class="form-label" for="param-limit">Limit (optional)</label>
          <input type="number" id="param-limit" class="form-control endpoint-param" placeholder="10" min="1" max="100">
        </div>
        <div class="param-group">
          <label class="form-label" for="param-offset">Offset (optional)</label>
          <input type="number" id="param-offset" class="form-control endpoint-param" placeholder="0" min="0">
        </div>
        <div class="param-group">
          <label class="form-label" for="param-genre">Genre (optional)</label>
          <select id="param-genre" class="form-control endpoint-param">
            <option value="">All genres</option>
            <option value="adventure">Adventure</option>
            <option value="drama">Drama</option>
            <option value="family">Family</option>
            <option value="action">Action</option>
            <option value="thriller">Thriller</option>
          </select>
        </div>
      `;
      break;
    case 'movies-id':
      paramsHTML = `
        <div class="param-group">
          <label class="form-label" for="param-id">Movie ID <span style="color: var(--color-error);">*</span></label>
          <input type="number" id="param-id" class="form-control endpoint-param" placeholder="1997" required>
        </div>
      `;
      break;
    case 'persons':
      paramsHTML = `
        <div class="param-group">
          <label class="form-label" for="param-limit">Limit (optional)</label>
          <input type="number" id="param-limit" class="form-control endpoint-param" placeholder="10" min="1" max="100">
        </div>
        <div class="param-group">
          <label class="form-label" for="param-offset">Offset (optional)</label>
          <input type="number" id="param-offset" class="form-control endpoint-param" placeholder="0" min="0">
        </div>
      `;
      break;
    case 'persons-id':
      paramsHTML = `
        <div class="param-group">
          <label class="form-label" for="param-id">Person ID <span style="color: var(--color-error);">*</span></label>
          <input type="number" id="param-id" class="form-control endpoint-param" placeholder="110756" required>
        </div>
      `;
      break;
    case 'producers':
      paramsHTML = `
        <div class="param-group">
          <label class="form-label" for="param-limit">Limit (optional)</label>
          <input type="number" id="param-limit" class="form-control endpoint-param" placeholder="10" min="1" max="100">
        </div>
        <div class="param-group">
          <label class="form-label" for="param-offset">Offset (optional)</label>
          <input type="number" id="param-offset" class="form-control endpoint-param" placeholder="0" min="0">
        </div>
      `;
      break;
    case 'producers-id':
      paramsHTML = `
        <div class="param-group">
          <label class="form-label" for="param-id">Producer ID <span style="color: var(--color-error);">*</span></label>
          <input type="number" id="param-id" class="form-control endpoint-param" placeholder="3448" required>
        </div>
      `;
      break;
    case 'search':
      paramsHTML = `
        <div class="param-group">
          <label class="form-label" for="param-q">Search Query <span style="color: var(--color-error);">*</span></label>
          <input type="text" id="param-q" class="form-control endpoint-param" placeholder="Two Brothers" required>
        </div>
        <div class="param-group">
          <label class="form-label" for="param-type">Type (optional)</label>
          <select id="param-type" class="form-control endpoint-param">
            <option value="">All types</option>
            <option value="movies">Movies</option>
            <option value="persons">Persons</option>
            <option value="producers">Producers</option>
          </select>
        </div>
      `;
      break;
  }
  
  paramsContainer.innerHTML = paramsHTML;
  updateRequestUrl();
}

function updateRequestUrl() {
  const select = document.getElementById('endpoint-select');
  if (!select || !api) return;
  
  const endpoint = select.value;
  
  let path = '';
  let queryParams = [];
  
  // Build the API path
  switch (endpoint) {
    case 'movies':
      path = '/api/movies';
      break;
    case 'movies-id':
      const movieId = document.getElementById('param-id')?.value || ':id';
      path = `/api/movies/${movieId}`;
      break;
    case 'persons':
      path = '/api/persons';
      break;
    case 'persons-id':
      const personId = document.getElementById('param-id')?.value || ':id';
      path = `/api/persons/${personId}`;
      break;
    case 'producers':
      path = '/api/producers';
      break;
    case 'producers-id':
      const producerId = document.getElementById('param-id')?.value || ':id';
      path = `/api/producers/${producerId}`;
      break;
    case 'search':
      path = '/api/search';
      break;
  }
  
  // Collect query parameters
  const params = document.querySelectorAll('.endpoint-param');
  params.forEach(param => {
    if (param.value && param.id !== 'param-id') {
      const paramName = param.id.replace('param-', '');
      queryParams.push(`${paramName}=${encodeURIComponent(param.value)}`);
    }
  });
  
  let fullUrl = api.baseUrl + '#' + path;
  if (queryParams.length > 0) {
    fullUrl += '?' + queryParams.join('&');
  }
  
  const urlDisplay = document.getElementById('request-url-display');
  if (urlDisplay) {
    urlDisplay.textContent = fullUrl;
  }
}

function testEndpoint() {
  if (!api) return;
  
  const select = document.getElementById('endpoint-select');
  if (!select) return;
  
  const endpoint = select.value;
  
  // Build parameters object
  const params = new URLSearchParams();
  const paramInputs = document.querySelectorAll('.endpoint-param');
  
  paramInputs.forEach(input => {
    if (input.value) {
      const paramName = input.id.replace('param-', '');
      if (paramName !== 'id') {
        params.append(paramName, input.value);
      }
    }
  });
  
  // Build API path
  let path = '';
  switch (endpoint) {
    case 'movies':
      path = '/api/movies';
      break;
    case 'movies-id':
      const movieId = document.getElementById('param-id')?.value;
      if (!movieId) {
        showErrorResponse('Movie ID is required');
        return;
      }
      path = `/api/movies/${movieId}`;
      break;
    case 'persons':
      path = '/api/persons';
      break;
    case 'persons-id':
      const personId = document.getElementById('param-id')?.value;
      if (!personId) {
        showErrorResponse('Person ID is required');
        return;
      }
      path = `/api/persons/${personId}`;
      break;
    case 'producers':
      path = '/api/producers';
      break;
    case 'producers-id':
      const producerId = document.getElementById('param-id')?.value;
      if (!producerId) {
        showErrorResponse('Producer ID is required');
        return;
      }
      path = `/api/producers/${producerId}`;
      break;
    case 'search':
      const query = document.getElementById('param-q')?.value;
      if (!query) {
        showErrorResponse('Search query is required');
        return;
      }
      path = '/api/search';
      break;
  }
  
  // Process the API request
  const response = api.processAPIRequest(path, params);
  displayResponse(response);
}

function displayResponse(response) {
  const statusEl = document.getElementById('response-status');
  const bodyEl = document.getElementById('response-body');
  
  if (!statusEl || !bodyEl || !api) return;
  
  // Update status
  statusEl.className = `status ${response.status === 200 ? 'status--success' : 'status--error'}`;
  statusEl.textContent = `${response.status} ${response.status === 200 ? 'OK' : 'Error'}`;
  
  // Format and display JSON
  const formattedJSON = api.formatJSON(response);
  bodyEl.innerHTML = api.syntaxHighlight(formattedJSON);
}

function showErrorResponse(message) {
  if (!api) return;
  const response = api.createErrorResponse(400, message);
  displayResponse(response);
}

function copyRequestUrl() {
  const urlDisplay = document.getElementById('request-url-display');
  if (!urlDisplay) return;
  
  const url = urlDisplay.textContent;
  navigator.clipboard.writeText(url).then(() => {
    showNotification('Request URL copied to clipboard!');
  }).catch(() => {
    showNotification('Failed to copy URL');
  });
}

function showDataType(type) {
  if (!api) return;
  api.showDataType(type);
}

function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--color-success);
    color: var(--color-btn-primary-text);
    padding: var(--space-12) var(--space-16);
    border-radius: var(--radius-base);
    box-shadow: var(--shadow-lg);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);