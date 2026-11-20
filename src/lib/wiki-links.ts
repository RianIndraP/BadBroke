import type { Link, Root, Text } from 'mdast';
import { visit } from 'unist-util-visit';

export interface WikiLink {
  target: string;
  label?: string;
}

export interface WikiLinkResolver {
  (target: string): { href: string; title: string } | null;
}

const WIKI_LINK_RE = /\[\[([^\[\]|]+?)(?:\|([^\[\]]+?))?\]\]/g;

export function parseWikiLinks(body: string): WikiLink[] {
  const links: WikiLink[] = [];
  let fence: { char: string; length: number } | null = null;

  for (const rawLine of body.split(/\r?\n/)) {
    const fenceMatch = rawLine.match(/^\s*(`{3,}|~{3,})/);

    if (fence) {
      if (
        fenceMatch &&
        fenceMatch[1][0] === fence.char &&
        fenceMatch[1].length >= fence.length
      ) {
        fence = null;
      }
      continue;
    }

    if (fenceMatch) {
      fence = { char: fenceMatch[1][0], length: fenceMatch[1].length };
      continue;
    }

    const line = rawLine.replace(/(`+)([\s\S]*?)\1/g, '');

    for (const match of line.matchAll(WIKI_LINK_RE)) {
      const target = match[1].trim();
      if (!target) continue;

      const label = match[2]?.trim();
      links.push(label ? { target, label } : { target });
    }
  }

  return links;
}

export function remarkWikiLinks(options: { resolve: WikiLinkResolver }) {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (parent == null || index == null) return;
      if (parent.type === 'link' || parent.type === 'linkReference') return;

      const matches = [...node.value.matchAll(WIKI_LINK_RE)];
      if (matches.length === 0) return;

      const children: (Text | Link)[] = [];
      let cursor = 0;

      for (const match of matches) {
        const start = match.index ?? 0;
        const before = node.value.slice(cursor, start);
        if (before) children.push({ type: 'text', value: before });

        const target = match[1].trim();
        const label = match[2]?.trim();
        const resolved = target ? options.resolve(target) : null;

        if (resolved) {
          children.push({
            type: 'link',
            url: resolved.href,
            children: [{ type: 'text', value: label || resolved.title }],
          });
        } else {
          children.push({ type: 'text', value: match[0] });
        }

        cursor = start + match[0].length;
      }

      const after = node.value.slice(cursor);
      if (after) children.push({ type: 'text', value: after });

      parent.children.splice(index, 1, ...children);
      return index + children.length;
    });
  };
}
