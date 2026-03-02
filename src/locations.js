import { Country, City } from "country-state-city";
import { getWeather } from "./weather";

const citySelect = document.querySelector('select[name="city"]');
const countrySelect = document.querySelector('select[name="country"]');
const longtitudeLatitudeSelect = document.querySelector(
  '.input-wrapper span[name="l&l"]',
);

export const initiateLocationInputs = () => {
  setCountryOptions();

  countrySelect?.addEventListener("change", (event) => {
    const value = event.target.value;
    if (!value) return;

    setCityOptions(value);
  });

  citySelect?.addEventListener("change", async (event) => {
    const value = event.target.value;
    if (!value) return;

    const { latitude, longitude } = JSON.parse(value);

    setLongtitudeAndLatitude({ latitude, longitude });
    const data = await getWeather({ longtitude: longitude, latitude });
    console.log(data);

    document.querySelector("div[name='weather-data']").innerHTML =
      renderWeatherData(data);
  });
};

const setCountryOptions = () => {
  if (!countrySelect) return;

  countrySelect.innerHTML = "<option value=''>Select Country</option>";
  for (const c of Country.getAllCountries()) {
    const option = document.createElement("option");
    option.value = c.isoCode;
    option.textContent = c.name;
    countrySelect.appendChild(option);
  }
};

const setCityOptions = (countryCode) => {
  if (!citySelect) return;

  citySelect.innerHTML = "<option value=''>Select City</option>";
  for (const c of City.getCitiesOfCountry(countryCode)) {
    const option = document.createElement("option");
    option.value = JSON.stringify({
      latitude: c.latitude,
      longitude: c.longitude,
    });
    option.textContent = c.name;
    citySelect.appendChild(option);
  }
};

const weatherCodeMap = {
  0: ["Clear sky", "sun"],
  1: ["Mainly clear", "sun"],
  2: ["Partly cloudy", "cloud-sun"],
  3: ["Overcast", "cloud"],
  45: ["Foggy", "cloud"],
  48: ["Rime fog", "cloud"],
  51: ["Light drizzle", "cloud-drizzle"],
  53: ["Moderate drizzle", "cloud-drizzle"],
  55: ["Dense drizzle", "cloud-drizzle"],
  61: ["Slight rain", "cloud-rain"],
  63: ["Moderate rain", "cloud-rain"],
  65: ["Heavy rain", "cloud-rain"],
  71: ["Slight snowfall", "snowflake"],
  73: ["Moderate snowfall", "snowflake"],
  75: ["Heavy snowfall", "snowflake"],
  77: ["Snow grains", "snowflake"],
  80: ["Slight showers", "cloud-rain"],
  81: ["Moderate showers", "cloud-rain"],
  82: ["Violent showers", "cloud-rain"],
  85: ["Slight snow showers", "snowflake"],
  86: ["Heavy snow showers", "snowflake"],
  95: ["Thunderstorm", "cloud-lightning"],
  96: ["Thunderstorm w/ hail", "cloud-lightning"],
  99: ["Thunderstorm w/ heavy hail", "cloud-lightning"],
};

const getWeatherDescription = (code) =>
  weatherCodeMap[code]?.[0] ?? "Unknown";

const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
};

const renderWeatherData = (data) => {
  const { current, current_units, daily, daily_units, hourly, timezone } = data;

  // Find today's index in daily data
  const todayStr = current.time.slice(0, 10);
  const todayIdx = daily.time.indexOf(todayStr);

  // Get next 24 hours of hourly data from current time
  const currentHourStr = current.time.slice(0, 13);
  const hourlyStartIdx = hourly.time.findIndex((t) => t.startsWith(currentHourStr));
  const hourlySlice = Math.max(0, hourlyStartIdx);

  // Current weather
  const currentHTML = `
    <div class="weather-current">
      <div class="weather-current-main">
        <span class="weather-temp">${current.temperature_2m}${current_units.temperature_2m}</span>
        <span class="weather-condition">${getWeatherDescription(hourly.weather_code[hourlySlice])}</span>
        <span class="weather-feels">Feels like ${current.apparent_temperature}${current_units.apparent_temperature}</span>
      </div>
      <div class="weather-current-details">
        <div class="weather-detail">
          <span class="weather-detail-label">Humidity</span>
          <span class="weather-detail-value">${current.relative_humidity_2m}${current_units.relative_humidity_2m}</span>
        </div>
        <div class="weather-detail">
          <span class="weather-detail-label">Wind</span>
          <span class="weather-detail-value">${current.wind_speed_10m} ${current_units.wind_speed_10m}</span>
        </div>
        <div class="weather-detail">
          <span class="weather-detail-label">Rain</span>
          <span class="weather-detail-value">${current.rain} ${current_units.rain}</span>
        </div>
        <div class="weather-detail">
          <span class="weather-detail-label">Pressure</span>
          <span class="weather-detail-value">${current.surface_pressure} ${current_units.surface_pressure}</span>
        </div>
      </div>
    </div>`;

  // Hourly forecast (next 12 hours)
  let hourlyHTML = '<div class="weather-hourly"><h3>Next 12 Hours</h3><div class="weather-hourly-scroll">';
  for (let i = hourlySlice; i < hourlySlice + 12 && i < hourly.time.length; i++) {
    hourlyHTML += `
      <div class="weather-hour">
        <span class="hour-time">${formatTime(hourly.time[i])}</span>
        <span class="hour-temp">${hourly.temperature_2m[i]}${daily_units.temperature_2m_min}</span>
        <span class="hour-rain">${hourly.precipitation_probability[i]}%</span>
      </div>`;
  }
  hourlyHTML += "</div></div>";

  // Daily forecast
  let dailyHTML = '<div class="weather-daily"><h3>7-Day Forecast</h3>';
  const startDay = todayIdx >= 0 ? todayIdx : 0;
  for (let i = startDay; i < Math.min(startDay + 7, daily.time.length); i++) {
    const weatherCode = hourly.weather_code[i * 24 + 12] ?? 0;
    dailyHTML += `
      <div class="weather-day">
        <span class="day-name">${i === startDay ? "Today" : formatDate(daily.time[i])}</span>
        <span class="day-condition">${getWeatherDescription(weatherCode)}</span>
        <span class="day-temps">
          <span class="day-high">${daily.temperature_2m_max[i]}°</span>
          <span class="day-low">${daily.temperature_2m_min[i]}°</span>
        </span>
      </div>`;
  }
  dailyHTML += "</div>";

  // Sunrise/sunset for today
  let sunHTML = "";
  if (todayIdx >= 0) {
    sunHTML = `
      <div class="weather-sun">
        <div class="weather-detail">
          <span class="weather-detail-label">Sunrise</span>
          <span class="weather-detail-value">${formatTime(daily.sunrise[todayIdx])}</span>
        </div>
        <div class="weather-detail">
          <span class="weather-detail-label">Sunset</span>
          <span class="weather-detail-value">${formatTime(daily.sunset[todayIdx])}</span>
        </div>
        <div class="weather-detail">
          <span class="weather-detail-label">UV Index</span>
          <span class="weather-detail-value">${daily.uv_index_max[todayIdx]}</span>
        </div>
        <div class="weather-detail">
          <span class="weather-detail-label">Max Wind</span>
          <span class="weather-detail-value">${daily.wind_speed_10m_max[todayIdx]} ${daily_units.wind_speed_10m_max}</span>
        </div>
      </div>`;
  }

  return currentHTML + sunHTML + hourlyHTML + dailyHTML;
};

const setLongtitudeAndLatitude = ({ longitude, latitude }) => {
  if (!longtitudeLatitudeSelect) return;

  longtitudeLatitudeSelect.innerHTML = `${longitude}, ${latitude}`;
};
