export interface HourlyWeather {
  time: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  precipitationProbability: number;
  precipitation: number;
  windSpeed: number;
  uvIndex: number;
  weatherCode: number;
}

export interface DailyForecast {
  hourly: HourlyWeather[];
}
