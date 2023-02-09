async function getLatLong(city) {
  const latLonArray = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=45e75944bb8affc837985a8360bb4a02`, { mode: 'cors' })
    .then((response) => response.json())
    .then((response) => [response[0].lat, response[0].lon]);
  return latLonArray;
}

async function getCurrentWeatherData(city) {
  const latLon = await getLatLong(city);
  const currentWeather = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latLon[0]}&lon=${latLon[1]}&appid=45e75944bb8affc837985a8360bb4a02&units=imperial`, { mode: 'cors' })
    .then((response) => response.json())
    .then((currentData) => ({
      temp: currentData.main.temp,
      feelsLike: currentData.main.feels_like,
      description: currentData.weather[0].description,
      iconCode: currentData.weather[0].icon,
      windSpeed: currentData.wind.speed,
      windDirection: currentData.wind.deg,
      city: currentData.name,
    }));
  return currentWeather;
}

async function getFiveDayForecastData(city) {
  const latLon = await getLatLong(city);
  const forecastArray = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latLon[0]}&lon=${latLon[1]}&appid=45e75944bb8affc837985a8360bb4a02&units=imperial`, { mode: 'cors' })
    .then((response) => response.json())
    .then((data) => [data.list, data.city]);
  const dataArray = [];
  for (let i = 0; i < forecastArray[0].length; i += 1) {
    const currentUnixDateTimeMilliseconds = forecastArray[0][i].dt * 1000;
    const timezone = forecastArray[1].timezone * 1000;
    const userTimeZoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
    const localDateTime = new Date(currentUnixDateTimeMilliseconds + timezone + userTimeZoneOffset)
      .toString()
      .substring(0, 24);
    dataArray.push({
      localDateTimeString: localDateTime,
      temp: forecastArray[0][i].main.temp,
      feelsLike: forecastArray[0][i].main.feels_like,
      probabilityOfPrecip: forecastArray[0][i].pop,
      description: forecastArray[0][i].weather[0].description,
      iconCode: forecastArray[0][i].weather[0].icon,
    });
  }
  return dataArray;
}

// display weather data on submitting city
const searchForm = document.querySelector('.search-form');
const forecastContainer = document.querySelector('.five-day-forecast');

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const searchValue = document.getElementById('search').value;
  const currentWeather = await getCurrentWeatherData(searchValue);
  const forecast = await getFiveDayForecastData(searchValue);

  // set header to the name of the city
  document.querySelector('.city-name-header').textContent = currentWeather.city;

  // add info to current weather section
  let canonicalDirection = '';
  const directionDegrees = currentWeather.windDirection;
  document.querySelector('.temperature').textContent = `${Math.round(currentWeather.temp)} °F`;
  document.querySelector('.feels-like').textContent = `Feels Like: ${Math.round(currentWeather.feelsLike)} °F`;

  if (directionDegrees > 337.5 || directionDegrees <= 22.5) {
    canonicalDirection = 'N';
  } else if (directionDegrees > 22.5 && directionDegrees <= 67.5) {
    canonicalDirection = 'NE';
  } else if (directionDegrees > 67.5 && directionDegrees <= 112.5) {
    canonicalDirection = 'E';
  } else if (directionDegrees > 112.5 && directionDegrees <= 157.5) {
    canonicalDirection = 'SE';
  } else if (directionDegrees > 157.5 && directionDegrees <= 202.5) {
    canonicalDirection = 'S';
  } else if (directionDegrees > 202.5 && directionDegrees <= 247.5) {
    canonicalDirection = 'SW';
  } else if (directionDegrees > 247.5 && directionDegrees <= 292.5) {
    canonicalDirection = 'W';
  } else if (directionDegrees > 292.5 && directionDegrees <= 337.5) {
    canonicalDirection = 'NW';
  } else {
    canonicalDirection = '';
  }

  document.querySelector('.wind').textContent = `Wind: ${currentWeather.windSpeed} mph ${canonicalDirection}`;
  document.querySelector('.description').textContent = currentWeather.description;
  document.getElementById('current-description-image').src = `./Icons/${currentWeather.iconCode}.png`;

  // display hourly forecast
  forecastContainer.innerHTML = '';
  for (let i = 0; i < forecast.length; i += 1) {
    const hourlyDataContainer = document.createElement('div');
    hourlyDataContainer.classList.add('hourly-data');

    const weekday = document.createElement('p');
    weekday.classList.add('weekday');
    weekday.textContent = forecast[i].localDateTimeString;

    const hourlyTemp = document.createElement('p');
    hourlyTemp.classList.add('hourly-temperature');
    hourlyTemp.textContent = forecast[i].temp;

    const hourlyFeelsLike = document.createElement('p');
    hourlyFeelsLike.classList.add('hourly-feels-like');
    hourlyFeelsLike.textContent = forecast[i].feelsLike;

    const precipProb = document.createElement('p');
    precipProb.classList.add('hourly-preciptation-chance');
    precipProb.textContent = forecast[i].probabilityOfPrecip;

    const hourlyDescription = document.createElement('p');
    hourlyDescription.classList.add('hourly-description');
    hourlyDescription.textContent = forecast[i].description;

    const hourlyImage = document.createElement('img');
    hourlyImage.src = `./Icons/${forecast[i].iconCode}.png`;

    hourlyDataContainer.appendChild(weekday);
    hourlyDataContainer.appendChild(hourlyTemp);
    hourlyDataContainer.appendChild(hourlyFeelsLike);
    hourlyDataContainer.appendChild(precipProb);
    hourlyDataContainer.appendChild(hourlyDescription);
    hourlyDataContainer.appendChild(hourlyImage);
    forecastContainer.appendChild(hourlyDataContainer);
  }
});

// Remove error messsage when search input is changed
const searchInput = document.getElementById('search');
searchInput.addEventListener('change', () => {
  document.querySelector('.error').style.display = 'none';
});
