import { createFileRoute } from "@tanstack/react-router";

import { getAiConfig, getSupabaseServerEnv } from "@/lib/env.server";

/**
 * Diagnostics endpoint: reports which AI provider/model this deployment
 * resolved, and makes one tiny live call so provider errors are visible.
 * It never returns the API key itself.
 */
export const Route = createFileRoute("/api/public/ai-check")({
  server: {
    handlers: {
      GET: async () => {
        const config = getAiConfig();
        const supabase = getSupabaseServerEnv();
        const base = {
          provider: config?.kind ?? null,
          model: config?.model ?? null,
          libraryConfigured: Boolean(supabase),
        };

        if (!config) {
          return Response.json(
            { ...base, ok: false, reason: "No AI key found (GEMINI_API_KEY / LOVABLE_API_KEY / OPENAI_API_KEY)." },
            { status: 500 },
          );
        }

        const endpoints: Record<typeof config.kind, string> = {
          lovable: "https://ai.gateway.lovable.dev/v1/chat/completions",
          gemini: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
          openai: "https://api.openai.com/v1/chat/completions",
        };

        const headers: Record<string, string> = { "content-type": "application/json" };
        if (config.kind === "lovable") headers["Lovable-API-Key"] = config.apiKey;
        else headers["Authorization"] = `Bearer ${config.apiKey}`;

        try {
          const response = await fetch(endpoints[config.kind], {
            method: "POST",
            headers,
            body: JSON.stringify({
              model: config.model,
              messages: [{ role: "user", content: "Say OK." }],
            }),
          });
          const text = await response.text();
          return Response.json({
            ...base,
            ok: response.ok,
            status: response.status,
            body: text.slice(0, 800),
          });
        } catch (error) {
          return Response.json(
            { ...base, ok: false, reason: error instanceof Error ? error.message : String(error) },
            { status: 500 },
          );
        }
      },
    },
  },
});
