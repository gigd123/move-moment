import {
  calculateIndoorScore,
  calculateOutdoorScore,
  feelsLikePenalty,
  rainPenalty,
  temperaturePenalty,
  uvPenalty,
  windPenalty,
} from '../exerciseScore';
import type { HourlyWeather } from '../../../types/weather';

function makeWeather(overrides: Partial<HourlyWeather>): HourlyWeather {
  return {
    time: '2026-08-12T13:00',
    temperature: 22,
    feelsLike: 22,
    humidity: 50,
    precipitationProbability: 0,
    precipitation: 0,
    windSpeed: 10,
    uvIndex: 3,
    weatherCode: 0,
    ...overrides,
  };
}

describe('temperaturePenalty', () => {
  it('has no penalty in the ideal 18-24°C range', () => {
    expect(temperaturePenalty(18)).toBe(0);
    expect(temperaturePenalty(24)).toBe(0);
  });

  it('increases as temperature moves further from the ideal range', () => {
    expect(temperaturePenalty(26)).toBe(5);
    expect(temperaturePenalty(29)).toBe(12);
    expect(temperaturePenalty(32)).toBe(30);
    expect(temperaturePenalty(35)).toBe(40);
  });

  it('penalizes cold temperatures below the ideal range', () => {
    expect(temperaturePenalty(16)).toBe(8);
    expect(temperaturePenalty(12)).toBe(15);
    expect(temperaturePenalty(5)).toBe(25);
  });
});

describe('feelsLikePenalty', () => {
  it('has no penalty when feels-like is close to actual temperature', () => {
    expect(feelsLikePenalty(23, 22)).toBe(0);
  });

  it('penalizes heavily when feels-like is much higher than actual temperature', () => {
    // Documented example: 29°C actual, 35°C feels-like should be penalized clearly.
    expect(feelsLikePenalty(35, 29)).toBeGreaterThanOrEqual(12);
  });

  it('applies the maximum penalty for extreme feels-like gaps', () => {
    expect(feelsLikePenalty(40, 29)).toBe(20);
  });
});

describe('rainPenalty', () => {
  it('barely penalizes low precipitation probability', () => {
    expect(rainPenalty(10, 0)).toBe(0);
  });

  it('penalizes increasingly higher precipitation probability', () => {
    expect(rainPenalty(30, 0)).toBe(8);
    expect(rainPenalty(50, 0)).toBe(20);
    expect(rainPenalty(70, 0)).toBe(35);
  });

  it('adds an extra penalty for meaningful rain amount', () => {
    expect(rainPenalty(70, 2)).toBe(45);
  });
});

describe('uvPenalty', () => {
  it('applies the full penalty during peak sun hours (11-15)', () => {
    expect(uvPenalty(9, 13)).toBe(25);
  });

  it('applies a reduced penalty outside peak sun hours', () => {
    expect(uvPenalty(9, 8)).toBe(13);
  });

  it('has no penalty for low UV index', () => {
    expect(uvPenalty(1, 13)).toBe(0);
  });
});

describe('windPenalty', () => {
  it('has no penalty for calm wind', () => {
    expect(windPenalty(15)).toBe(0);
  });

  it('penalizes increasingly strong wind', () => {
    expect(windPenalty(25)).toBe(5);
    expect(windPenalty(35)).toBe(12);
    expect(windPenalty(45)).toBe(20);
  });
});

describe('calculateOutdoorScore', () => {
  it('scores low for hot, humid, high-UV, rainy weather', () => {
    // Documented case: 30°C + high humidity + high UV + high rain probability -> low score.
    const weather = makeWeather({
      time: '2026-08-12T13:00',
      temperature: 30,
      feelsLike: 37,
      humidity: 85,
      precipitationProbability: 75,
      precipitation: 3,
      uvIndex: 9,
      windSpeed: 10,
    });

    expect(calculateOutdoorScore(weather)).toBeLessThan(40);
  });

  it('scores high for mild, dry, clear weather', () => {
    // Documented case: 22°C + low humidity + no rain -> high score.
    const weather = makeWeather({
      time: '2026-08-12T10:00',
      temperature: 22,
      feelsLike: 21,
      humidity: 35,
      precipitationProbability: 5,
      precipitation: 0,
      uvIndex: 3,
      windSpeed: 8,
    });

    expect(calculateOutdoorScore(weather)).toBeGreaterThanOrEqual(90);
  });

  it('never returns a score below 0', () => {
    const weather = makeWeather({
      temperature: 40,
      feelsLike: 48,
      precipitationProbability: 100,
      precipitation: 20,
      uvIndex: 12,
      windSpeed: 60,
    });

    expect(calculateOutdoorScore(weather)).toBe(0);
  });
});

describe('calculateIndoorScore', () => {
  it('stays near the 95 baseline on an ordinary day', () => {
    const weather = makeWeather({ weatherCode: 0, feelsLike: 25, humidity: 50 });
    expect(calculateIndoorScore(weather)).toBe(95);
  });

  it('drops sharply under a thunderstorm alert', () => {
    const weather = makeWeather({ weatherCode: 95 });
    expect(calculateIndoorScore(weather)).toBe(65);
  });

  it('drops moderately under extreme heat and humidity', () => {
    const weather = makeWeather({ weatherCode: 1, feelsLike: 39, humidity: 80 });
    expect(calculateIndoorScore(weather)).toBe(85);
  });
});
