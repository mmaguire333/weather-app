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
      windSpeed: currentData.wind.speed,
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
    const localDateTime = new Date(currentUnixDateTimeMilliseconds + timezone)
      .toString()
      .substring(0, 24);

    dataArray.push({
      localDateTimeString: localDateTime,
      temp: forecastArray[0][i].main.temp,
      feelsLike: forecastArray[0][i].main.feels_like,
      probabilityOfPrecip: forecastArray[0][i].pop,
      description: forecastArray[0][i].weather[0].description,
    });
  }
  return dataArray;
}

const searchForm = document.querySelector('.search-form');
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const searchValue = document.getElementById('search').value;
  const currentWeather = await getCurrentWeatherData(searchValue);
  const forecast = await getFiveDayForecastData(searchValue);
  console.log(currentWeather);
  console.log(forecast);
});

// Remove error messsage when search input is changed
const searchInput = document.getElementById('search');
searchInput.addEventListener('change', () => {
  document.querySelector('.error').style.display = 'none';
});
