import { fetchJson } from './http.js';

const BASE = 'https://api.open-meteo.com/v1/forecast';

// WMO weather interpretation codes, as documented by Open-Meteo.
const WMO = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Depositing rime fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Dense drizzle',
  56: 'Freezing drizzle', 57: 'Freezing drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  66: 'Freezing rain', 67: 'Freezing rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Light showers', 81: 'Showers', 82: 'Violent showers',
  85: 'Snow showers', 86: 'Snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail',
};

export const describeWeatherCode = (code) => WMO[code] ?? 'Unknown';

export async function getForecast({ lat, lng }) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lng,
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max',
    timezone: 'Asia/Kolkata',
    forecast_days: '5',
  });
  const json = await fetchJson(`${BASE}?${params}`, { provider: 'Open-Meteo' });
  const c = json.current;
  const d = json.daily;

  return {
    current: {
      time: c.time,
      temperatureC: c.temperature_2m,
      feelsLikeC: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      precipitationMm: c.precipitation,
      windKmh: c.wind_speed_10m,
      isDay: c.is_day === 1,
      code: c.weather_code,
      condition: describeWeatherCode(c.weather_code),
    },
    daily: d.time.map((date, i) => ({
      date,
      code: d.weather_code[i],
      condition: describeWeatherCode(d.weather_code[i]),
      maxC: d.temperature_2m_max[i],
      minC: d.temperature_2m_min[i],
      rainChance: d.precipitation_probability_max[i],
      uvIndex: d.uv_index_max[i],
      sunrise: d.sunrise[i],
      sunset: d.sunset[i],
    })),
  };
}
