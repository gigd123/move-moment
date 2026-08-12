import { findBestOutdoorWindow, OUTDOOR_WINDOW_THRESHOLD } from '../bestWindow';
import type { HourlyWeather } from '../../../types/weather';

function makeHour(time: string, overrides: Partial<HourlyWeather> = {}): HourlyWeather {
  return {
    time,
    temperature: 22,
    feelsLike: 22,
    humidity: 50,
    precipitationProbability: 0,
    precipitation: 0,
    windSpeed: 10,
    uvIndex: 0,
    weatherCode: 0,
    ...overrides,
  };
}

describe('findBestOutdoorWindow', () => {
  it('returns null for an empty forecast', () => {
    expect(findBestOutdoorWindow([])).toBeNull();
  });

  it('picks the 3-hour window with the highest average, not just the single best hour', () => {
    // Shaped after the docx §10 example (16:00 72 < 17:00 87 < 18:00 93 >
    // 19:00 91 > 20:00 75 -> "17:00-19:00"): 18:00 scores highest alone, but
    // the 17:00-19:00 window has the best 3-hour average.
    const hourly = [
      makeHour('2026-08-12T16:00', { temperature: 32 }), // score 70
      makeHour('2026-08-12T17:00', { temperature: 27 }), // score 95
      makeHour('2026-08-12T18:00', { temperature: 22 }), // score 100 (single best hour)
      makeHour('2026-08-12T19:00', { temperature: 25 }), // score 95
      makeHour('2026-08-12T20:00', { temperature: 30 }), // score 88
    ];

    const result = findBestOutdoorWindow(hourly);

    expect(result).toEqual({ start: '17:00', end: '19:00', averageScore: 97 });
  });

  it('returns null when the whole day is below the outdoor threshold, instead of forcing the least-bad window', () => {
    const hourly = Array.from({ length: 6 }, (_, i) =>
      makeHour(`2026-08-12T${String(i + 10).padStart(2, '0')}:00`, {
        temperature: 35,
        precipitationProbability: 70,
      })
    );

    expect(findBestOutdoorWindow(hourly)).toBeNull();
  });

  it('shrinks the window when fewer than 3 hours of forecast are available', () => {
    const hourly = [makeHour('2026-08-12T06:00'), makeHour('2026-08-12T07:00')];

    const result = findBestOutdoorWindow(hourly);

    expect(result).toEqual({ start: '06:00', end: '07:00', averageScore: 100 });
  });

  it('is inclusive of the threshold boundary', () => {
    // temperaturePenalty(31) = 30 -> score 70, comfortably above the 60-point line.
    const hourly = [
      makeHour('2026-08-12T12:00', { temperature: 31 }),
      makeHour('2026-08-12T13:00', { temperature: 31 }),
      makeHour('2026-08-12T14:00', { temperature: 31 }),
    ];

    const result = findBestOutdoorWindow(hourly);

    expect(result).not.toBeNull();
    expect(result!.averageScore).toBeGreaterThanOrEqual(OUTDOOR_WINDOW_THRESHOLD);
  });
});
