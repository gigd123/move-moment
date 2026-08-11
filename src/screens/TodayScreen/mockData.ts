interface TodayWeather {
  emoji: string;
  condition: string;
  temperature: number;
  feelsLike: number;
}

export interface GoodDayMock {
  status: 'good';
  greeting: string;
  weather: TodayWeather;
  bestWindow: { start: string; end: string; score: number };
  warning: { timeRange: string; reason: string } | null;
}

export interface BadDayMock {
  status: 'bad';
  greeting: string;
  weather: TodayWeather;
  recommendation: string;
}

export type TodayMock = GoodDayMock | BadDayMock;

export const goodDayMock: GoodDayMock = {
  status: 'good',
  greeting: 'Good morning, Leo',
  weather: { emoji: '☀️', condition: '晴時多雲', temperature: 29, feelsLike: 33 },
  bestWindow: { start: '17:30', end: '19:00', score: 96 },
  warning: { timeRange: '11:00 — 15:00', reason: '高溫 + 高紫外線' },
};

export const badDayMock: BadDayMock = {
  status: 'bad',
  greeting: 'Good morning, Leo',
  weather: { emoji: '🌧️', condition: '午後雷陣雨', temperature: 27, feelsLike: 30 },
  recommendation: '今天戶外條件較差，建議改做室內運動。',
};
