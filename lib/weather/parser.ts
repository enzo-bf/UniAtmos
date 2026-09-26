import { WMO_CODES } from "@/lib/weather/codes";

export function describeWeatherCode(code: number): string {
  return WMO_CODES[code] ?? "Condição indefinida";
}

export function formatTemperature(value: number): string {
  return `${Math.round(value)}°C`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function isRainyCode(code: number): boolean {
  return (
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82) ||
    (code >= 95 && code <= 99)
  );
}

export function rainAdvice(probability: number, code: number): string {
  if (probability >= 60 || isRainyCode(code)) {
    return "Leve guarda-chuva.";
  }
  if (probability >= 35) {
    return "Há chance de chuva. Um guarda-chuva pode ser útil.";
  }
  return "A chance de chuva está baixa.";
}
