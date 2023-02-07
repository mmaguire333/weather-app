function getLatLong(city) {
  return fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=45e75944bb8affc837985a8360bb4a02`, { mode: 'cors' })
    .then((response) => response.json())
    .then((response) => [response[0].lat, response[0].lon]);
}

function getCurrentWeather(city) {
  getLatLong(city).then((latLon) => fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latLon[0]}&lon=${latLon[1]}&appid=45e75944bb8affc837985a8360bb4a02&units=imperial`, { mode: 'cors' }))
    .then((response) => response.json())
    .then((response) => console.log(response));
}

function getFiveDayForecast(city) {
  getLatLong(city).then((latLon) => fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latLon[0]}&lon=${latLon[1]}&appid=45e75944bb8affc837985a8360bb4a02&units=imperial`, { mode: 'cors' }))
    .then((response) => response.json())
    .then((response) => console.log(response));
}

const searchForm = document.querySelector('.search-form');
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = document.getElementById('search').value;
  const latLon = getLatLong(city);
  latLon.then((array) => {
    document.querySelector('.lat').textContent = `Latitude: ${array[0]}`;
    document.querySelector('.lon').textContent = `Longitude: ${array[1]}`;
  }).catch(() => {
    document.querySelector('.error').style.display = 'flex';
  });
});

const searchInput = document.getElementById('search');
searchInput.addEventListener('change', () => {
  document.querySelector('.error').style.display = 'none';
});

getCurrentWeather('fort collins');
getFiveDayForecast('fort collins');
