import { askAtmos } from "@/lib/assistant/assistant";
import type { AssistantQuery, AssistantReply } from "@/lib/assistant/assistant";

export type AssistantProvider = {
  query: (input: AssistantQuery) => Promise<AssistantReply>;
};

export const weatherAssistant: AssistantProvider = {
  query: askAtmos,
};
