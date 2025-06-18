// DOM Elements
console.log('Initializing DOM elements');
const cityInput = document.getElementById('city-input');
console.log('City input element:', cityInput);
const searchBtn = document.getElementById('search-btn');
console.log('Search button element:', searchBtn);
const celsiusBtn = document.getElementById('celsius-btn');
const fahrenheitBtn = document.getElementById('fahrenheit-btn');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const weatherContainer = document.getElementById('weather-container');

// Weather display elements
const locationName = document.getElementById('location-name');
const coordinates = document.getElementById('coordinates');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const feelsLike = document.getElementById('feels-like');
const weatherCondition = document.getElementById('weather-condition');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const pressure = document.getElementById('pressure');
const cloudiness = document.getElementById('cloudiness');
const precipitation = document.getElementById('precipitation');

// App state
let currentUnit = 'celsius';
let lastSearchedCity = null;
let lastSearchedLat = null;
let lastSearchedLon = null;
let lastSearchedName = null;
let lastWeatherData = null;

// Event Listeners
console.log('Setting up event listeners');
console.log('Search button:', searchBtn);

// Simplify the search button click handler
if (searchBtn) {
    console.log('Adding click event listener to search button');
    searchBtn.addEventListener('click', function() {
        console.log('Search button clicked');
        handleSearch();
    });
} else {
    console.error('Search button not found in the DOM');
}

// Add a direct click handler to the search icon as well
const searchIcon = document.querySelector('#search-btn i');
if (searchIcon) {
    console.log('Adding click event listener to search icon');
    searchIcon.addEventListener('click', function(e) {
        console.log('Search icon clicked');
        e.stopPropagation(); // Prevent event bubbling
        handleSearch();
    });
}

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        console.log('Enter key pressed in city input');
        handleSearch();
    }
});

// We're removing the event listener that clears the input field when clicked
// as it was causing issues with the search functionality

celsiusBtn.addEventListener('click', () => {
    if (currentUnit !== 'celsius') {
        currentUnit = 'celsius';
        updateUnitButtons();
        // We don't need to call displayWeatherData here
        // as updateUnitButtons will fetch new data with the correct unit
    }
});

fahrenheitBtn.addEventListener('click', () => {
    if (currentUnit !== 'fahrenheit') {
        currentUnit = 'fahrenheit';
        updateUnitButtons();
        // We don't need to call displayWeatherData here
        // as updateUnitButtons will fetch new data with the correct unit
    }
});

// Functions
function handleSearch() {
    console.log('handleSearch called');
    const city = cityInput.value.trim();
    console.log('City input value:', city);
    
    if (!city) {
        console.log('No city entered, showing error');
        showError('Please enter a city name');
        return;
    }
    
    console.log('Setting lastSearchedCity to:', city);
    lastSearchedCity = city;
    
    // Show loading indicator before fetching data
    showLoading();
    console.log('Loading indicator shown');
    
    // Call fetchWeatherData with a slight delay to ensure UI updates
    setTimeout(() => {
        console.log('Calling fetchWeatherData after timeout');
        fetchWeatherData(city);
    }, 100);
}

async function fetchWeatherData(city, selectedLat, selectedLon, selectedName) {
    console.log('fetchWeatherData called for city:', city);
    console.log('With coordinates:', selectedLat, selectedLon);
    console.log('With selected name:', selectedName);
    
    // Make sure loading indicator is shown
    showLoading();
    console.log('Loading indicator shown in fetchWeatherData');
    
        try {
            let lat, lon, displayName;
            
            // If coordinates are provided directly, use them
            if (selectedLat && selectedLon) {
                console.log('Using provided coordinates:', selectedLat, selectedLon);
                lat = selectedLat;
                lon = selectedLon;
                displayName = selectedName || city;
                
                // Store these values for unit toggle
                lastSearchedLat = lat;
                lastSearchedLon = lon;
                lastSearchedName = displayName;
            } else {
                console.log('Geocoding city name:', city);
                // First, geocode the city name using Nominatim API
                const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=5`;
                console.log('Geocode URL:', geocodeUrl);
                
                console.log('About to fetch geocode data...');
            
                try {
                    console.log('Sending geocode request...');
                    
                    // Add a try-catch block specifically for the fetch operation
                    let geocodeResponse;
                    try {
                        geocodeResponse = await fetch(geocodeUrl, {
                            headers: {
                                'User-Agent': 'WeatherApp/1.0'
                            },
                            mode: 'cors' // Explicitly set CORS mode
                        });
                        console.log('Fetch operation completed successfully');
                    } catch (fetchError) {
                        console.error('Error during fetch operation:', fetchError);
                        throw new Error(`Network error: ${fetchError.message}`);
                    }
                    
                    console.log('Geocode response received');
                    console.log('Geocode response status:', geocodeResponse.status);
                
                if (!geocodeResponse.ok) {
                    throw new Error(`Failed to geocode city: ${geocodeResponse.status} ${geocodeResponse.statusText}`);
                }
                
                const geocodeData = await geocodeResponse.json();
                console.log('Geocode data received:', geocodeData);
                
                if (!geocodeData.length) {
                    throw new Error(`Could not find coordinates for city: ${city}`);
                }
                
                // If multiple results, show selection dialog
                if (geocodeData.length > 1) {
                    console.log('Multiple locations found, showing selection dialog');
                    showCitySelectionDialog(geocodeData, city);
                    return;
                }
                
                lat = parseFloat(geocodeData[0].lat);
                lon = parseFloat(geocodeData[0].lon);
                displayName = geocodeData[0].display_name.split(',')[0];
                console.log('Using coordinates:', lat, lon, 'for', displayName);
            } catch (geocodeError) {
                console.error('Error during geocoding:', geocodeError);
                throw geocodeError;
            }
        }
        
        // Now fetch weather data from Open-Meteo API
        const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast');
        weatherUrl.searchParams.append('latitude', lat);
        weatherUrl.searchParams.append('longitude', lon);
        weatherUrl.searchParams.append('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,cloud_cover');
        weatherUrl.searchParams.append('timezone', 'auto');
        
        // Always set the temperature unit parameter based on the current unit
        weatherUrl.searchParams.append('temperature_unit', currentUnit === 'fahrenheit' ? 'fahrenheit' : 'celsius');
        
        // Add a cache-busting parameter to ensure we get a fresh response
        weatherUrl.searchParams.append('cache_buster', new Date().getTime());
        
        console.log('Fetching weather data with URL:', weatherUrl.toString());
        
        const weatherResponse = await fetch(weatherUrl);
        
        if (!weatherResponse.ok) {
            throw new Error('Failed to fetch weather data');
        }
        
        const weatherData = await weatherResponse.json();
        
        // Process and format the weather data
        const formattedData = formatWeatherData(weatherData, displayName, lat, lon);
        lastWeatherData = formattedData;
        
        // Display the weather data
        displayWeatherData(formattedData);
    } catch (error) {
        showError(error.message || 'An error occurred while fetching weather data');
        console.error('Error:', error);
    }
}

function formatWeatherData(data, cityName, lat, lon) {
    console.log('Weather data received:', data); // Debug log to see the API response
    console.log('Current unit:', currentUnit); // Debug log to see the current unit
    
    // Weather code to condition mapping
    const weatherCodes = {
        0: "Clear sky",
        1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Fog", 48: "Depositing rime fog",
        51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
        56: "Light freezing drizzle", 57: "Dense freezing drizzle",
        61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
        66: "Light freezing rain", 67: "Heavy freezing rain",
        71: "Slight snow fall", 73: "Moderate snow fall", 75: "Heavy snow fall",
        77: "Snow grains",
        80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
        85: "Slight snow showers", 86: "Heavy snow showers",
        95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
    };
    
    const current = data.current || {};
    const weatherCode = current.weather_code;
    const weatherDescription = weatherCodes[weatherCode] || "Unknown";
    
    // Convert temperature if needed
    let tempCurrent = current.temperature_2m;
    let tempFeelsLike = current.apparent_temperature;
    
    // If API returns in Celsius but we want Fahrenheit, convert
    if (currentUnit === 'fahrenheit' && data.current_units?.temperature_2m === '°C') {
        tempCurrent = celsiusToFahrenheit(tempCurrent);
        tempFeelsLike = celsiusToFahrenheit(tempFeelsLike);
        console.log('Converting from Celsius to Fahrenheit');
    }
    // If API returns in Fahrenheit but we want Celsius, convert
    else if (currentUnit === 'celsius' && data.current_units?.temperature_2m === '°F') {
        tempCurrent = fahrenheitToCelsius(tempCurrent);
        tempFeelsLike = fahrenheitToCelsius(tempFeelsLike);
        console.log('Converting from Fahrenheit to Celsius');
    }
    
    console.log('Formatted temperature:', tempCurrent, currentUnit === 'celsius' ? '°C' : '°F');
    
    return {
        location: {
            name: cityName,
            coordinates: {
                lat: lat,
                lon: lon,
            },
        },
        weather: {
            condition: weatherDescription,
            code: weatherCode,
        },
        temperature: {
            current: tempCurrent,
            feels_like: tempFeelsLike,
            unit: currentUnit === 'celsius' ? '°C' : '°F', // Always use our current unit state
        },
        details: {
            humidity: current.relative_humidity_2m,
            pressure: current.pressure_msl,
            wind_speed: current.wind_speed_10m,
            wind_direction: current.wind_direction_10m,
            cloudiness: current.cloud_cover,
            precipitation: current.precipitation,
        },
        timezone: data.timezone,
        timezone_abbreviation: data.timezone_abbreviation,
    };
}

function displayWeatherData(data) {
    // Update location information
    locationName.textContent = data.location.name;
    coordinates.textContent = `Lat: ${data.location.coordinates.lat.toFixed(2)}, Lon: ${data.location.coordinates.lon.toFixed(2)}`;
    
    // Update weather condition and icon
    weatherCondition.textContent = data.weather.condition;
    updateWeatherIcon(data.weather.code);
    
    // Update temperature information
    temperature.textContent = `${Math.round(data.temperature.current)}${data.temperature.unit}`;
    feelsLike.textContent = `Feels like: ${Math.round(data.temperature.feels_like)}${data.temperature.unit}`;
    
    // Update weather details
    humidity.textContent = `${data.details.humidity}%`;
    pressure.textContent = `${data.details.pressure} hPa`;
    wind.textContent = `${data.details.wind_speed} km/h`;
    cloudiness.textContent = `${data.details.cloudiness}%`;
    precipitation.textContent = `${data.details.precipitation} mm`;
    
    // Update storm map if it's visible
    if (stormMap.classList.contains('active') && data.location.coordinates.lat && data.location.coordinates.lon) {
        updateStormMapLocation(data.location.coordinates.lat, data.location.coordinates.lon);
    }
    
    // Hide welcome container if it exists
    const welcomeContainer = document.getElementById('welcome-container');
    if (welcomeContainer) {
        welcomeContainer.classList.add('hidden');
    }
    
    // Show the weather container
    hideLoading();
    hideError();
    weatherContainer.classList.remove('hidden');
}

function updateWeatherIcon(weatherCode) {
    // Set icon based on weather code
    let iconClass = 'fa-sun'; // Default icon
    
    if (weatherCode === 0) {
        iconClass = 'fa-sun'; // Clear sky
    } else if (weatherCode >= 1 && weatherCode <= 3) {
        iconClass = 'fa-cloud-sun'; // Partly cloudy
    } else if (weatherCode >= 45 && weatherCode <= 48) {
        iconClass = 'fa-smog'; // Fog
    } else if ((weatherCode >= 51 && weatherCode <= 57) || 
               (weatherCode >= 61 && weatherCode <= 67) || 
               (weatherCode >= 80 && weatherCode <= 82)) {
        iconClass = 'fa-cloud-rain'; // Rain
    } else if ((weatherCode >= 71 && weatherCode <= 77) || 
               (weatherCode >= 85 && weatherCode <= 86)) {
        iconClass = 'fa-snowflake'; // Snow
    } else if (weatherCode >= 95 && weatherCode <= 99) {
        iconClass = 'fa-bolt'; // Thunderstorm
    }
    
    // Remove all existing classes except 'fas'
    weatherIcon.className = 'fas';
    // Add the new icon class
    weatherIcon.classList.add(iconClass);
}

function updateUnitButtons() {
    console.log('updateUnitButtons called, changing to:', currentUnit);
    console.log('Last searched city:', lastSearchedCity);
    console.log('Last searched coordinates:', lastSearchedLat, lastSearchedLon);
    
    if (currentUnit === 'celsius') {
        celsiusBtn.classList.add('active');
        fahrenheitBtn.classList.remove('active');
    } else {
        celsiusBtn.classList.remove('active');
        fahrenheitBtn.classList.add('active');
    }
    
    // If we have a last searched city with coordinates, fetch the data again with the new unit
    if (lastSearchedCity && lastSearchedLat && lastSearchedLon) {
        console.log('Fetching weather data again with new unit:', currentUnit);
        // Show loading indicator
        showLoading();
        fetchWeatherData(lastSearchedCity, lastSearchedLat, lastSearchedLon, lastSearchedName);
    } else {
        console.log('Missing last searched city or coordinates, cannot fetch weather data');
        // If we have lastWeatherData, manually convert and display
        if (lastWeatherData) {
            console.log('Using lastWeatherData to update display');
            
            // Get the original data from the API response
            const originalData = lastWeatherData.original || lastWeatherData;
            
            // Create a copy of the original data
            const updatedData = JSON.parse(JSON.stringify(originalData));
            
            // Store the original data if not already stored
            if (!updatedData.original) {
                updatedData.original = JSON.parse(JSON.stringify(originalData));
            }
            
            // Update the temperature unit
            updatedData.temperature.unit = currentUnit === 'celsius' ? '°C' : '°F';
            
            // Get the original temperature values
            const originalTemp = originalData.temperature.current;
            const originalFeelsLike = originalData.temperature.feels_like;
            
            // Convert the temperature values based on the original unit
            if (currentUnit === 'fahrenheit') {
                console.log('Converting to Fahrenheit from original:', originalTemp);
                updatedData.temperature.current = celsiusToFahrenheit(originalTemp);
                updatedData.temperature.feels_like = celsiusToFahrenheit(originalFeelsLike);
            } else {
                // If we're switching back to Celsius, use the original values
                console.log('Using original Celsius values:', originalTemp);
                updatedData.temperature.current = originalTemp;
                updatedData.temperature.feels_like = originalFeelsLike;
            }
            
            // Update lastWeatherData with the new values
            lastWeatherData = updatedData;
            
            // Display the updated data
            displayWeatherData(updatedData);
        }
    }
}

function showLoading() {
    weatherContainer.classList.add('hidden');
    errorElement.classList.add('hidden');
    loadingElement.classList.remove('hidden');
}

function hideLoading() {
    loadingElement.classList.add('hidden');
}

function showError(message) {
    weatherContainer.classList.add('hidden');
    loadingElement.classList.add('hidden');
    errorText.textContent = message;
    errorElement.classList.remove('hidden');
}

function hideError() {
    errorElement.classList.add('hidden');
}

// Function to show city selection dialog
function showCitySelectionDialog(cities, searchQuery) {
    console.log('Showing city selection dialog for:', cities.length, 'cities');
    
    // Hide other containers
    const welcomeContainer = document.getElementById('welcome-container');
    if (welcomeContainer) {
        welcomeContainer.classList.add('hidden');
    }
    
    if (weatherContainer) {
        weatherContainer.classList.add('hidden');
    }
    
    loadingElement.classList.add('hidden');
    errorElement.classList.add('hidden');
    
    // Create dialog if it doesn't exist
    let citySelectionDialog = document.getElementById('city-selection-dialog');
    if (!citySelectionDialog) {
        console.log('Creating new city selection dialog');
        citySelectionDialog = document.createElement('div');
        citySelectionDialog.id = 'city-selection-dialog';
        citySelectionDialog.className = 'city-selection-dialog';
        document.querySelector('main').appendChild(citySelectionDialog);
        
        // Add styles for the dialog
        const style = document.createElement('style');
        style.textContent = `
            .city-selection-dialog {
                background-color: white;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                padding: 20px;
                margin: 20px 0;
                z-index: 1000;
                position: relative;
                display: block;
            }
            .city-selection-dialog h3 {
                color: #2c3e50;
                margin-bottom: 15px;
                text-align: center;
            }
            .city-selection-dialog ul {
                list-style: none;
                padding: 0;
            }
            .city-selection-dialog li {
                padding: 10px 15px;
                border-bottom: 1px solid #eee;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            .city-selection-dialog li:hover {
                background-color: #f5f5f5;
            }
            .city-selection-dialog li:last-child {
                border-bottom: none;
            }
            .hidden {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    } else {
        console.log('Using existing city selection dialog');
    }
    
    // Populate dialog
    citySelectionDialog.innerHTML = `
        <h3>Multiple locations found for "${searchQuery}"</h3>
        <p>Please select a specific location:</p>
        <ul>
            ${cities.map((city, index) => `
                <li data-index="${index}">
                    ${city.display_name}
                </li>
            `).join('')}
        </ul>
    `;
    
    // Show dialog
    citySelectionDialog.classList.remove('hidden');
    console.log('Dialog should now be visible');
    
    // Add click event listeners to list items
    const listItems = citySelectionDialog.querySelectorAll('li');
    console.log('Adding click listeners to', listItems.length, 'city options');
    
    listItems.forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.getAttribute('data-index'));
            const selectedCity = cities[index];
            console.log('Selected city:', selectedCity.display_name);
            
            // Hide dialog
            citySelectionDialog.classList.add('hidden');
            
            // Fetch weather for selected city
            fetchWeatherData(
                searchQuery,
                parseFloat(selectedCity.lat),
                parseFloat(selectedCity.lon),
                selectedCity.display_name.split(',')[0]
            );
        });
    });
}

// Temperature conversion functions
function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

function fahrenheitToCelsius(fahrenheit) {
    return (fahrenheit - 32) * 5/9;
}

// Show welcome message on page load instead of loading a default city
window.addEventListener('load', () => showWelcomeMessage());

// Function to show welcome message
function showWelcomeMessage() {
    // Hide loading and error elements
    hideLoading();
    hideError();
    
    // Hide weather container if it's visible
    weatherContainer.classList.add('hidden');
    
    // Hide any city selection dialog if it exists
    const citySelectionDialog = document.getElementById('city-selection-dialog');
    if (citySelectionDialog) {
        citySelectionDialog.classList.add('hidden');
    }
    
    // Hide storm map if it's visible
    const stormMap = document.getElementById('storm-map');
    if (stormMap && stormMap.classList.contains('active')) {
        stormMap.classList.remove('active');
    }
    
    // Create welcome message container if it doesn't exist
    let welcomeContainer = document.getElementById('welcome-container');
    if (!welcomeContainer) {
        welcomeContainer = document.createElement('div');
        welcomeContainer.id = 'welcome-container';
        welcomeContainer.className = 'welcome-container';
        document.querySelector('main').appendChild(welcomeContainer);
        
        // Add styles for the welcome container
        const style = document.createElement('style');
        style.textContent = `
            .welcome-container {
                background-color: white;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                padding: 30px;
                margin: 20px 0;
                text-align: center;
            }
            .welcome-container h2 {
                color: #2c3e50;
                margin-bottom: 15px;
            }
            .welcome-container p {
                color: #7f8c8d;
                margin-bottom: 20px;
                font-size: 16px;
            }
            .welcome-container .search-prompt {
                font-weight: bold;
                color: #3498db;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Populate welcome container
    welcomeContainer.innerHTML = `
        <h2>Welcome to Global Weather App</h2>
        <p>Get accurate weather information for any city in the world.</p>
        <p class="search-prompt">Enter a city name above to get started</p>
    `;
    
    // Show welcome container
    welcomeContainer.classList.remove('hidden');
}

// Storm Map Functionality
const stormMapToggle = document.getElementById('storm-map-toggle');
const stormMap = document.getElementById('storm-map');
const windyIframe = document.getElementById('windy-iframe');

stormMapToggle.addEventListener('click', toggleStormMap);

function toggleStormMap() {
    if (stormMap.classList.contains('active')) {
        // Hide the map
        stormMap.classList.remove('active');
        stormMapToggle.textContent = 'Show Storm Map (Multiple View Options Available)';
    } else {
        // Show the map
        stormMap.classList.add('active');
        stormMapToggle.textContent = 'Hide Storm Map';
        
        // Update iframe location if we have searched for a city
        if (lastSearchedLat && lastSearchedLon) {
            updateStormMapLocation(lastSearchedLat, lastSearchedLon);
        }
        
        // Add a notification about map options - make it more visible
        const mapNotification = document.createElement('div');
        mapNotification.className = 'map-notification';
        mapNotification.innerHTML = '<p><strong>Map Options Available:</strong> Click the menu icon <i class="fas fa-bars"></i> in the bottom right corner of the map to change view options (rain, wind, temperature, etc.)</p>';
        mapNotification.style.cssText = 'background-color: rgba(52, 152, 219, 0.95); color: white; padding: 15px; border-radius: 5px; margin: 0 auto 15px auto; text-align: center; font-size: 16px; max-width: 100%; position: relative; z-index: 1000; box-shadow: 0 4px 8px rgba(0,0,0,0.3); border: 2px solid #2980b9;';
        
        // Add a style for the icon
        const iconStyle = document.createElement('style');
        iconStyle.textContent = `
            .map-notification i {
                margin: 0 5px;
                color: #ffeb3b;
            }
        `;
        document.head.appendChild(iconStyle);
        
        // Remove any existing notification
        const existingNotification = document.querySelector('.map-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Add the notification after the map
        stormMap.after(mapNotification);
        
        // Keep the notification visible (don't auto-hide)
        // Add a close button to the notification
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.style.cssText = 'position: absolute; right: 10px; top: 10px; background: none; border: none; color: white; font-size: 20px; cursor: pointer;';
        closeButton.addEventListener('click', () => {
            mapNotification.remove();
        });
        mapNotification.appendChild(closeButton);
    }
}

function updateStormMapLocation(lat, lon) {
    // Update the iframe src with new coordinates
    const baseUrl = 'https://embed.windy.com/embed2.html';
    const params = `?lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&width=650&height=450&zoom=5&level=surface&overlay=rain&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`;
    
    windyIframe.src = baseUrl + params;
}
