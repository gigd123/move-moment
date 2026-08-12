import { clamp } from '../../utils/clamp';
import { extractHour } from '../../utils/time';
import type { HourlyWeather } from '../../types/weather';

// WMO weather codes for thunderstorms (Open-Meteo has no typhoon-specific code).
const SEVERE_WEATHER_CODES = new Set([95, 96, 99]);

const UV_PEAK_HOUR_START = 11;
const UV_PEAK_HOUR_END = 15;

export function temperaturePenalty(temp: number): number {
  if (temp >= 18 && temp <= 24) return 0;
  if (temp >= 25 && temp <= 27) return 5;
  if (temp >= 28 && temp <= 30) return 12;
  if (temp >= 31 && temp <= 33) return 30;
  if (temp > 33) return 40;
  if (temp >= 14) return 8; // 14–17.9°C
  if (temp >= 10) return 15; // 10–13.9°C
  return 25; // < 10°C
}

export function feelsLikePenalty(feelsLike: number, temp: number): number {
  const diff = feelsLike - temp;
  if (diff < 3) return 0;
  if (diff < 6) return 5;
  if (diff < 9) return 12;
  return 20;
}

export function rainPenalty(precipitationProbability: number, precipitation: number): number {
  let penalty = 0;
  if (precipitationProbability > 60) penalty = 35;
  else if (precipitationProbability > 40) penalty = 20;
  else if (precipitationProbability > 20) penalty = 8;

  if (precipitation > 1) penalty += 10;

  return penalty;
}

export function uvPenalty(uvIndex: number, hour: number): number {
  let base = 0;
  if (uvIndex >= 11) base = 35;
  else if (uvIndex >= 8) base = 25;
  else if (uvIndex >= 6) base = 15;
  else if (uvIndex >= 3) base = 5;

  const isPeakHour = hour >= UV_PEAK_HOUR_START && hour <= UV_PEAK_HOUR_END;
  return isPeakHour ? base : Math.round(base / 2);
}

export function windPenalty(windSpeed: number): number {
  if (windSpeed > 40) return 20;
  if (windSpeed > 30) return 12;
  if (windSpeed > 20) return 5;
  return 0;
}

export function calculateOutdoorScore(weather: HourlyWeather): number {
  const hour = extractHour(weather.time);
  const score =
    100 -
    temperaturePenalty(weather.temperature) -
    feelsLikePenalty(weather.feelsLike, weather.temperature) -
    rainPenalty(weather.precipitationProbability, weather.precipitation) -
    uvPenalty(weather.uvIndex, hour) -
    windPenalty(weather.windSpeed);

  return clamp(score, 0, 100);
}

export function calculateIndoorScore(weather: HourlyWeather): number {
  let score = 95;

  if (SEVERE_WEATHER_CODES.has(weather.weatherCode)) {
    score -= 30;
  } else if (weather.feelsLike > 38 && weather.humidity >= 70) {
    score -= 10;
  }

  return clamp(score, 0, 100);
}
