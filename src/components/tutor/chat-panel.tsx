import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageView, type Citation } from "@/components/tutor/message-view";
import { supabase } from "@/integrations/supabase/client";

const STARTERS = [
  "I don't get why F = ma has mass in the denominator for acceleration.",
  "Explain balancing chemical equations with an example.",
  "How do I factor x² + 7x + 12?",
  "What is the difference between mean and median?",
];

function textOf(message: UIMessage) {
  return (message.parts ?? [])
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function ChatPanel({
  conversationId,
  initialMessages,
  gradeLevel,
  language,
  onExchange,
}: {
  conversationId: string;
  initialMessages: UIMessage[];
  gradeLevel: string;
  language: string;
  onExchange: () => void;
}) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: "/api/chat",
        prepareSendMessagesRequest: async ({ messages }) => {
          const { data } = await supabase.auth.getSession();
          return {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${data.session?.access_token ?? ""}`,
            },
            body: { messages, conversationId, gradeLevel, language },
          };
        },
      }),
    [conversationId, gradeLevel, language],
  );

  const { messages, sendMessage, status, error } = useChat<UIMessage>({
    id: conversationId,
    messages: initialMessages,
    transport,
    onFinish: () => onExchange(),
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    void sendMessage({ text: trimmed });
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
              <h2 className="text-xl">What are you stuck on?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Describe the exact point that confuses you. Answers are explained step by step and cite
                the open textbook passages they come from.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {STARTERS.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => submit(starter)}
                    className="rounded-lg border border-border bg-surface/60 px-4 py-3 text-left text-sm transition-colors hover:border-accent hover:bg-surface"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((message) => (
            <MessageView
              key={message.id}
              role={message.role === "user" ? "user" : "assistant"}
              content={textOf(message)}
              citations={
                message.role === "assistant"
                  ? ((message.metadata as { citations?: Citation[] } | undefined)?.citations ?? [])
                  : []
              }
            />
          ))}

          {status === "submitted" ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Looking through the open library…
            </div>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error.message || "The tutor could not answer that. Please try again."}
            </p>
          ) : null}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-border bg-background/90 px-5 py-4 sm:px-8">
        <form
          className="mx-auto flex w-full max-w-3xl items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            submit(input);
          }}
        >
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit(input);
              }
            }}
            rows={2}
            placeholder="Type your doubt… (Shift + Enter for a new line)"
            className="min-h-[56px] resize-none bg-card"
          />
          <Button type="submit" size="icon" className="size-11 shrink-0" disabled={busy || !input.trim()}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
          </Button>
        </form>
        <p className="mx-auto mt-2 w-full max-w-3xl text-xs text-muted-foreground">
          Explanations are grounded in openly licensed textbooks. Always double-check final answers.
        </p>
      </div>
    </div>
  );
}
