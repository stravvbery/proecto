"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Process spoilers: ||text|| → <span class="spoiler">text</span>
  const processed = content.replace(
    /\|\|(.+?)\|\|/g,
    '<span class="dc-spoiler">$1</span>'
  );

  return (
    <div className="dc-markdown text-sm leading-relaxed" style={{ color: "#dcddde" }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-0.5">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-bold" style={{ color: "#f2f3f5" }}>
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code
                  className="block rounded p-3 text-sm my-1 overflow-x-auto"
                  style={{ backgroundColor: "#2b2d31", color: "#dcddde" }}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className="rounded px-1 py-0.5 text-sm"
                style={{ backgroundColor: "#383a40", color: "#dcddde" }}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre
              className="rounded p-0 my-1 overflow-x-auto"
              style={{ backgroundColor: "#2b2d31" }}
            >
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className="border-l-4 pl-3 my-1"
              style={{ borderColor: "#4e5058", color: "#b5bac1" }}
            >
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "#00a8fc" }}
            >
              {children}
            </a>
          ),
          h1: ({ children }) => (
            <h1
              className="text-xl font-bold mt-2 mb-1"
              style={{ color: "#f2f3f5" }}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className="text-lg font-bold mt-2 mb-1"
              style={{ color: "#f2f3f5" }}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className="text-base font-bold mt-1 mb-0.5"
              style={{ color: "#f2f3f5" }}
            >
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside my-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside my-1">{children}</ol>
          ),
          li: ({ children }) => <li className="my-0">{children}</li>,
          del: ({ children }) => (
            <del style={{ color: "#949ba4" }}>{children}</del>
          ),
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
