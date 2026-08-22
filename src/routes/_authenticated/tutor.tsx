import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import type { UIMessage } from "ai";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChatPanel } from "@/components/tutor/chat-panel";
import type { Citation } from "@/components/tutor/message-view";
import { SiteHeader } from "@/components/site-header";
import {
  createConversation,
  deleteConversation,
  getConversation,
  getProfile,
  listConversations,
  updateProfile,
} from "@/lib/tutor.functions";

const GRADES = ["middle school", "high school", "undergraduate"];
const LANGUAGES = ["English", "Hindi", "Marathi", "Tamil", "Bengali", "Spanish", "French", "Swahili"];

export const Route = createFileRoute("/_authenticated/tutor")({
  head: () => ({
    meta: [
      { title: "Your AI tutor — Aarambh" },
      {
        name: "description",
        content:
          "Ask any study doubt and get a step-by-step explanation at your level, in your language, cited from open textbooks.",
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
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);

  const fetchConversations = useServerFn(listConversations);
  const fetchMessages = useServerFn(getConversation);
  const fetchProfile = useServerFn(getProfile);
  const saveProfile = useServerFn(updateProfile);
  const newConversation = useServerFn(createConversation);
  const removeConversation = useServerFn(deleteConversation);

  const conversations = useQuery({
    queryKey: ["conversations"],
    queryFn: () => fetchConversations(),
  });

  const profile = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });

  const messages = useQuery({
    queryKey: ["messages", activeId],
    enabled: Boolean(activeId),
    queryFn: () => fetchMessages({ data: { id: activeId! } }),
  });

  const createMutation = useMutation({
    mutationFn: () => newConversation(),
    onSuccess: (conversation) => {
      setActiveId(conversation.id);
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => removeConversation({ data: { id } }),
    onSuccess: (_result, id) => {
      if (activeId === id) setActiveId(null);
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const profileMutation = useMutation({
    mutationFn: (input: { grade_level?: string; preferred_language?: string }) =>
      saveProfile({ data: input }),
    onSuccess: (row) => queryClient.setQueryData(["profile"], row),
  });

  useEffect(() => {
    if (!activeId && conversations.data && conversations.data.length > 0) {
      setActiveId(conversations.data[0]!.id);
    }
  }, [activeId, conversations.data]);

  const initialMessages: UIMessage[] = (messages.data ?? []).map((row) => ({
    id: row.id,
    role: row.role === "user" ? "user" : "assistant",
    parts: [{ type: "text", text: row.content }],
    metadata: { citations: (row.citations ?? []) as unknown as Citation[] },
  }));

  const gradeLevel = profile.data?.grade_level ?? "high school";
  const language = profile.data?.preferred_language ?? "English";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-0 px-0 sm:px-5">
        <aside className="hidden w-72 shrink-0 flex-col border-r border-border py-6 pr-5 lg:flex">
          <Button
            className="w-full justify-start"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
          >
            <Plus className="size-4" /> New doubt
          </Button>

          <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
            <p className="px-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Recent
            </p>
            <ul className="mt-2 space-y-1">
              {conversations.data?.map((conversation) => (
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
                    onClick={() => deleteMutation.mutate(conversation.id)}
                    className="rounded-md p-2 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))}
              {conversations.isLoading ? (
                <li className="px-3 py-2 text-sm text-muted-foreground">Loading…</li>
              ) : null}
              {conversations.data?.length === 0 ? (
                <li className="px-3 py-2 text-sm text-muted-foreground">No doubts yet.</li>
              ) : null}
            </ul>
          </div>

          <div className="mt-6 space-y-3 rounded-xl border border-border bg-surface/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Explain to me as
            </p>
            <Select
              value={gradeLevel}
              onValueChange={(value) => profileMutation.mutate({ grade_level: value })}
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
              value={language}
              onValueChange={(value) => profileMutation.mutate({ preferred_language: value })}
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
          </div>
        </aside>

        <main className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3 lg:hidden">
            <Button size="sm" onClick={() => createMutation.mutate()}>
              <Plus className="size-4" /> New doubt
            </Button>
            <span className="truncate text-sm text-muted-foreground">
              {conversations.data?.find((item) => item.id === activeId)?.title ?? "Ask anything"}
            </span>
          </div>

          {!activeId ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
              <Sparkles className="size-6 text-accent" />
              <h1 className="text-2xl">Start your first doubt</h1>
              <p className="max-w-sm text-sm text-muted-foreground">
                Ask about anything in maths, physics, chemistry or biology. Every explanation cites the
                open textbook passage it came from.
              </p>
              <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Start asking
              </Button>
            </div>
          ) : messages.isLoading ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" /> Loading conversation…
            </div>
          ) : (
            <div className="min-h-0 flex-1">
              <ChatPanel
                key={activeId}
                conversationId={activeId}
                initialMessages={initialMessages}
                gradeLevel={gradeLevel}
                language={language}
                onExchange={() => {
                  void queryClient.invalidateQueries({ queryKey: ["conversations"] });
                }}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
