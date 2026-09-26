import {
  LocationNotFoundError,
  WeatherUnavailableError,
  type DailyWeather,
  type GeoCoordinates,
  type HourlyWeather,
  type WeatherForecast,
} from "@/lib/weather/types";
import type { Campus } from "@/data/campuses";

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const REQUEST_TIMEOUT_MS = 10000;
const COORD_CACHE_KEY = "uniatmos.geo-cache";

interface GeocodeResponse {
  results?: Array<{
    name: string;
    latitude: number;
    longitude: number;
    admin1?: string;
    country_code?: string;
  }>;
}

interface ForecastResponse {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    cloud_cover: number;
    wind_speed_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    precipitation: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
  };
}

function readCoordCache(): Record<string, GeoCoordinates> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(COORD_CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, GeoCoordinates>;
  } catch {
    return {};
  }
}

function writeCoordCache(cache: Record<string, GeoCoordinates>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COORD_CACHE_KEY, JSON.stringify(cache));
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new WeatherUnavailableError();
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof WeatherUnavailableError) throw error;
    throw new WeatherUnavailableError();
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function geocodeCampus(campus: Campus): Promise<GeoCoordinates> {
  const cache = readCoordCache();
  const cached = cache[campus.id];
  if (cached) return cached;

  const params = new URLSearchParams({
    name: campus.city,
    count: "1",
    language: "pt",
    country: "BR",
  });

  const data = await fetchJson<GeocodeResponse>(`${GEOCODE_URL}?${params.toString()}`);
  const match = data.results?.[0];
  if (!match) {
    throw new LocationNotFoundError();
  }

  const coordinates: GeoCoordinates = {
    latitude: match.latitude,
    longitude: match.longitude,
    label: match.name,
  };

  cache[campus.id] = coordinates;
  writeCoordCache(cache);
  return coordinates;
}

export async function getForecast(campus: Campus): Promise<WeatherForecast> {
  const coordinates = await geocodeCampus(campus);
  const params = new URLSearchParams({
    latitude: String(coordinates.latitude),
    longitude: String(coordinates.longitude),
    timezone: "America/Sao_Paulo",
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "cloud_cover",
    ].join(","),
    hourly: [
      "temperature_2m",
      "precipitation_probability",
      "weather_code",
      "precipitation",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "precipitation_probability_max",
    ].join(","),
    forecast_days: "7",
  });

  const data = await fetchJson<ForecastResponse>(`${FORECAST_URL}?${params.toString()}`);

  const hourly: HourlyWeather[] = data.hourly.time.map((time, index) => ({
    time,
    temperature: data.hourly.temperature_2m[index] ?? 0,
    precipitationProbability: data.hourly.precipitation_probability[index] ?? 0,
    precipitation: data.hourly.precipitation[index] ?? 0,
    weatherCode: data.hourly.weather_code[index] ?? 0,
  }));

  const daily: DailyWeather[] = data.daily.time.map((date, index) => ({
    date,
    weatherCode: data.daily.weather_code[index] ?? 0,
    temperatureMax: data.daily.temperature_2m_max[index] ?? 0,
    temperatureMin: data.daily.temperature_2m_min[index] ?? 0,
    precipitationSum: data.daily.precipitation_sum[index] ?? 0,
    precipitationProbabilityMax: data.daily.precipitation_probability_max[index] ?? 0,
  }));

  return {
    campusId: campus.id,
    campusName: campus.name,
    city: campus.city,
    coordinates,
    timezone: data.timezone,
    current: {
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      precipitation: data.current.precipitation,
      cloudCover: data.current.cloud_cover,
      windSpeed: data.current.wind_speed_10m,
      weatherCode: data.current.weather_code,
      time: data.current.time,
    },
    hourly,
    daily,
  };
}
