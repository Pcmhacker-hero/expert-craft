import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import logoMark from "@/assets/logo-aarambh.png";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-5">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src={logoMark}
            alt=""
            width={30}
            height={30}
            className="size-[30px] shrink-0 object-contain"
          />
          <span className="font-display text-lg font-semibold tracking-tight">Aarambh</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
          <Link to="/library" className="transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            Open library
          </Link>
          <Link to="/tutor" className="transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            Tutor
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="sm">
            <Link to="/tutor">
              <BookOpen className="size-4" /> Ask a doubt
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
