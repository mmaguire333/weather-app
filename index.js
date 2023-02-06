function getLatLong(city) {
  fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=45e75944bb8affc837985a8360bb4a02`, { mode: 'cors' })
    .then((response) => response.json())
    .then((response) => console.log(response))
    .catch(() => {
      // FIXME: change alert to error message that appears under search box
      alert('city not found');
    });
}
