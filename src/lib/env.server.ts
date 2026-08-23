/**
 * Server-side env resolution.
 *
 * On Lovable hosting these are injected automatically. On an external host
 * (Vercel, Netlify, a VPS…) they must be set in the project's env settings,
 * so we also accept the VITE_-prefixed names to avoid duplicate config.
 */
function pick(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return undefined;
}

export function getSupabaseServerEnv() {
  const url = pick("SUPABASE_URL", "VITE_SUPABASE_URL");
  const key = pick(
    "SUPABASE_PUBLISHABLE_KEY",
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_ANON_KEY",
  );
  if (!url || !key) return null;
  return { url, key };
}

export type AiConfig =
  | { kind: "lovable"; apiKey: string; model: string }
  | { kind: "gemini"; apiKey: string; model: string }
  | { kind: "openai"; apiKey: string; model: string };

export function getAiConfig(): AiConfig | null {
  const lovableKey = pick("LOVABLE_API_KEY");
  if (lovableKey) {
    return {
      kind: "lovable",
      apiKey: lovableKey,
      model: pick("AI_MODEL") ?? "openai/gpt-5.6-sol",
    };
  }

  // Bring-your-own Google AI Studio key (https://aistudio.google.com/apikey)
  const geminiKey = pick("GEMINI_API_KEY", "GOOGLE_GENERATIVE_AI_API_KEY");
  if (geminiKey) {
    return {
      kind: "gemini",
      apiKey: geminiKey,
      model: pick("AI_MODEL") ?? "gemini-2.5-flash",
    };
  }

  const openaiKey = pick("OPENAI_API_KEY");
  if (openaiKey) {
    return {
      kind: "openai",
      apiKey: openaiKey,
      model: pick("AI_MODEL") ?? "gpt-4o-mini",
    };
  }

  return null;
}

