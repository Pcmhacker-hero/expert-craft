import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, LogOut, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
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
          {loading ? null : session ? (
            <>
              <Button asChild size="sm" variant="secondary">
                <Link to="/tutor">
                  <BookOpen className="size-4" /> My doubts
                </Link>
              </Button>
              <Button size="sm" variant="ghost" onClick={signOut} aria-label="Sign out">
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Start free
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
