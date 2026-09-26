import { getForecast } from "@/lib/weather/openMeteo";
import type { WeatherForecast } from "@/lib/weather/types";
import type { Campus } from "@/data/campuses";

export async function fetchCampusWeather(campus: Campus): Promise<WeatherForecast> {
  return getForecast(campus);
}
