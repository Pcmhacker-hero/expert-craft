import { useCallback, useEffect, useState } from "react";
import type { UIMessage } from "ai";

export type LocalConversation = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

export type TutorPrefs = { gradeLevel: string; language: string };

const CONVERSATIONS_KEY = "aarambh.conversations.v1";
const PREFS_KEY = "aarambh.prefs.v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — keep working in memory */
  }
}

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `c_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

/** Conversation history kept in the browser — no account required. */
export function useLocalConversations() {
  const [hydrated, setHydrated] = useState(false);
  const [conversations, setConversations] = useState<LocalConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<TutorPrefs>({
    gradeLevel: "high school",
    language: "English",
  });

  useEffect(() => {
    const stored = read<LocalConversation[]>(CONVERSATIONS_KEY, []);
    setConversations(stored);
    setActiveId(stored[0]?.id ?? null);
    setPrefs(read<TutorPrefs>(PREFS_KEY, { gradeLevel: "high school", language: "English" }));
    setHydrated(true);
  }, []);

  const persist = useCallback((next: LocalConversation[]) => {
    setConversations(next);
    write(CONVERSATIONS_KEY, next);
  }, []);

  const createConversation = useCallback(() => {
    const conversation: LocalConversation = {
      id: newId(),
      title: "New doubt",
      updatedAt: Date.now(),
      messages: [],
    };
    setConversations((current) => {
      const next = [conversation, ...current];
      write(CONVERSATIONS_KEY, next);
      return next;
    });
    setActiveId(conversation.id);
    return conversation;
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((current) => {
      const next = current.filter((item) => item.id !== id);
      write(CONVERSATIONS_KEY, next);
      setActiveId((active) => (active === id ? (next[0]?.id ?? null) : active));
      return next;
    });
  }, []);

  const saveMessages = useCallback((id: string, messages: UIMessage[]) => {
    setConversations((current) => {
      const existing = current.find((item) => item.id === id);
      if (!existing) return current;
      const firstUser = messages.find((message) => message.role === "user");
      const text = (firstUser?.parts ?? [])
        .filter((part): part is { type: "text"; text: string } => part.type === "text")
        .map((part) => part.text)
        .join(" ")
        .trim();
      const title = text ? (text.length > 60 ? `${text.slice(0, 57)}…` : text) : existing.title;
      const next = current.map((item) =>
        item.id === id ? { ...item, messages, title, updatedAt: Date.now() } : item,
      );
      next.sort((a, b) => b.updatedAt - a.updatedAt);
      write(CONVERSATIONS_KEY, next);
      return next;
    });
  }, []);

  const updatePrefs = useCallback((patch: Partial<TutorPrefs>) => {
    setPrefs((current) => {
      const next = { ...current, ...patch };
      write(PREFS_KEY, next);
      return next;
    });
  }, []);

  return {
    hydrated,
    conversations,
    activeId,
    setActiveId,
    prefs,
    updatePrefs,
    createConversation,
    deleteConversation,
    saveMessages,
  };
}
