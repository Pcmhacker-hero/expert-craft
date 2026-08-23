import { createServerFn } from "@tanstack/react-start";

export const listLibrary = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const { getSupabaseServerEnv } = await import("./env.server");
  const env = getSupabaseServerEnv();
  if (!env) return [];
  const { url, key } = env;

  const supabase = createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });

  const { data, error } = await supabase
    .from("source_documents")
    .select("id, subject, topic, title, body, source_name, source_url, license")
    .order("subject", { ascending: true })
    .order("topic", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Array<{
    id: string;
    subject: string;
    topic: string;
    title: string;
    body: string;
    source_name: string;
    source_url: string;
    license: string;
  }>;
});
