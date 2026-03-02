export async function getWeather({ longtitude, latitude }) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longtitude}&daily=sunrise,sunset,uv_index_max,wind_speed_10m_max,wind_direction_10m_dominant,temperature_2m_min,temperature_2m_max&hourly=temperature_2m,relative_humidity_2m,rain,showers,precipitation_probability,precipitation,weather_code,uv_index,visibility,surface_pressure,snow_depth,apparent_temperature&current=temperature_2m,relative_humidity_2m,wind_speed_10m,rain,precipitation,surface_pressure,apparent_temperature,is_day&timezone=auto&past_days=7&forecast_days=14`;

  const response = await fetch(url, {
    method: "GET",
  });

  return await response.json();
}
