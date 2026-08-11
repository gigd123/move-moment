// 天氣資料改吃 weatherApi.ts 的真實資料（Phase 3）。
// 最佳時段／室內建議還沒接上 domain/exercise（Phase 4、5 才實作），先繼續用假資料。

export interface GoodDayMock {
  status: 'good';
  greeting: string;
  bestWindow: { start: string; end: string; score: number };
  warning: { timeRange: string; reason: string } | null;
}

export interface BadDayMock {
  status: 'bad';
  greeting: string;
  recommendation: string;
}

export type TodayMock = GoodDayMock | BadDayMock;

export const goodDayMock: GoodDayMock = {
  status: 'good',
  greeting: 'Good morning, Leo',
  bestWindow: { start: '17:30', end: '19:00', score: 96 },
  warning: { timeRange: '11:00 — 15:00', reason: '高溫 + 高紫外線' },
};

export const badDayMock: BadDayMock = {
  status: 'bad',
  greeting: 'Good morning, Leo',
  recommendation: '今天戶外條件較差，建議改做室內運動。',
};
