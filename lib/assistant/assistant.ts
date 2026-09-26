import { CAMPUSES, findCampusInText, getCampusById, type Campus } from "@/data/campuses";
import { detectIntent, extractHourHint } from "@/lib/assistant/intents";
import { fetchCampusWeather } from "@/lib/weather/client";
import { describeWeatherCode, formatPercent, formatTemperature, rainAdvice } from "@/lib/weather/parser";
import {
  LocationNotFoundError,
  WeatherUnavailableError,
  type HourlyWeather,
  type WeatherForecast,
} from "@/lib/weather/types";
import type { AssistantReply } from "@/types/chat";

export interface AssistantQuery {
  message: string;
  preferredCampusId?: string;
}

function resolveCampus(message: string, preferredCampusId?: string): Campus {
  return (
    findCampusInText(message) ??
    (preferredCampusId ? getCampusById(preferredCampusId) : undefined) ??
    CAMPUSES[0]
  );
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function hoursForDate(forecast: WeatherForecast, date: Date): HourlyWeather[] {
  const day = startOfLocalDay(date).toDateString();
  return forecast.hourly.filter((hour) => new Date(hour.time).toDateString() === day);
}

function eveningHours(forecast: WeatherForecast, date: Date): HourlyWeather[] {
  return hoursForDate(forecast, date).filter((hour) => {
    const h = new Date(hour.time).getHours();
    return h >= 18 && h <= 23;
  });
}

function classWindowHours(forecast: WeatherForecast, date: Date, hint?: number): HourlyWeather[] {
  const start = hint ?? 19;
  const end = Math.min(start + 4, 23);
  return hoursForDate(forecast, date).filter((hour) => {
    const h = new Date(hour.time).getHours();
    return h >= start && h <= end;
  });
}

function maxRain(hours: HourlyWeather[]): number {
  return hours.reduce((max, hour) => Math.max(max, hour.precipitationProbability), 0);
}

function temperatureRange(hours: HourlyWeather[]): { min: number; max: number } | undefined {
  if (hours.length === 0) return undefined;
  const values = hours.map((hour) => hour.temperature);
  return { min: Math.min(...values), max: Math.max(...values) };
}

function snapshot(forecast: WeatherForecast, rainChance: number) {
  return {
    temperature: forecast.current.temperature,
    condition: describeWeatherCode(forecast.current.weatherCode),
    rainChance,
    city: forecast.city,
    campusName: forecast.campusName,
  };
}

function composeReply(forecast: WeatherForecast, message: string): AssistantReply {
  const intent = detectIntent(message);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const todayHours = hoursForDate(forecast, now);
  const todayRain = maxRain(todayHours);
  const weather = snapshot(forecast, todayRain);
  const place = `${forecast.campusName}, em ${forecast.city}`;

  if (intent === "current" || intent === "campus" || intent === "generic") {
    return {
      text: `Agora em ${place} estão ${formatTemperature(forecast.current.temperature)}, com sensação de ${formatTemperature(forecast.current.apparentTemperature)}. Condição: ${describeWeatherCode(forecast.current.weatherCode)}.`,
      weather,
      campusId: forecast.campusId,
      campusName: forecast.campusName,
    };
  }

  if (intent === "rain_today" || intent === "umbrella") {
    const today = forecast.daily[0];
    const advice = rainAdvice(todayRain, today?.weatherCode ?? forecast.current.weatherCode);
    return {
      text: `Para hoje em ${place}, a chance máxima de chuva é ${formatPercent(todayRain)}. A temperatura deve variar entre ${formatTemperature(today?.temperatureMin ?? forecast.current.temperature)} e ${formatTemperature(today?.temperatureMax ?? forecast.current.temperature)}. ${advice}`,
      weather: { ...weather, rainChance: todayRain },
      campusId: forecast.campusId,
      campusName: forecast.campusName,
    };
  }

  if (intent === "tonight") {
    const night = eveningHours(forecast, now);
    const range = temperatureRange(night);
    const rain = maxRain(night);
    const cools =
      range !== undefined && range.min < forecast.current.temperature - 1
        ? "Sim, tende a esfriar em relação ao horário atual."
        : "A variação deve ser pequena nesta noite.";
    return {
      text: `${cools} À noite em ${place}, a temperatura fica em torno de ${range ? `${formatTemperature(range.min)} a ${formatTemperature(range.max)}` : formatTemperature(forecast.current.temperature)}. Chance de chuva: ${formatPercent(rain)}.`,
      weather: { ...weather, rainChance: rain },
      campusId: forecast.campusId,
      campusName: forecast.campusName,
    };
  }

  if (intent === "tomorrow") {
    const day = forecast.daily[1] ?? forecast.daily[0];
    return {
      text: `Amanhã em ${place}: ${describeWeatherCode(day.weatherCode)}, mínima de ${formatTemperature(day.temperatureMin)} e máxima de ${formatTemperature(day.temperatureMax)}. Chance de chuva de até ${formatPercent(day.precipitationProbabilityMax)}.`,
      weather: {
        ...weather,
        temperature: day.temperatureMax,
        condition: describeWeatherCode(day.weatherCode),
        rainChance: day.precipitationProbabilityMax,
      },
      campusId: forecast.campusId,
      campusName: forecast.campusName,
    };
  }

  const hourHint = extractHourHint(message);
  const windowHours = classWindowHours(forecast, now, hourHint);
  const range = temperatureRange(windowHours);
  const rain = maxRain(windowHours);
  const label = hourHint !== undefined ? `por volta das ${hourHint}h` : "no horário usual de aula (19h às 22h)";

  return {
    text: `${label.charAt(0).toUpperCase()}${label.slice(1)} em ${place}, a temperatura deve ficar entre ${range ? `${formatTemperature(range.min)} e ${formatTemperature(range.max)}` : formatTemperature(forecast.current.temperature)}. Chance de chuva: ${formatPercent(rain)}. ${rainAdvice(rain, forecast.current.weatherCode)}`,
    weather: { ...weather, rainChance: rain },
    campusId: forecast.campusId,
    campusName: forecast.campusName,
  };
}

export async function askAtmos(query: AssistantQuery): Promise<AssistantReply> {
  const campus = resolveCampus(query.message, query.preferredCampusId);

  try {
    const forecast = await fetchCampusWeather(campus);
    return composeReply(forecast, query.message);
  } catch (error) {
    if (error instanceof LocationNotFoundError) {
      return {
        text: `Não encontrei a localização de ${campus.city} para consultar o clima. Tente outro campus da UNIP.`,
      };
    }
    if (error instanceof WeatherUnavailableError) {
      return { text: error.message };
    }
    return {
      text: "Não consegui consultar o clima agora. Tente novamente em alguns instantes.",
    };
  }
}
