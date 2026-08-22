import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Languages, LineChart, Quote } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import heroImage from "@/assets/hero-tutor.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aarambh — AI tutoring grounded in open textbooks" },
      {
        name: "description",
        content:
          "Aarambh answers student doubts step by step from openly licensed textbooks, in your language, and shows teachers who needs help first.",
      },
      { property: "og:title", content: "Aarambh — AI tutoring grounded in open textbooks" },
      {
        property: "og:description",
        content:
          "Cited, step-by-step doubt solving from open educational content, with a teacher view of where students are stuck.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const PILLARS = [
  {
    icon: Quote,
    title: "Every answer is cited",
    body: "The tutor retrieves passages from openly licensed textbooks before it explains, and links each step back to the passage it used. No invented physics.",
  },
  {
    icon: Languages,
    title: "Explained at your level",
    body: "Pick your grade and your language. The same concept is re-explained for middle school or undergraduate study, in English, Hindi, Tamil and more.",
  },
  {
    icon: LineChart,
    title: "Teachers see the pattern",
    body: "Repeated doubts roll up by topic, so a teacher can tell in a glance which concept the class actually lost — not just who scored badly.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              AI for equitable education access
            </p>
            <h1 className="mt-5 text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
              A tutor that shows its working — and its sources.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              Aarambh takes a student's actual doubt, finds the relevant passage in open educational
              content, and walks through the reasoning step by step. Free, cited, and in the language
              the student thinks in.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link to="/tutor">Ask your first doubt</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/library">See the open library</Link>
              </Button>
            </div>
          </div>

          <img
            src={heroImage}
            alt="An open textbook with diagrams of a triangle, a molecule and a wave rising from its pages"
            width={1280}
            height={960}
            className="w-full rounded-2xl border border-border shadow-sm"
          />
        </section>

        <section className="border-y border-border bg-surface/50">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-16 sm:grid-cols-3">
            {PILLARS.map((pillar) => (
              <div key={pillar.title}>
                <pillar.icon className="size-5 text-accent" />
                <h2 className="mt-4 text-xl leading-snug">{pillar.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-16">
          <h2 className="text-3xl">How a doubt gets answered</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "You describe the confusion",
                body: "Not just the question — the part that doesn't click. The tutor works from that.",
              },
              {
                step: "02",
                title: "It searches open content",
                body: "Relevant passages from OpenStax and similar open textbooks are retrieved first.",
              },
              {
                step: "03",
                title: "It explains, with citations",
                body: "A worked, step-by-step explanation, each claim traceable to a numbered source.",
              },
            ].map((item) => (
              <li key={item.step} className="rounded-xl border border-border bg-card p-6">
                <span className="font-mono text-xs text-highlight">{item.step}</span>
                <h3 className="mt-3 text-lg leading-snug">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-5 py-16 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl">Free tutoring shouldn't depend on the postcode.</h2>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                Create an account to keep your conversation history and set your language and grade.
              </p>
            </div>
            <Button asChild size="lg">
              <Link to="/auth">Get started</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-xs text-muted-foreground">
          <p>Aarambh — grounded AI tutoring on open educational content.</p>
          <div className="flex items-center gap-4">
            <Link to="/library" className="inline-flex items-center gap-1.5 hover:text-foreground">
              <BookOpen className="size-3.5" /> Library
            </Link>
            <Link to="/tutor" className="hover:text-foreground">
              Tutor
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
