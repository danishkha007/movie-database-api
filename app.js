// Movie Database API - External JSON File Loading Implementation
class MovieDatabaseAPI {
  constructor() {
    this.data = {
      movies: [],
      persons: [],
      producers: []
    };
    
    this.baseUrl = window.location.origin + window.location.pathname;
    this.isLoaded = false;
    this.loadingStatus = {
      movies: { loaded: false, error: null, size: 0 },
      persons: { loaded: false, error: null, size: 0 },
      producers: { loaded: false, error: null, size: 0 }
    };

    // JSON file URLs - in production, these would be local files
    this.dataUrls = {
      movies: 'https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/7757db19138720f1c78c5dcb8e9ed462/0d631b51-b500-4c24-b952-f7d3937b0a8a/d3349aab.json',
      persons: 'https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/7757db19138720f1c78c5dcb8e9ed462/0d631b51-b500-4c24-b952-f7d3937b0a8a/e4d77fb8.json',
      producers: 'https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/7757db19138720f1c78c5dcb8e9ed462/0d631b51-b500-4c24-b952-f7d3937b0a8a/cf115861.json'
    };
  }

  async init() {
    try {
      // Show loading screen and start loading process
      this.showLoadingScreen();
      await this.loadAllDataWithDelay();
      this.initializeApp();
    } catch (error) {
      console.error('Failed to initialize API:', error);
      this.showLoadingError('Failed to initialize the application');
    }
  }

  showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const mainApp = document.getElementById('main-app');
    
    if (loadingScreen && mainApp) {
      loadingScreen.style.display = 'flex';
      mainApp.classList.add('hidden');
    }
  }

  async loadAllDataWithDelay() {
    // Add artificial delay to show loading process
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const loadingPromises = [
      this.loadDataFileWithDelay('movies', 800),
      this.loadDataFileWithDelay('persons', 1200),
      this.loadDataFileWithDelay('producers', 1600)
    ];

    // Load all files with staggered timing
    const results = await Promise.allSettled(loadingPromises);
    
    // Check if at least one file loaded successfully
    const successCount = results.filter(result => result.status === 'fulfilled').length;
    if (successCount === 0) {
      throw new Error('All data files failed to load');
    }

    // Wait a moment to show completed state
    await new Promise(resolve => setTimeout(resolve, 800));
    
    this.isLoaded = true;
    this.hideLoadingScreen();
  }

  async loadDataFileWithDelay(type, delay) {
    // Add delay to stagger the loading visualization
    await new Promise(resolve => setTimeout(resolve, delay));
    return this.loadDataFile(type);
  }

  async loadDataFile(type) {
    try {
      this.updateFileStatus(type, 'loading', 'Loading...');
      
      const response = await fetch(this.dataUrls[type]);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate that data is an array
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format - expected an array');
      }

      this.data[type] = data;
      this.loadingStatus[type] = { 
        loaded: true, 
        error: null, 
        size: this.calculateDataSize(data)
      };
      
      this.updateFileStatus(type, 'success', `Loaded ${data.length} records`);
      this.updateAppDataStats(type, data.length, this.loadingStatus[type].size);
      
      return data;
    } catch (error) {
      this.loadingStatus[type] = { 
        loaded: false, 
        error: error.message,
        size: 0
      };
      
      this.updateFileStatus(type, 'error', `Error: ${error.message}`);
      throw error;
    }
  }

  calculateDataSize(data) {
    const jsonString = JSON.stringify(data);
    const sizeInBytes = new Blob([jsonString]).size;
    return Math.round(sizeInBytes / 1024); // Return size in KB
  }

  updateFileStatus(type, status, text) {
    const dotElement = document.getElementById(`${type}-dot`);
    const textElement = document.getElementById(`${type}-text`);
    
    if (dotElement) {
      dotElement.className = `status-dot status-dot--${status}`;
    }
    
    if (textElement) {
      textElement.textContent = text;
    }
  }

  updateAppDataStats(type, count, size) {
    const countElement = document.getElementById(`${type}-count`);
    const sizeElement = document.getElementById(`${type}-size`);
    const dotElement = document.getElementById(`app-${type}-dot`);
    
    if (countElement) countElement.textContent = count;
    if (sizeElement) sizeElement.textContent = `${size} KB`;
    if (dotElement) dotElement.className = 'status-dot status-dot--success';
  }

  showLoadingError(message) {
    const errorElement = document.getElementById('loading-error');
    const messageElement = document.getElementById('error-message');
    const spinnerElement = document.querySelector('.loading-spinner');
    
    if (errorElement) errorElement.classList.remove('hidden');
    if (messageElement) messageElement.textContent = message;
    if (spinnerElement) spinnerElement.style.display = 'none';
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const mainApp = document.getElementById('main-app');
    
    if (loadingScreen && mainApp) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
        mainApp.classList.remove('hidden');
        this.updateFilesLoadedCount();
      }, 500);
    }
  }

  updateFilesLoadedCount() {
    const loadedCount = Object.values(this.loadingStatus).filter(status => status.loaded).length;
    const totalCount = Object.keys(this.loadingStatus).length;
    
    const countElement = document.getElementById('files-loaded-count');
    if (countElement) {
      countElement.textContent = `${loadedCount}/${totalCount}`;
    }
  }

  initializeApp() {
    this.updateBaseUrl();
    this.setupRouting();
    this.setupEventListeners();
    // Initialize the UI after DOM is ready
    setTimeout(() => {
      if (window.updateEndpointForm) {
        window.updateEndpointForm();
      }
      this.showDataType('movies');
    }, 200);
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
        if (window.updateRequestUrl) {
          window.updateRequestUrl();
        }
      }
    });

    // Handle input changes for real-time URL updates
    document.addEventListener('input', (e) => {
      if (e.target.matches('.endpoint-param')) {
        if (window.updateRequestUrl) {
          window.updateRequestUrl();
        }
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
    if (!this.isLoaded) {
      return this.createErrorResponse(503, 'Data is still loading. Please wait.');
    }

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
        movie.genres && movie.genres.some(g => g.toLowerCase().includes(genre.toLowerCase()))
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
        (movie.overview && movie.overview.toLowerCase().includes(searchTerm)) ||
        (movie.genres && movie.genres.some(genre => genre.toLowerCase().includes(searchTerm)))
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
        (producer.origin_country && producer.origin_country.toLowerCase().includes(searchTerm))
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
    if (!this.isLoaded || !this.data[type]) {
      console.warn(`Data type ${type} not loaded yet`);
      return;
    }

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
                <img src="${item.poster_url || ''}" alt="${item.title}" class="data-card-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="data-card-image" style="display:none;">🎬</div>
                <div>
                  <h4 class="data-card-title">${item.title}</h4>
                  <p class="data-card-subtitle">ID: ${item.id} | ${item.release_date || 'Unknown'}</p>
                </div>
              </div>
              <div class="data-card-content">
                <p>${(item.overview || 'No description available').substring(0, 150)}${(item.overview || '').length > 150 ? '...' : ''}</p>
                <div class="data-card-meta">
                  ${(item.genres || []).map(genre => `<span class="data-tag">${genre}</span>`).join('')}
                </div>
              </div>
            </div>
          `;
          break;
        case 'persons':
          cardHTML = `
            <div class="data-card">
              <div class="data-card-header">
                <img src="${item.profile_url || ''}" alt="${item.name}" class="data-card-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="data-card-image" style="display:none;">👤</div>
                <div>
                  <h4 class="data-card-title">${item.name}</h4>
                  <p class="data-card-subtitle">ID: ${item.id}</p>
                </div>
              </div>
              <div class="data-card-content">
                <p><strong>Acting Roles:</strong> ${(item.roles || []).length}</p>
                <p><strong>Crew Roles:</strong> ${(item.crew_roles || []).length}</p>
                ${(item.crew_roles || []).length > 0 ? `<p><strong>Departments:</strong> ${[...new Set((item.crew_roles || []).map(role => role.department))].join(', ')}</p>` : ''}
              </div>
            </div>
          `;
          break;
        case 'producers':
          cardHTML = `
            <div class="data-card">
              <div class="data-card-header">
                <img src="${item.logo_url || ''}" alt="${item.name}" class="data-card-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="data-card-image" style="display:none;">🏢</div>
                <div>
                  <h4 class="data-card-title">${item.name}</h4>
                  <p class="data-card-subtitle">ID: ${item.id}</p>
                </div>
              </div>
              <div class="data-card-content">
                <p><strong>Origin Country:</strong> ${item.origin_country || 'Unknown'}</p>
                <div class="data-card-meta">
                  <span class="data-tag">${item.origin_country || 'Unknown'}</span>
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

// Retry loading function
async function retryLoading() {
  const errorElement = document.getElementById('loading-error');
  const spinnerElement = document.querySelector('.loading-spinner');
  
  if (errorElement) errorElement.classList.add('hidden');
  if (spinnerElement) spinnerElement.style.display = 'flex';
  
  // Reset loading status
  api.isLoaded = false;
  api.loadingStatus = {
    movies: { loaded: false, error: null, size: 0 },
    persons: { loaded: false, error: null, size: 0 },
    producers: { loaded: false, error: null, size: 0 }
  };
  
  try {
    await api.loadAllDataWithDelay();
    api.initializeApp();
  } catch (error) {
    console.error('Retry failed:', error);
    api.showLoadingError('Retry failed. Please check the console for details.');
  }
}

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
  if (!api || !api.isLoaded) {
    showErrorResponse('Data is still loading or failed to load. Please wait or try reloading the page.');
    return;
  }
  
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