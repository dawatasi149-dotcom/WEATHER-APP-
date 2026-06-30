const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

async function geocodeCity(city) {
  const url = `${GEOCODE_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`No location found for "${city}"`);
  }
  const { latitude, longitude, name, country } = data.results[0];
  return { latitude, longitude, name, country };
}

async function fetchForecast(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m',
    daily: 'temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
  });
  const url = `${FORECAST_URL}?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Forecast request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function getWeather(city) {
  try {
    const location = await geocodeCity(city);
    const data = await fetchForecast(location.latitude, location.longitude);
    console.log(data);
    renderWeather(location, data);
  } catch (error) {
    console.error('Weather fetch failed:', error);
  }
}

function renderWeather(location, data) {
  const current = data.current;
  const todayMax = data.daily.temperature_2m_max[0];
  const todayMin = data.daily.temperature_2m_min[0];

  document.getElementById('name').textContent = location.name;
  document.getElementById('place').textContent = location.country || '';
  document.getElementById('cel').innerHTML = `${Math.round(current.temperature_2m)}<sup>&deg;</sup>c`;
  document.getElementById('feel').textContent = `${Math.round(current.apparent_temperature)}\u00B0c`;
  document.getElementById('percent').textContent = `${current.relative_humidity_2m}%`;
  document.getElementById('speed').textContent = `${current.wind_speed_10m} km/h`;
  document.getElementById('up').innerHTML = `<i class="fa-solid fa-arrow-up-long"></i>${Math.round(todayMax)}\u00B0`;
  document.getElementById('down').innerHTML = `<i class="fa-solid fa-arrow-down-long"></i>${Math.round(todayMin)}\u00B0`;
}

// Search box: press Enter to fetch a new city
const searchInput = document.getElementById('search');
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && searchInput.value.trim()) {
    getWeather(searchInput.value.trim());
  }
});

// Search icon click does the same thing
document.getElementById('iglass').addEventListener('click', () => {
  if (searchInput.value.trim()) {
    getWeather(searchInput.value.trim());
  }
});

// Initial load
getWeather('Seattle');