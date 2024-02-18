function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage(key) {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : null;
}

document.addEventListener('DOMContentLoaded', () => {
    localStorage.clear();

    const storedWeatherData = getFromLocalStorage('weatherData');
    let searchHistory = getFromLocalStorage('searchHistory') || [];
    const card = document.querySelector('.card');

    if (storedWeatherData) {
        displayInfo(storedWeatherData);
        displayWeekInfo(storedWeatherData);
    }
    displaySearchHistory(searchHistory);

    const searchForm = document.querySelector('.searchBar');
    const cityLookup = document.querySelector('.search-window-text');
    const card2 = document.querySelector('.wkForecast');

    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const city = cityLookup.value;

        if (city) {
            try {
                const weatherInfoData = await weatherInfo(city);
                saveToLocalStorage('weatherData', weatherInfoData);

                searchHistory.push(city);
                saveToLocalStorage('searchHistory', searchHistory);
                displaySearchHistory(searchHistory);

                displayInfo(weatherInfoData);
                displayWeekInfo(weatherInfoData);
            } catch (error) {
                console.error(error.message);
                disError('Failed to fetch weather data. Try again.');
            }
        } else {
            console.error('City not provided');
            disError('Please enter a city name.');
        }
    });  

    async function weatherInfo(city) {
        const apiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=us&include=current&key=5XEXQNCJL9JRZALE8Q4WTJHFA&contentType=json`;
        try {
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error('No data found');
            }

            const weatherData = await response.json();
            return weatherData;
        } catch (error) {
            console.error('Failed to fetch weather data', error);
            throw error;
        }
    }

    function displayInfo(data) {
        const {
            address: city,
            days: [{ 
                datetime: todaysDate, 
                temp: currentTemp, 
                windspeed: wind, 
                conditions: currentConditions, 
                description: todayForecast }],
        } = data;

        const card = document.querySelector('.card');
        card.textContent = '';
        card.style.display = 'flex';
        const dateToday = document.createElement('h2');
        const cityName = document.createElement('div');
        const tempElement = document.createElement('p');
        const windMph = document.createElement('p');
        const currentCon = document.createElement('p');
        const forecast = document.createElement('p');
        
        dateToday.textContent = todaysDate;
        cityName.textContent = city;
        tempElement.textContent = 'Temp: ' + currentTemp + '° F';
        windMph.textContent = wind + ' mph';
        currentCon.textContent = 'Currently ' + currentConditions;
        forecast.textContent = "Today's forecast: " + todayForecast;

        dateToday.classList.add('text-2xl', 'font-bold', 'mb-2');
        cityName.classList.add('text-3xl', 'font-bold', 'mb-2');
        tempElement.classList.add('text-xl', 'mb-2');
        windMph.classList.add('text-xl', 'mb-2');
        currentCon.classList.add('text-xl', 'mb-2');
        forecast.classList.add('text-xl', 'mb-2');

        card.appendChild(dateToday);
        card.appendChild(cityName);
        card.appendChild(tempElement);
        card.appendChild(windMph);
        card.appendChild(currentCon);
        card.appendChild(forecast);
    }

    function displayWeekInfo(data) {
        const {
            address: city,
            days,
        } = data;

        const card2 = document.querySelector('.wkForecast');
        card2.textContent = '';
        card2.style.display = 'flex';
    
        if (days && days.length >= 7) {
            const today = new Date(); // Current date
    
            for (let i = 0; i < 7; i++) {
                const day = days[i];
                const dateOfForecast = new Date(day.datetime);
    
                // Check if the dateOfForecast is after today
                if (dateOfForecast >= today) {
                    const dateWeek = document.createElement('h3');
                    const tempElement = document.createElement('p');
                    const windMph2 = document.createElement('p');
                    const weekCon = document.createElement('p');
                    const forecastWeek = document.createElement('p');
    
                    dateWeek.textContent = 'Date: ' + day.datetime;
                    tempElement.textContent = 'Temp: ' + day.temp + '° F';
                    windMph2.textContent = 'Wind: ' + day.windspeed + ' mph';
                    forecastWeek.textContent = 'Forecast: ' + day.description;
    
                    dateWeek.classList.add('text-2xl', 'font-bold', 'mb-2');
                    tempElement.classList.add('text-xl', 'mb-2');
                    windMph2.classList.add('text-xl', 'mb-2');
                    weekCon.classList.add('text-xl', 'mb-2');
                    forecastWeek.classList.add('text-xl', 'mb-2');
    
                    card2.appendChild(dateWeek);
                    card2.appendChild(tempElement);
                    card2.appendChild(windMph2);
                    card2.appendChild(weekCon);
                    card2.appendChild(forecastWeek);
                }
            }
        } else {
            const noDataMessage = document.createElement('p');
            noDataMessage.textContent = 'No forecast data available.';
            noDataMessage.classList.add('text-xl', 'font-bold', 'mb-4');
            card2.appendChild(noDataMessage);
        }
    }
    

    function disError(message) {
        const errorDiss = document.createElement('p');
        errorDiss.textContent = message;
        errorDiss.classList.add('errorDiss', 'text-center');
        
        const card = document.querySelector('.card');
        card.textContent = '';
        card.style.display = 'flex';
        card.appendChild(errorDiss);
    }

    function displaySearchHistory(history) {
        const historyList = document.querySelector('.search-history-list');
        historyList.innerHTML = '';

        history.forEach((city) => {
            const historyItem = document.createElement('li');
            historyItem.textContent = city;
            historyList.appendChild(historyItem);
        });
    }function displaySearchHistory(history) {
        const historyList = document.querySelector('.search-history-list');
        historyList.innerHTML = '';
    
        history.forEach((city) => {
            const historyItem = document.createElement('li');
            historyItem.textContent = city;
            historyItem.classList.add('history-item'); // Add a class for styling
    
            historyItem.addEventListener('click', async () => {
                try {
                    const weatherInfoData = await weatherInfo(city);
                    saveToLocalStorage('weatherData', weatherInfoData);
    
                    displayInfo(weatherInfoData);
                    displayWeekInfo(weatherInfoData);
                } catch (error) {
                    console.error(error.message);
                    disError('Failed to fetch weather data. Try again.');
                }
            });
    
            historyList.appendChild(historyItem);
        });
    }
    
});