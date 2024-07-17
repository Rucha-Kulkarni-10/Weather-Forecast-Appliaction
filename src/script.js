
const apiKey = 'bcc989e840d74b78949135826241607';

const searchForm = document.getElementById('searchForm');
const locationdata = document.getElementById('locationdata');
const showWeather = document.getElementById('showWeather');
const recentCitiesDropdown = document.getElementById('recentCitiesDropdown');

// Function to fetch weather data 
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

// Function to update weather data
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

// Event listener for form submission
searchForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const city = locationdata.value.trim();
    if (city) {
        const weatherData = await fetchWeather(city);
        if (weatherData) {
            updateWeatherUI(weatherData);
            
            // Add city 
            let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
            recentCities = recentCities.filter(recentCity => recentCity !== city);
            recentCities.unshift(city);
            localStorage.setItem('recentCities', JSON.stringify(recentCities));

            
            updateRecentCitiesDropdown(recentCities);
        } else {
            showWeather.innerHTML = '<p class="text-red-500">Error fetching weather data. Please try again later.</p>';
        }
    } else {
        // for empty city input
        showWeather.innerHTML = '<p class="text-red-500">Please enter a city name.</p>';
    }
});

// Function to searched cities dropdown
function updateRecentCitiesDropdown(cities) {
    recentCitiesDropdown.innerHTML = '<option value="">Select a city</option>';
    cities.forEach(city => {
        const option = document.createElement('option');
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
        if (weatherData) {
            updateWeatherUI(weatherData);
        } else {
            showWeather.innerHTML = '<p class="text-red-500">Error fetching weather data. Please try again later.</p>';
        }
    }
});
