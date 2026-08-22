import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalLink } from "lucide-react";

export type Citation = {
  index: number;
  title: string;
  source_name: string;
  source_url: string;
  license: string;
};

export function MessageView({
  role,
  content,
  citations,
}: {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
}) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm text-primary-foreground shadow-sm">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-border bg-card px-5 py-4 text-sm shadow-sm">
        <div className="prose-tutor">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "…"}</ReactMarkdown>
        </div>
      </div>

      {citations && citations.length > 0 ? (
        <div className="max-w-[92%] rounded-xl border border-dashed border-border bg-surface/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Sources used
          </p>
          <ul className="mt-2 space-y-1.5">
            {citations.map((citation) => (
              <li key={citation.index} className="text-xs leading-relaxed">
                <span className="mr-1 font-mono text-highlight">[{citation.index}]</span>
                <a
                  href={citation.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-border underline-offset-2 hover:decoration-foreground"
                >
                  {citation.title}
                </a>
                <span className="text-muted-foreground">
                  {" "}
                  — {citation.source_name} · {citation.license}
                </span>
                <ExternalLink className="ml-1 inline size-3 text-muted-foreground" />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
