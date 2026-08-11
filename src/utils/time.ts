import type { HourlyWeather } from '../types/weather';

export function findCurrentHour(hourly: HourlyWeather[]): HourlyWeather | undefined {
  const now = Date.now();

  return hourly.reduce<HourlyWeather | undefined>((closest, entry) => {
    const entryTime = new Date(entry.time).getTime();
    if (entryTime > now) return closest;
    if (!closest) return entry;
    return entryTime > new Date(closest.time).getTime() ? entry : closest;
  }, undefined) ?? hourly[0];
}
