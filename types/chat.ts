import type { WeatherSnapshot } from "@/lib/weather/types";

export type ChatRole = "atmos" | "user";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: string;
  weather?: WeatherSnapshot;
}

export interface AssistantReply {
  text: string;
  weather?: WeatherSnapshot;
  campusId?: string;
  campusName?: string;
}
