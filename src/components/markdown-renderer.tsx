"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-extrabold tracking-tight text-foreground mt-8 mb-4 pb-3 border-b border-outline/60 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-[1.6rem] font-bold text-foreground mt-8 mb-3 border-b border-outline/40 pb-2">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-bold text-foreground mt-6 mb-2">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-base font-bold text-foreground mt-5 mb-2">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="text-sm font-bold text-foreground mt-4 mb-1">
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6 className="text-sm font-semibold text-muted mt-4 mb-1">
      {children}
    </h6>
  ),
  p: ({ children }) => (
    <p className="text-base leading-relaxed text-foreground my-4 first:mt-0 last:mb-0">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-foreground">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-foreground/80">{children}</em>
  ),
  ul: ({ children }) => (
    <ul className="my-4 space-y-1.5 pl-0 list-none">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 space-y-1.5 pl-5 list-decimal">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-base leading-relaxed text-foreground pl-0">
      <span className="flex items-start gap-2.5">
        <span className="mt-[0.55rem] h-1.5 w-1.5 rounded-full bg-primary shrink-0 block" />
        <span className="flex-1 leading-relaxed">{children}</span>
      </span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-5 border-l-4 border-primary/50 bg-primary/5 pl-4 pr-3 py-3 rounded-r-xl text-foreground/80 italic">
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    const isBlock = Boolean(className?.includes("language-"));
    if (isBlock) {
      return (
        <code className={`block w-full text-sm font-mono ${className ?? ""}`}>
          {children}
        </code>
      );
    }
    return (
      <code className="inline rounded bg-surface-strong px-1.5 py-0.5 text-sm font-mono text-primary">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-5 overflow-x-auto rounded-xl bg-[#1e293b] text-slate-100 p-4 text-sm font-mono leading-relaxed shadow-inner">
      {children}
    </pre>
  ),
  hr: () => (
    <hr className="my-6 border-outline/50" />
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="my-5 overflow-x-auto rounded-xl border border-outline/60">
      <table className="w-full border-collapse text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-surface-soft text-xs font-semibold uppercase tracking-wider text-muted">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-outline/40">
      {children}
    </tbody>
  ),
  tr: ({ children }) => (
    <tr className="transition-colors hover:bg-surface-soft/50">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-3 text-left font-semibold text-muted">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 text-foreground/90">
      {children}
    </td>
  ),
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ""}
      className="my-5 max-w-full rounded-xl border border-outline/40 shadow-sm"
    />
  ),
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
