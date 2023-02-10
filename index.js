function toTwelveHourTime(timeString) {
  const hour = Number(timeString.substring(0, 2));
  if (hour > 0 && hour < 12) {
    return `${hour}AM`;
  } if (hour === 0) {
    return '12AM';
  } if (hour === 12) {
    return '12PM';
  }
  return `${hour - 12}PM`;
}

function capitalizeDescription(str) {
  const arr = str.split(' ');
  const newArr = new Array(arr.length);
  for (let i = 0; i < arr.length; i += 1) {
    newArr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  }
  return newArr.join(' ');
}

async function getLatLong(city) {
  const latLonArray = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=45e75944bb8affc837985a8360bb4a02`, { mode: 'cors' })
    .then((response) => response.json())
    .then((response) => [response[0].lat, response[0].lon])
    .catch((error) => {
      console.log(error);
      document.querySelector('.error').style.display = 'flex';
    });
  return latLonArray;
}

async function getCurrentWeatherData(city) {
  const latLon = await getLatLong(city);
  const currentWeather = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latLon[0]}&lon=${latLon[1]}&appid=45e75944bb8affc837985a8360bb4a02&units=imperial`, { mode: 'cors' })
    .then((response) => response.json())
    .then((currentData) => ({
      temp: currentData.main.temp,
      feelsLike: currentData.main.feels_like,
      description: capitalizeDescription(currentData.weather[0].description),
      iconCode: currentData.weather[0].icon,
      windSpeed: currentData.wind.speed,
      windDirection: currentData.wind.deg,
      city: currentData.name,
    }))
    .catch((error) => {
      console.log(error);
      document.querySelector('.error').style.display = 'flex';
    });
  return currentWeather;
}

async function getFiveDayForecastData(city) {
  const latLon = await getLatLong(city);
  const forecastArray = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latLon[0]}&lon=${latLon[1]}&appid=45e75944bb8affc837985a8360bb4a02&units=imperial`, { mode: 'cors' })
    .then((response) => response.json())
    .then((data) => [data.list, data.city])
    .catch((error) => {
      console.log(error);
      document.querySelector('.error').style.display = 'flex';
    });
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
      description: capitalizeDescription(forecastArray[0][i].weather[0].description),
      iconCode: forecastArray[0][i].weather[0].icon,
    });
  }
  return dataArray;
}

const searchForm = document.querySelector('.search-form');
const forecastContainer = document.querySelector('.five-day-forecast');

async function displayPage(valueOfSearch) {
  const searchValue = valueOfSearch;
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

  document.querySelector('.wind').textContent = `Wind: ${Math.round(currentWeather.windSpeed)} mph ${canonicalDirection}`;
  document.querySelector('.description').textContent = currentWeather.description;
  document.getElementById('current-description-image').src = `./Icons/${currentWeather.iconCode}.png`;

  // display hourly forecast
  forecastContainer.innerHTML = '';
  for (let i = 0; i < forecast.length; i += 1) {
    const hourlyDataContainer = document.createElement('div');
    hourlyDataContainer.classList.add('hourly-data');

    const weekday = document.createElement('p');
    weekday.classList.add('weekday-and-time');
    weekday.textContent = `${forecast[i].localDateTimeString.substring(0, 4)} ${toTwelveHourTime(forecast[i].localDateTimeString.substring(16))}`;

    const hourlyTemp = document.createElement('p');
    hourlyTemp.classList.add('hourly-temperature');
    hourlyTemp.textContent = `${Math.round(forecast[i].temp)} °F`;

    const hourlyFeelsLike = document.createElement('p');
    hourlyFeelsLike.classList.add('hourly-feels-like');
    hourlyFeelsLike.textContent = `Feels Like ${Math.round(forecast[i].feelsLike)} °F`;

    const precipIconAndDataContainer = document.createElement('div');
    precipIconAndDataContainer.classList.add('hourly-precipitation-chance');
    const raindropIcon = document.createElement('img');
    raindropIcon.id = 'precipitation-icon';
    raindropIcon.src = './Icons/probabilityOfPrecipitation.png';
    const precipProb = document.createElement('p');
    precipProb.textContent = `${Math.round(forecast[i].probabilityOfPrecip * 100)} %`;
    precipIconAndDataContainer.appendChild(raindropIcon);
    precipIconAndDataContainer.appendChild(precipProb);

    const hourlyDescriptionAndImage = document.createElement('div');
    hourlyDescriptionAndImage.classList.add('hourly-description');
    const hourlyDescription = document.createElement('p');
    hourlyDescription.textContent = forecast[i].description;
    const hourlyImage = document.createElement('img');
    hourlyImage.src = `./Icons/${forecast[i].iconCode}.png`;
    hourlyDescriptionAndImage.appendChild(hourlyDescription);
    hourlyDescriptionAndImage.appendChild(hourlyImage);

    hourlyDataContainer.appendChild(weekday);
    hourlyDataContainer.appendChild(hourlyTemp);
    hourlyDataContainer.appendChild(hourlyFeelsLike);
    hourlyDataContainer.appendChild(precipIconAndDataContainer);
    hourlyDataContainer.appendChild(hourlyDescriptionAndImage);
    forecastContainer.appendChild(hourlyDataContainer);
  }

  searchForm.reset();
}

// display weather data on submitting city
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const searchValue = document.getElementById('search').value;
  displayPage(searchValue);
});

// Remove error messsage when search input is changed
const searchInput = document.getElementById('search');
searchInput.addEventListener('change', () => {
  document.querySelector('.error').style.display = 'none';
});

displayPage('denver');
