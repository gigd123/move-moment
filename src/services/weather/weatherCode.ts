interface WeatherCondition {
  emoji: string;
  condition: string;
}

// WMO weather codes, as returned by Open-Meteo's weather_code field.
// https://open-meteo.com/en/docs
const WEATHER_CODES: Record<number, WeatherCondition> = {
  0: { emoji: '☀️', condition: '晴天' },
  1: { emoji: '🌤️', condition: '晴時多雲' },
  2: { emoji: '⛅', condition: '多雲時晴' },
  3: { emoji: '☁️', condition: '陰天' },
  45: { emoji: '🌫️', condition: '有霧' },
  48: { emoji: '🌫️', condition: '有霧' },
  51: { emoji: '🌦️', condition: '毛毛雨' },
  53: { emoji: '🌦️', condition: '毛毛雨' },
  55: { emoji: '🌦️', condition: '毛毛雨' },
  56: { emoji: '🌧️', condition: '凍雨' },
  57: { emoji: '🌧️', condition: '凍雨' },
  61: { emoji: '🌧️', condition: '下雨' },
  63: { emoji: '🌧️', condition: '下雨' },
  65: { emoji: '🌧️', condition: '大雨' },
  66: { emoji: '🌧️', condition: '凍雨' },
  67: { emoji: '🌧️', condition: '凍雨' },
  71: { emoji: '❄️', condition: '下雪' },
  73: { emoji: '❄️', condition: '下雪' },
  75: { emoji: '❄️', condition: '大雪' },
  77: { emoji: '❄️', condition: '冰霰' },
  80: { emoji: '🌦️', condition: '陣雨' },
  81: { emoji: '🌦️', condition: '陣雨' },
  82: { emoji: '🌦️', condition: '強陣雨' },
  85: { emoji: '❄️', condition: '陣雪' },
  86: { emoji: '❄️', condition: '陣雪' },
  95: { emoji: '⛈️', condition: '雷雨' },
  96: { emoji: '⛈️', condition: '雷雨挾冰雹' },
  99: { emoji: '⛈️', condition: '雷雨挾冰雹' },
};

const DEFAULT_CONDITION: WeatherCondition = { emoji: '🌡️', condition: '天氣不明' };

export function getWeatherCondition(weatherCode: number): WeatherCondition {
  return WEATHER_CODES[weatherCode] ?? DEFAULT_CONDITION;
}
