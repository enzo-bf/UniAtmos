export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  label: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  cloudCover: number;
  windSpeed: number;
  weatherCode: number;
  time: string;
}

export interface HourlyWeather {
  time: string;
  temperature: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
}

export interface DailyWeather {
  date: string;
  weatherCode: number;
  temperatureMax: number;
  temperatureMin: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
}

export interface WeatherForecast {
  campusId: string;
  campusName: string;
  city: string;
  coordinates: GeoCoordinates;
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
  timezone: string;
}

export interface WeatherSnapshot {
  temperature: number;
  condition: string;
  rainChance: number;
  city: string;
  campusName: string;
}

export class WeatherUnavailableError extends Error {
  constructor(message = "Não consegui consultar o clima agora. Tente novamente em alguns instantes.") {
    super(message);
    this.name = "WeatherUnavailableError";
  }
}

export class LocationNotFoundError extends Error {
  constructor(message = "Não encontrei essa cidade para consultar o clima.") {
    super(message);
    this.name = "LocationNotFoundError";
  }
}
