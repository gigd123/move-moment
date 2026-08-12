import { calculateOutdoorScore } from './exerciseScore';
import type { HourlyWeather } from '../../types/weather';
import type { BestWindow } from '../../types/exercise';

// §26.5: below this average, don't show a best outdoor window at all —
// the home screen falls back to the indoor recommendation instead.
export const OUTDOOR_WINDOW_THRESHOLD = 60;

// Fixed 3-hour window, per docx §10's worked example (17:00-19:00 beats the
// single highest-scoring hour 18:00 despite 93 > 90.33 — a window's average
// can never exceed its best single hour, so a variable 1-3h search would
// almost always degenerate to picking one hour). Only shrinks when the
// day's forecast itself has fewer than 3 hours left (start/end of data).
const WINDOW_HOURS = 3;

function formatHourLabel(time: string): string {
  return time.slice(11, 16);
}

export function findBestOutdoorWindow(hourly: HourlyWeather[]): BestWindow | null {
  if (hourly.length === 0) return null;

  const scores = hourly.map(calculateOutdoorScore);
  const windowLength = Math.min(WINDOW_HOURS, hourly.length);

  let bestAverage = -Infinity;
  let best: BestWindow | null = null;

  for (let start = 0; start + windowLength <= hourly.length; start++) {
    const windowScores = scores.slice(start, start + windowLength);
    const averageScore = windowScores.reduce((sum, score) => sum + score, 0) / windowScores.length;

    if (averageScore > bestAverage) {
      bestAverage = averageScore;
      best = {
        start: formatHourLabel(hourly[start].time),
        end: formatHourLabel(hourly[start + windowLength - 1].time),
        averageScore: Math.round(averageScore),
      };
    }
  }

  if (!best || bestAverage < OUTDOOR_WINDOW_THRESHOLD) return null;

  return best;
}
