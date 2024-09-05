const apiKey = '320f370fcd76406caa6200839240509';

const searchForm = document.getElementById('searchForm');
const locationdata = document.getElementById('locationdata');
const showWeather = document.getElementById('showWeather');
const recentCitiesDropdown = document.getElementById('recentCitiesDropdown');
const forecastdiv = document.getElementById('forecastdiv');

// Function to fetch current weather data
async function fetchWeather(city) {
    try {
        const response = await fetch(`http://api.weatherapi.com/v1/current.json?q=${city}&key=${apiKey}&aqi=no`);
        if (!response.ok) {
            throw new Error('Weather data not available. Please check your location and try again.');
        }
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message);
        }
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        return null;
    }
}

// Function to fetch 5-day forecast data
async function fetchExtendedForecast(city) {
    try {
        const response = await fetch(`http://api.weatherapi.com/v1/forecast.json?q=${city}&key=${apiKey}&days=5&aqi=no`);
        if (!response.ok) {
            throw new Error('Extended forecast data not available. Please check your location and try again.');
        }
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message);
        }
        return data;
    } catch (error) {
        console.error('Error fetching extended forecast data:', error.message);
        return null;
    }
}

// Function to update current weather UI
function updateWeatherUI(weatherData) {
    if (!weatherData) {
        showWeather.innerHTML = '<p class="text-red-500">Weather data not available. Please try again.</p>';
        return;
    }

    const { current } = weatherData;
    showWeather.innerHTML = `
        <div class="mb-4">
            <h2 class="text-2xl font-bold">${current.condition.text}</h2>
            <img src="${current.condition.icon}" alt="${current.condition.text}" class="inline-block">
        </div>
        <div>
            <p>Temperature: ${current.temp_c} °C</p>
            <p>Humidity: ${current.humidity} %</p>
            <p>Wind Speed: ${current.wind_kph} km/h</p>
        </div>
    `;
}

// Function to update 5-day forecast UI
function updateExtendedForecastUI(forecastData) {
    if (!forecastData) {
        forecastdiv.innerHTML = '<p class="text-red-500">Data is not available. Try again.</p>';
        return;
    }

    const { forecast } = forecastData;
    forecastdiv.innerHTML = '';

    forecast.forecastday.forEach(day => {
        const date = new Date(day.date).toDateString();
        const icon = day.day.condition.icon;
        const temp = day.day.avgtemp_c;
        const wind = day.day.maxwind_kph;
        const humidity = day.day.avghumidity;

        const forecastCard = `
            <div class="bg-white rounded-lg shadow-lg p-4 text-center">
                <h3 class="font-bold text-lg">${date}</h3>
                <img src="${icon}" alt="Weather Icon" class="w-16 h-16 mx-auto">
                <p>Temp: ${temp} °C</p>
                <p>Wind: ${wind} km/h</p>
                <p>Humidity: ${humidity} %</p>
            </div>
        `;
        forecastdiv.innerHTML += forecastCard;
    });
}

// Event listener for form submission
searchForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const city = locationdata.value.trim();
    if (city) {
        const weatherData = await fetchWeather(city);
        const extendedForecastData = await fetchExtendedForecast(city);

        if (weatherData && extendedForecastData) {
            updateWeatherUI(weatherData);
            updateExtendedForecastUI(extendedForecastData);

            // Add city to recent cities
            let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
            recentCities = recentCities.filter(recentCity => recentCity !== city);
            recentCities.unshift(city);
            localStorage.setItem('recentCities', JSON.stringify(recentCities));

            updateRecentCitiesDropdown(recentCities);
        } else {
            showWeather.innerHTML = '<p class="text-red-500">Error fetching weather data. Please try again later.</p>';
        }
    } else {
        showWeather.innerHTML = '<p class="text-red-500">Please enter a city name.</p>';
    }
});

// Function to update recent cities dropdown
function updateRecentCitiesDropdown(cities) {
    recentCitiesDropdown.innerHTML = '<option value="">Select a city</option>';
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        recentCitiesDropdown.appendChild(option);
    });
}

// Load cities from local storage
document.addEventListener('DOMContentLoaded', function() {
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    updateRecentCitiesDropdown(recentCities);
});

// Event listener for dropdown change
recentCitiesDropdown.addEventListener('change', async function() {
    const city = recentCitiesDropdown.value;
    if (city) {
        const weatherData = await fetchWeather(city);
        const extendedForecastData = await fetchExtendedForecast(city);

        if (weatherData && extendedForecastData) {
            updateWeatherUI(weatherData);
            updateExtendedForecastUI(extendedForecastData);
        } else {
            showWeather.innerHTML = '<p class="text-red-500">Error fetching weather data. Please try again later.</p>';
        }
    }
});

// Function to fetch weather data based on geolocation
async function fetchWeatherByGeolocation(latitude, longitude) {
    try {
        const response = await fetch(`http://api.weatherapi.com/v1/current.json?q=${latitude},${longitude}&key=${apiKey}&aqi=no`);
        if (!response.ok) {
            throw new Error('Weather data not available. Please check your location and try again.');
        }
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message);
        }
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        return null;
    }
}

// Function to get current location coordinates
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const weatherData = await fetchWeatherByGeolocation(latitude, longitude);
            const extendedForecastData = await fetchExtendedForecast(`${latitude},${longitude}`);

            if (weatherData && extendedForecastData) {
                updateWeatherUI(weatherData);
                updateExtendedForecastUI(extendedForecastData);

                // Add current location to recent cities
                const currentLocation = 'Current Location';
                let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
                recentCities = recentCities.filter(recentCity => recentCity !== currentLocation);
                recentCities.unshift(currentLocation);
                localStorage.setItem('recentCities', JSON.stringify(recentCities));

                updateRecentCitiesDropdown(recentCities);
            } else {
                showWeather.innerHTML = '<p class="text-red-500">Error fetching weather data or extended forecast. Please try again later.</p>';
            }
        }, function(error) {
            console.error('Error getting location:', error.message);
            showWeather.innerHTML = '<p class="text-red-500">Geolocation permission denied. Please enter city name manually.</p>';
        });
    } else {
        showWeather.innerHTML = '<p class="text-red-500">Geolocation is not supported by your browser. Please enter a city name manually.</p>';
    }
}

const currentLocationBtn = document.getElementById('currentLocationBtn');

currentLocationBtn.addEventListener('click', function() {
    getCurrentLocation();
});
