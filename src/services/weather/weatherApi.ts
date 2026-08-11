import type { DailyForecast, HourlyWeather } from '../../types/weather';
import type { OpenMeteoResponse } from './weatherApi.types';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

const HOURLY_PARAMS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'precipitation_probability',
  'precipitation',
  'wind_speed_10m',
  'uv_index',
  'weather_code',
].join(',');

export async function fetchHourlyForecast(latitude: number, longitude: number): Promise<DailyForecast> {
  const url = `${OPEN_METEO_URL}?latitude=${latitude}&longitude=${longitude}&hourly=${HOURLY_PARAMS}&timezone=auto&forecast_days=1`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with status ${response.status}`);
  }

  const data: OpenMeteoResponse = await response.json();
  return { hourly: mapHourly(data) };
}

function mapHourly(data: OpenMeteoResponse): HourlyWeather[] {
  const { hourly } = data;
  return hourly.time.map((time, index) => ({
    time,
    temperature: hourly.temperature_2m[index],
    feelsLike: hourly.apparent_temperature[index],
    humidity: hourly.relative_humidity_2m[index],
    precipitationProbability: hourly.precipitation_probability[index],
    precipitation: hourly.precipitation[index],
    windSpeed: hourly.wind_speed_10m[index],
    uvIndex: hourly.uv_index[index],
    weatherCode: hourly.weather_code[index],
  }));
}
