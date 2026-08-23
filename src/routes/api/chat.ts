import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { createTutorModel } from "@/lib/ai-gateway.server";
import { getAiConfig } from "@/lib/env.server";
import { buildGroundingBlock, retrieveSources } from "@/lib/retrieval.server";

type ChatBody = {
  messages: UIMessage[];
  gradeLevel?: string;
  language?: string;
};

function textOf(message: UIMessage | undefined) {
  if (!message) return "";
  return (message.parts ?? [])
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return json({ error: "AI is not configured for this app." }, 500);

        const body = (await request.json()) as ChatBody;
        const { messages } = body;
        if (!Array.isArray(messages) || messages.length === 0) {
          return json({ error: "Invalid request." }, 400);
        }

        const question = textOf(messages[messages.length - 1]);
        if (!question) return json({ error: "Empty question." }, 400);

        const sources = await retrieveSources(question);

        const gradeLevel = body.gradeLevel || "high school";
        const language = body.language || "English";

        const system = [
          "You are Aarambh, a patient tutor for students who do not have access to private tutoring.",
          `Explain at a ${gradeLevel} level, and write your entire answer in ${language} (keep technical terms and formulas in their standard form).`,
          "",
          "How to answer:",
          "1. Restate the specific confusion in one short sentence.",
          "2. Explain step by step, numbering the steps. Keep each step short and concrete.",
          "3. Use a worked example or analogy when it helps.",
          "4. End with a section titled 'Check yourself' containing one short practice question.",
          "",
          "Grounding rules:",
          "- Prefer the retrieved open textbook passages below as your source of truth.",
          "- When a statement comes from a passage, cite it inline like [1] or [2] using the numbers below.",
          "- If the passages do not cover the question, say so plainly in one line, then answer from general knowledge WITHOUT inventing citations.",
          "- Never invent a source, a formula, or a numeric result. Show the arithmetic you rely on.",
          "- Be encouraging and never condescending. Do not just give the final answer for homework-style problems; walk through the reasoning.",
          "",
          "Retrieved open textbook passages:",
          buildGroundingBlock(sources),
        ].join("\n");

        const gateway = createLovableAiGatewayProvider(apiKey);

        try {
          const result = streamText({
            model: gateway(TUTOR_MODEL),
            system,
            messages: await convertToModelMessages(messages),
            providerOptions: { lovable: { reasoning_effort: "none" } },
          });

          return result.toUIMessageStreamResponse({
            messageMetadata: () => ({
              citations: sources.map((source, index) => ({
                index: index + 1,
                title: source.title,
                source_name: source.source_name,
                source_url: source.source_url,
                license: source.license,
              })),
            }),
            onError: (error) => {
              console.error("[chat] stream error", error);
              return "The tutor could not finish that explanation. Please try again.";
            },
          });
        } catch (error) {
          console.error("[chat] gateway error", error);
          const status = (error as { statusCode?: number })?.statusCode;
          if (status === 429) {
            return json({ error: "Too many requests right now — please wait a moment." }, 429);
          }
          if (status === 402) {
            return json({ error: "AI credits are exhausted for this workspace." }, 402);
          }
          return json({ error: "The tutor is unavailable right now." }, 500);
        }
      },
    },
  },
});
