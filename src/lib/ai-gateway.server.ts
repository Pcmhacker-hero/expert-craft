import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

import type { AiConfig } from "./env.server";

/**
 * Provider bound to the Lovable AI Gateway. Server-only.
 */
export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey },
  });
}

/**
 * Direct OpenAI fallback, used when the app runs outside Lovable hosting
 * (e.g. Vercel) where LOVABLE_API_KEY is not injected.
 */
export function createOpenAiProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "openai",
    baseURL: "https://api.openai.com/v1",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}

/**
 * Google Gemini via its OpenAI-compatible endpoint. Used when the app runs
 * outside Lovable hosting with a Google AI Studio key.
 */
export function createGeminiProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}

/** Returns a model instance for whichever provider is configured. */
export function createTutorModel(config: AiConfig) {
  const provider =
    config.kind === "lovable"
      ? createLovableAiGatewayProvider(config.apiKey)
      : config.kind === "gemini"
        ? createGeminiProvider(config.apiKey)
        : createOpenAiProvider(config.apiKey);
  return provider(config.model);
}

export const TUTOR_MODEL = "openai/gpt-5.6-sol";

