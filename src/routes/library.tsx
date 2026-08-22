import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { ExternalLink, Loader2, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/site-header";
import { listLibrary } from "@/lib/library.functions";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Open textbook library — Aarambh" },
      {
        name: "description",
        content:
          "Browse the openly licensed textbook passages in maths, physics, chemistry and biology that ground every Aarambh tutor explanation.",
      },
      { property: "og:title", content: "Open textbook library — Aarambh" },
      {
        property: "og:description",
        content: "Openly licensed passages that ground every tutor explanation, with links to source.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: () => (
    <main className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="text-2xl">The library could not load</h1>
      <p className="mt-2 text-sm text-muted-foreground">Please refresh the page to try again.</p>
    </main>
  ),
  component: LibraryPage,
});

function LibraryPage() {
  const fetchLibrary = useServerFn(listLibrary);
  const [query, setQuery] = useState("");
  const library = useQuery({ queryKey: ["library"], queryFn: () => fetchLibrary() });

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return library.data ?? [];
    return (library.data ?? []).filter((doc) =>
      `${doc.title} ${doc.subject} ${doc.topic} ${doc.body}`.toLowerCase().includes(needle),
    );
  }, [library.data, query]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-5 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Knowledge base
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl">The open textbook library</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Every explanation the tutor gives is grounded in these openly licensed passages, and each
          answer links back to the passage it used. Nothing here is behind a paywall.
        </p>

        <div className="relative mt-8 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search topics, e.g. photosynthesis"
            className="bg-card pl-9"
          />
        </div>

        {library.isLoading ? (
          <p className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading passages…
          </p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {filtered.map((doc) => (
              <article
                key={doc.id}
                className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                  <span className="rounded-full bg-surface px-2 py-0.5 text-highlight">{doc.subject}</span>
                  <span>{doc.topic}</span>
                </div>
                <h2 className="mt-3 text-lg leading-snug">{doc.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{doc.body}</p>
                <a
                  href={doc.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium underline underline-offset-4"
                >
                  {doc.source_name} · {doc.license}
                  <ExternalLink className="size-3" />
                </a>
              </article>
            ))}
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">No passages match that search yet.</p>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
