import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Languages,
  LineChart,
  Quote,
  Sparkles,
  GraduationCap,
  ShieldCheck,
  Globe2,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { Reveal } from "@/components/reveal";
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

const STATS = [
  { value: "100%", label: "Answers traced to a source passage" },
  { value: "4", label: "Subjects seeded from open textbooks" },
  { value: "10+", label: "Languages the tutor explains in" },
  { value: "₹0", label: "Cost to the student, always" },
];

const CAPABILITIES = [
  {
    icon: GraduationCap,
    title: "Grade-aware explanations",
    body: "Set the grade once and every explanation is re-pitched — vocabulary, depth and the amount of algebra shown.",
  },
  {
    icon: Globe2,
    title: "Think in your language",
    body: "Ask in Hindi, get the working in Hindi, with the technical terms kept in English so the exam still makes sense.",
  },
  {
    icon: ShieldCheck,
    title: "Grounded, not guessed",
    body: "Retrieval runs before generation. If the library has nothing relevant, the tutor says so instead of inventing an answer.",
  },
  {
    icon: BookOpen,
    title: "An open library you can read",
    body: "Every source passage is browsable on its own page, so a student can check the tutor's homework.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteHeader />

      <main>
        {/* HERO */}
        <section className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="aurora left-[-10%] top-[-12%] size-[520px] bg-accent/40" />
            <div
              className="aurora right-[-14%] top-[6%] size-[460px] bg-highlight/35"
              style={{ animationDelay: "-6s" }}
            />
            <div
              className="aurora bottom-[-24%] left-[28%] size-[520px] bg-primary/20"
              style={{ animationDelay: "-12s" }}
            />
          </div>

          <div className="scene-3d mx-auto grid w-full max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-[1.05fr_1fr] lg:py-36">
            <div className="rise-in">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
                <Sparkles className="size-3.5 text-accent" />
                AI for equitable education access
              </span>

              <h1 className="mt-7 text-5xl leading-[1.03] sm:text-6xl lg:text-7xl">
                A tutor that shows
                <br />
                its working — and{" "}
                <span className="shimmer-text">its sources</span>.
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Aarambh takes a student's actual doubt, finds the relevant passage in open
                educational content, and walks through the reasoning step by step. Free, cited, and
                in the language the student thinks in.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="group h-12 px-7 text-base lift-3d">
                  <Link to="/tutor">
                    Ask your first doubt
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-7 text-base lift-3d">
                  <Link to="/library">See the open library</Link>
                </Button>
              </div>

              <dl className="mt-14 grid max-w-xl grid-cols-2 gap-6 sm:grid-cols-4">
                {STATS.map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-display text-3xl text-foreground">{stat.value}</dt>
                    <dd className="mt-1 text-xs leading-snug text-muted-foreground">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative float-slow">
              <div className="pointer-events-none absolute -inset-10 -z-10 spin-slow rounded-full bg-[conic-gradient(from_0deg,color-mix(in_oklab,var(--color-accent)_35%,transparent),transparent_40%,color-mix(in_oklab,var(--color-highlight)_30%,transparent),transparent_75%)] opacity-60 blur-3xl" />
              <div className="tilt-card overflow-hidden rounded-3xl border border-border bg-card">
                <img
                  src={heroImage}
                  alt="An open textbook with diagrams of a triangle, a molecule and a wave rising from its pages"
                  width={1280}
                  height={960}
                  className="w-full"
                />
              </div>

              <div className="absolute -left-6 bottom-10 hidden rounded-2xl border border-border bg-card/90 px-4 py-3 shadow-lg backdrop-blur sm:block lift-3d">
                <p className="font-mono text-[11px] uppercase tracking-wider text-highlight">
                  Source [2]
                </p>
                <p className="mt-1 text-sm">OpenStax · Physics, §4.3</p>
              </div>

              <div className="absolute -right-4 top-8 hidden rounded-2xl border border-border bg-card/90 px-4 py-3 shadow-lg backdrop-blur sm:block lift-3d">
                <p className="text-sm font-medium">Step 2 of 4</p>
                <p className="mt-1 text-xs text-muted-foreground">Resolve forces along the incline</p>
              </div>
            </div>
          </div>
        </section>

        {/* PILLARS */}
        <section className="border-y border-border bg-surface/50">
          <div className="scene-3d mx-auto grid w-full max-w-7xl gap-8 px-6 py-24 sm:grid-cols-3">
            {PILLARS.map((pillar, i) => (
              <Reveal
                key={pillar.title}
                delay={i * 120}
                variant="up"
                className="lift-3d rounded-2xl border border-border bg-card/70 p-7 backdrop-blur"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <pillar.icon className="size-5" />
                </span>
                <h2 className="mt-5 text-2xl leading-snug">{pillar.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CAPABILITIES */}
        <section className="mx-auto w-full max-w-7xl px-6 py-24">
          <Reveal className="max-w-2xl" variant="left">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Built for classrooms that are short on time
            </p>
            <h2 className="mt-4 text-4xl leading-tight sm:text-5xl">
              Everything a student needs, nothing they have to pay for.
            </h2>
          </Reveal>

          <div className="scene-3d mt-14 grid gap-6 sm:grid-cols-2">
            {CAPABILITIES.map((item, i) => (
              <Reveal
                key={item.title}
                delay={i * 110}
                variant={i % 2 === 0 ? "left" : "right"}
                className="lift-3d rounded-2xl border border-border bg-card p-8"
              >
                <item.icon className="size-6 text-highlight" />
                <h3 className="mt-5 text-xl leading-snug">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="border-t border-border bg-surface/40">
          <div className="mx-auto w-full max-w-7xl px-6 py-24">
            <Reveal variant="up">
              <h2 className="text-4xl sm:text-5xl">How a doubt gets answered</h2>
            </Reveal>
            <ol className="scene-3d mt-12 grid gap-6 sm:grid-cols-3">
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
              ].map((item, i) => (
                <Reveal
                  as="li"
                  key={item.step}
                  delay={i * 140}
                  variant="zoom"
                  className="lift-3d rounded-2xl border border-border bg-card p-8"
                >
                  <span className="font-mono text-xs text-highlight">{item.step}</span>
                  <h3 className="mt-4 text-xl leading-snug">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section className="relative isolate overflow-hidden border-t border-border">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="aurora left-[20%] top-[-40%] size-[420px] bg-accent/35" />
            <div
              className="aurora right-[10%] bottom-[-50%] size-[380px] bg-highlight/30"
              style={{ animationDelay: "-9s" }}
            />
          </div>
          <Reveal
            variant="zoom"
            className="mx-auto flex w-full max-w-7xl flex-col items-start gap-8 px-6 py-24 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl">
                Free tutoring shouldn't depend on the postcode.
              </h2>
              <p className="mt-3 max-w-lg text-base text-muted-foreground">
                Create an account to keep your conversation history and set your language and grade.
              </p>
            </div>
            <Button asChild size="lg" className="h-12 px-8 text-base lift-3d">
              <Link to="/tutor">Get started</Link>
            </Button>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-10 text-xs text-muted-foreground">
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
