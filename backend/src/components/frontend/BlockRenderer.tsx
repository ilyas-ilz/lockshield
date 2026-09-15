import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { FAQAccordion, type FAQItem } from "./FAQAccordion";
import { QuickQuoteForm } from "./QuickQuoteForm";

export interface BlockData {
  id?: string;
  type: string;
  hidden?: boolean;
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  primaryCta?: { href: string; label: string };
  body?: unknown;
  items?: Array<{ value?: string; label?: string; q?: string; a?: string }>;
  features?: Array<{ title?: string; description?: string }>;
  [key: string]: unknown;
}

export function BlockRenderer({ blocks }: { blocks: BlockData[] | Record<string, unknown>[] }) {
  if (!blocks || blocks.length === 0) return null;

  const typedBlocks = blocks as BlockData[];

  return (
    <div className="space-y-16 py-8">
      {typedBlocks.map((block, idx) => {
        if (block.hidden) return null;
        const key = block.id ? String(block.id) : String(idx);

        switch (block.type) {
          case "hero":
            return (
              <div
                key={key}
                className="rounded-3xl bg-[#0d1220] p-8 sm:p-12 text-white relative overflow-hidden"
              >
                <div className="blueprint-grid-dark absolute inset-0 opacity-20 pointer-events-none" />
                <div className="relative z-10 max-w-2xl space-y-4">
                  {block.eyebrow && (
                    <span className="font-tech text-xs font-bold uppercase tracking-widest text-[#e01b24]">
                      {block.eyebrow}
                    </span>
                  )}
                  {block.heading && (
                    <h2 className="font-tech text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white">
                      {block.heading}
                    </h2>
                  )}
                  {block.subheading && (
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-light">
                      {block.subheading}
                    </p>
                  )}
                  {block.primaryCta && (
                    <div className="pt-2">
                      <Link
                        href={block.primaryCta.href}
                        className="btn-pill inline-flex items-center gap-2 bg-[#e01b24] py-3 text-sm font-semibold text-white hover:bg-[#b3121a] transition-all"
                      >
                        <span>{block.primaryCta.label}</span>
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );

          case "richText":
            return (
              <div key={key} className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                {block.heading && (
                  <h2 className="font-tech text-2xl sm:text-3xl font-bold uppercase tracking-tight text-gray-900 mb-4">
                    {block.heading}
                  </h2>
                )}
                {typeof block.body === "string" ? (
                  <p>{block.body}</p>
                ) : (
                  <TiptapRenderer content={block.body as TiptapNode} />
                )}
              </div>
            );

          case "stats": {
            const items = (block.items as { value?: string; label?: string }[]) || [];
            return (
              <div key={key} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {items.map((item, i: number) => (
                  <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-xs">
                    <p className="font-tech text-3xl sm:text-4xl font-extrabold text-[#e01b24]">
                      {item.value}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-gray-700 mt-1">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            );
          }

          case "featureGrid": {
            const features = (block.features as { title?: string; description?: string }[]) || [];
            return (
              <div key={key} className="space-y-6">
                {Boolean(block.heading) && (
                  <h2 className="font-tech text-2xl sm:text-3xl font-bold uppercase tracking-tight text-gray-900">
                    {String(block.heading)}
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {features.map((feat, i: number) => (
                    <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
                      <div className="size-10 rounded-xl bg-[#e01b24]/10 text-[#e01b24] flex items-center justify-center mb-4">
                        <CheckCircle2 className="size-5" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-base">{feat.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          case "faq": {
            const rawItems = (block.items as unknown as FAQItem[]) || [];
            const items: FAQItem[] = rawItems.map((it) => ({
              q: String(it.q || ""),
              a: String(it.a || ""),
            }));
            return (
              <div key={key} className="space-y-6">
                {block.heading && (
                  <h2 className="font-tech text-2xl sm:text-3xl font-bold uppercase tracking-tight text-gray-900">
                    {block.heading}
                  </h2>
                )}
                <FAQAccordion items={items} />
              </div>
            );
          }

          case "ctaBanner":
            return (
              <div
                key={key}
                className="rounded-3xl bg-gradient-to-r from-[#e01b24] to-[#b3121a] p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div>
                  <h2 className="font-tech text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">
                    {block.heading}
                  </h2>
                  {block.subheading && (
                    <p className="text-white/80 text-sm mt-1 max-w-xl">{block.subheading}</p>
                  )}
                </div>
                {block.primaryCta && (
                  <Link
                    href={block.primaryCta.href}
                    className="btn-pill inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 text-sm font-bold hover:bg-gray-100 shadow-md shrink-0 transition-colors"
                  >
                    <span>{block.primaryCta.label}</span>
                    <ArrowRight className="size-4 text-[#e01b24]" />
                  </Link>
                )}
              </div>
            );

          case "contactForm":
            return (
              <div key={key} className="max-w-2xl mx-auto">
                <QuickQuoteForm />
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

interface TiptapNode {
  type?: string;
  text?: string;
  content?: TiptapNode[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  attrs?: Record<string, unknown>;
  [key: string]: unknown;
}

function TiptapRenderer({ content }: { content: TiptapNode | TiptapNode[] | string | null | undefined }) {
  if (!content) return null;

  // Simple recursive renderer for Tiptap JSON nodes
  if (typeof content === "string") return <span>{content}</span>;

  if (Array.isArray(content)) {
    return (
      <>
        {content.map((node, i) => (
          <TiptapRenderer key={i} content={node} />
        ))}
      </>
    );
  }

  const node = content;
  if (node.type === "text") {
    let rendered: React.ReactNode = node.text;
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === "bold") rendered = <strong key="b">{rendered}</strong>;
        if (mark.type === "italic") rendered = <em key="i">{rendered}</em>;
        if (mark.type === "link") {
          const href = mark.attrs?.href ? String(mark.attrs.href) : undefined;
          rendered = (
            <a
              key="l"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#e01b24] underline hover:opacity-80"
            >
              {rendered}
            </a>
          );
        }
      }
    }
    return rendered;
  }

  if (node.type === "paragraph") {
    return (
      <p className="mb-4 text-gray-700 leading-relaxed">
        <TiptapRenderer content={node.content} />
      </p>
    );
  }

  if (node.type === "heading") {
    const level = node.attrs?.level || 2;
    if (level === 2) {
      return (
        <h2 className="font-tech text-2xl font-bold uppercase tracking-tight text-gray-900 mt-6 mb-3">
          <TiptapRenderer content={node.content} />
        </h2>
      );
    }
    if (level === 3) {
      return (
        <h3 className="font-tech text-xl font-bold uppercase tracking-tight text-gray-900 mt-5 mb-2">
          <TiptapRenderer content={node.content} />
        </h3>
      );
    }
    return (
      <h4 className="font-bold text-gray-900 mt-4 mb-2">
        <TiptapRenderer content={node.content} />
      </h4>
    );
  }

  if (node.type === "bulletList") {
    return (
      <ul className="list-disc pl-5 mb-4 space-y-1 text-gray-700">
        <TiptapRenderer content={node.content} />
      </ul>
    );
  }

  if (node.type === "orderedList") {
    return (
      <ol className="list-decimal pl-5 mb-4 space-y-1 text-gray-700">
        <TiptapRenderer content={node.content} />
      </ol>
    );
  }

  if (node.type === "listItem") {
    return (
      <li>
        <TiptapRenderer content={node.content} />
      </li>
    );
  }

  if (node.type === "blockquote") {
    return (
      <blockquote className="border-l-4 border-[#e01b24] pl-4 italic text-gray-600 my-4">
        <TiptapRenderer content={node.content} />
      </blockquote>
    );
  }

  if (node.content) {
    return <TiptapRenderer content={node.content} />;
  }

  return null;
}
