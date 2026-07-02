import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Minimal, dependency-free markdown renderer for AI-authored 繁中 reports
// (Phase 3 §3 polishedReport). Renders a safe subset entirely through React
// elements — no dangerouslySetInnerHTML, so all text stays escaped. Supported:
// #..###### headings, - / * / + bullet lists, 1. ordered lists, > blockquotes,
// --- rules, paragraphs, and inline **bold** / *italic* / `code` / [text](url).

type Block =
  | { type: 'heading'; level: number; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'quote'; lines: string[] }
  | { type: 'hr' }
  | { type: 'p'; lines: string[] };

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      i += 1;
      continue;
    }

    // Horizontal rule.
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      i += 1;
      continue;
    }

    // Heading.
    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2].trim() });
      i += 1;
      continue;
    }

    // Unordered list (consumes consecutive bullet lines).
    if (/^[-*+]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*+]\s+/, ''));
        i += 1;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    // Ordered list.
    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ''));
        i += 1;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // Blockquote.
    if (/^>\s?/.test(trimmed)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i += 1;
      }
      blocks.push({ type: 'quote', lines: quoteLines });
      continue;
    }

    // Paragraph (consumes consecutive non-blank, non-special lines).
    const paraLines: string[] = [];
    while (i < lines.length) {
      const cur = lines[i].trim();
      if (
        cur === '' ||
        /^(#{1,6})\s+/.test(cur) ||
        /^[-*+]\s+/.test(cur) ||
        /^\d+[.)]\s+/.test(cur) ||
        /^>\s?/.test(cur) ||
        /^(-{3,}|\*{3,}|_{3,})$/.test(cur)
      ) {
        break;
      }
      paraLines.push(cur);
      i += 1;
    }
    if (paraLines.length > 0) blocks.push({ type: 'p', lines: paraLines });
  }

  return blocks;
}

// Inline: **bold**, *italic* / _italic_, `code`, [text](url). Applied left→right.
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*|_[^_]+_)/g;
  const out: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${idx++}`;

    if (token.startsWith('**')) {
      out.push(
        <strong key={key} className="font-semibold text-slate-900">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('`')) {
      out.push(
        <code key={key} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em]">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('[')) {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (link) {
        out.push(
          <a
            key={key}
            href={link[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-700 hover:underline"
          >
            {link[1]}
          </a>,
        );
      } else {
        out.push(token);
      }
    } else {
      // *italic* or _italic_
      out.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const HEADING_CLASSES: Record<number, string> = {
  1: 'text-lg font-bold text-slate-900',
  2: 'text-base font-bold text-slate-900',
  3: 'text-sm font-semibold text-slate-900',
  4: 'text-sm font-semibold text-slate-700',
  5: 'text-xs font-semibold text-slate-700',
  6: 'text-xs font-semibold text-slate-600',
};

function Heading({ level, children }: { level: number; children: ReactNode }) {
  const className = HEADING_CLASSES[level] ?? HEADING_CLASSES[3];
  switch (level) {
    case 1:
      return <h2 className={className}>{children}</h2>;
    case 2:
      return <h3 className={className}>{children}</h3>;
    case 3:
      return <h4 className={className}>{children}</h4>;
    case 4:
      return <h5 className={className}>{children}</h5>;
    default:
      return <h6 className={className}>{children}</h6>;
  }
}

function inlineLines(lines: string[], keyPrefix: string): ReactNode[] {
  return lines.flatMap((line, i) => {
    const rendered = renderInline(line, `${keyPrefix}-${i}`);
    return i < lines.length - 1
      ? [...rendered, <br key={`${keyPrefix}-br-${i}`} />]
      : rendered;
  });
}

export function Markdown({ content, className }: { content: string; className?: string }) {
  const blocks = parseBlocks(content);

  return (
    <div
      data-testid="markdown"
      className={cn('flex flex-col gap-3 text-sm leading-relaxed text-slate-700', className)}
    >
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return (
              <Heading key={i} level={block.level}>
                {renderInline(block.text, `h${i}`)}
              </Heading>
            );
          case 'ul':
            return (
              <ul key={i} className="list-inside list-disc space-y-1">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item, `ul${i}-${j}`)}</li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={i} className="list-inside list-decimal space-y-1">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item, `ol${i}-${j}`)}</li>
                ))}
              </ol>
            );
          case 'quote':
            return (
              <blockquote
                key={i}
                className="border-l-2 border-slate-300 pl-3 text-slate-600 italic"
              >
                {inlineLines(block.lines, `q${i}`)}
              </blockquote>
            );
          case 'hr':
            return <hr key={i} className="border-slate-200" />;
          case 'p':
          default:
            return (
              <p key={i} className="whitespace-pre-wrap">
                {inlineLines(block.lines, `p${i}`)}
              </p>
            );
        }
      })}
    </div>
  );
}
