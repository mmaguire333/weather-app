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
    .then((data) => data.list);
  const dataArray = [];
  for (let i = 0; i < forecastArray.length; i += 1) {
    dataArray.push({
      time: forecastArray[i].dt_txt,
      temp: forecastArray[i].main.temp,
      feelsLike: forecastArray[i].main.feels_like,
      description: forecastArray[i].weather[0].description,
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
