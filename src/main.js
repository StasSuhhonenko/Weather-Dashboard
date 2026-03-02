import { initiateLocationInputs } from "./locations";

initiateLocationInputs();

const getWeatherData = function (latitude, longitude) {
  fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=sunrise,sunset,uv_index_max,wind_speed_10m_max,wind_direction_10m_dominant,temperature_2m_min,temperature_2m_max&hourly=temperature_2m,relative_humidity_2m,rain,showers,precipitation_probability,precipitation,weather_code,uv_index,visibility,surface_pressure,snow_depth,apparent_temperature&current=temperature_2m,relative_humidity_2m,wind_speed_10m,rain,precipitation,surface_pressure,apparent_temperature,is_day&timezone=auto&past_days=7&forecast_days=14`,
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      // console.log(data);
    })
    .then(() => {});
};

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function (position) {
    const coordinates = position.coords;
    // console.log(coordinates);
    const latitude = coordinates.latitude;
    const longitude = coordinates.longitude;
    getWeatherData(latitude, longitude);
  });
} else {
  alert("Could not get your position");
}
