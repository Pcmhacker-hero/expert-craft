import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type SourceDoc = {
  id: string;
  subject: string;
  topic: string;
  title: string;
  body: string;
  source_name: string;
  source_url: string;
  license: string;
};

const STOPWORDS = new Set([
  "what","why","how","when","where","which","who","the","a","an","is","are","was","were","do","does",
  "did","can","could","should","would","i","me","my","you","your","it","this","that","these","those",
  "of","in","on","for","to","and","or","but","with","about","please","explain","tell","help","understand",
  "solve","between","difference","concept","question","doubt","again","not","dont","don't","get","got",
]);

function serverSupabase() {
  const env = getSupabaseServerEnv();
  if (!env) return null;
  const { url, key } = env;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/** Keyword retrieval over the open textbook library. */
export async function retrieveSources(question: string, limit = 4): Promise<SourceDoc[]> {
  const terms = question
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word))
    .slice(0, 12);

  const columns = "id, subject, topic, title, body, source_name, source_url, license";
  const supabase = serverSupabase();

  if (terms.length > 0) {
    const { data, error } = await supabase
      .from("source_documents")
      .select(columns)
      .textSearch("search_vector", terms.join(" | "), { config: "english" })
      .limit(limit);
    if (!error && data && data.length > 0) return data as SourceDoc[];
  }

  const { data } = await supabase.from("source_documents").select(columns).limit(limit);
  return (data ?? []) as SourceDoc[];
}

export function buildGroundingBlock(docs: SourceDoc[]) {
  if (docs.length === 0) return "No matching passages were retrieved from the open library.";
  return docs
    .map(
      (doc, index) =>
        `[${index + 1}] ${doc.title} — ${doc.subject} / ${doc.topic} (${doc.source_name}, ${doc.license})\n${doc.body}`,
    )
    .join("\n\n");
}
