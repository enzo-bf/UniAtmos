export type WeatherIntent =
  | "current"
  | "rain_today"
  | "umbrella"
  | "tonight"
  | "tomorrow"
  | "class_hours"
  | "campus"
  | "generic";

const INTENT_PATTERNS: Array<{ intent: WeatherIntent; tests: RegExp[] }> = [
  {
    intent: "umbrella",
    tests: [/guarda[- ]?chuva/, /preciso levar/, /vale a pena levar/],
  },
  {
    intent: "rain_today",
    tests: [/chover/, /chuva/, /molhar/, /precipita/],
  },
  {
    intent: "tonight",
    tests: [/noite/, /anoitecer/, /esfriar a noite/, /vai esfriar/],
  },
  {
    intent: "tomorrow",
    tests: [/amanha/, /amanhã/, /proximo dia/, /próximo dia/],
  },
  {
    intent: "class_hours",
    tests: [/aula/, /horario/, /horário/, /\b\d{1,2}\s*h\b/, /periodo da aula/],
  },
  {
    intent: "current",
    tests: [/agora/, /temperatura/, /quantos graus/, /como esta/, /como está/, /clima/],
  },
  {
    intent: "campus",
    tests: [/campus/, /unip/],
  },
];

export function detectIntent(message: string): WeatherIntent {
  const normalized = message
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  for (const entry of INTENT_PATTERNS) {
    if (entry.tests.some((test) => test.test(normalized))) {
      return entry.intent;
    }
  }

  return "generic";
}

export function extractHourHint(message: string): number | undefined {
  const match = message.match(/\b(\d{1,2})\s*h(?:oras)?\b/i);
  if (!match) return undefined;
  const hour = Number(match[1]);
  if (Number.isNaN(hour) || hour < 0 || hour > 23) return undefined;
  return hour;
}
