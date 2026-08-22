import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

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

export const TUTOR_MODEL = "openai/gpt-5.6-sol";
