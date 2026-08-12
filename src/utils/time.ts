import type { HourlyWeather } from '../types/weather';

// Open-Meteo returns ISO time strings ("2026-08-12T14:00") already localized
// to the forecast location (timezone=auto), so reading the hour substring
// directly avoids Date parsing re-interpreting it in the device's timezone.
export function extractHour(time: string): number {
  return Number(time.slice(11, 13));
}

export function findCurrentHour(hourly: HourlyWeather[]): HourlyWeather | undefined {
  const now = Date.now();

  return hourly.reduce<HourlyWeather | undefined>((closest, entry) => {
    const entryTime = new Date(entry.time).getTime();
    if (entryTime > now) return closest;
    if (!closest) return entry;
    return entryTime > new Date(closest.time).getTime() ? entry : closest;
  }, undefined) ?? hourly[0];
}
