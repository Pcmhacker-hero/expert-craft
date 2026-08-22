import { createFileRoute, Link } from "@tanstack/react-router";
import type { UIMessage } from "ai";
import { Plus, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChatPanel } from "@/components/tutor/chat-panel";
import { SiteHeader } from "@/components/site-header";
import { useLocalConversations } from "@/hooks/use-local-conversations";

const GRADES = ["middle school", "high school", "undergraduate"];
const LANGUAGES = ["English", "Hindi", "Marathi", "Tamil", "Bengali", "Spanish", "French", "Swahili"];

export const Route = createFileRoute("/tutor")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Your AI tutor — Aarambh" },
      {
        name: "description",
        content:
          "Ask any study doubt and get a step-by-step explanation at your level, in your language, cited from open textbooks. No sign-up needed.",
      },
      { property: "og:title", content: "Your AI tutor — Aarambh" },
      {
        property: "og:description",
        content: "Step-by-step doubt solving grounded in open educational content.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TutorPage,
});

function TutorPage() {
  const {
    hydrated,
    conversations,
    activeId,
    setActiveId,
    prefs,
    updatePrefs,
    createConversation,
    deleteConversation,
    saveMessages,
  } = useLocalConversations();

  const active = conversations.find((item) => item.id === activeId) ?? null;
  const initialMessages: UIMessage[] = active?.messages ?? [];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-0 px-0 sm:px-5">
        <aside className="hidden w-72 shrink-0 flex-col border-r border-border py-6 pr-5 lg:flex">
          <Button className="w-full justify-start" onClick={() => createConversation()}>
            <Plus className="size-4" /> New doubt
          </Button>

          <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
            <p className="px-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Recent
            </p>
            <ul className="mt-2 space-y-1">
              {conversations.map((conversation) => (
                <li key={conversation.id} className="group flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveId(conversation.id)}
                    className={`flex-1 truncate rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      activeId === conversation.id
                        ? "bg-surface font-medium text-foreground"
                        : "text-muted-foreground hover:bg-surface/60 hover:text-foreground"
                    }`}
                  >
                    {conversation.title}
                  </button>
                  <button
                    type="button"
                    aria-label="Delete conversation"
                    onClick={() => deleteConversation(conversation.id)}
                    className="rounded-md p-2 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))}
              {hydrated && conversations.length === 0 ? (
                <li className="px-3 py-2 text-sm text-muted-foreground">No doubts yet.</li>
              ) : null}
            </ul>
          </div>

          <div className="mt-6 space-y-3 rounded-xl border border-border bg-surface/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Explain to me as
            </p>
            <Select
              value={prefs.gradeLevel}
              onValueChange={(value) => updatePrefs({ gradeLevel: value })}
            >
              <SelectTrigger className="bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={prefs.language}
              onValueChange={(value) => updatePrefs({ language: value })}
            >
              <SelectTrigger className="bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Link
              to="/library"
              className="block text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Browse the open library
            </Link>
            <p className="text-xs text-muted-foreground">
              Your doubts stay on this device — nothing is stored on a server.
            </p>
          </div>
        </aside>

        <main className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3 lg:hidden">
            <Button size="sm" onClick={() => createConversation()}>
              <Plus className="size-4" /> New doubt
            </Button>
            <span className="truncate text-sm text-muted-foreground">
              {active?.title ?? "Ask anything"}
            </span>
          </div>

          {!active ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
              <Sparkles className="size-6 text-accent" />
              <h1 className="text-2xl">Start your first doubt</h1>
              <p className="max-w-sm text-sm text-muted-foreground">
                Ask about anything in maths, physics, chemistry or biology. Every explanation cites the
                open textbook passage it came from.
              </p>
              <Button onClick={() => createConversation()}>Start asking</Button>
            </div>
          ) : (
            <div className="min-h-0 flex-1">
              <ChatPanel
                key={active.id}
                conversationId={active.id}
                initialMessages={initialMessages}
                gradeLevel={prefs.gradeLevel}
                language={prefs.language}
                onExchange={(messages) => saveMessages(active.id, messages)}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
