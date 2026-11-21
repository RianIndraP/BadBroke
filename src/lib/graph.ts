import { parseWikiLinks } from './wiki-links';

export interface NoteInput {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  body: string;
  draft: boolean;
}

export interface GraphNode {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  degree: number;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface LinkError {
  file: string;
  target: string;
  reason: 'missing' | 'draft' | 'self';
}

export function buildGraph(notes: NoteInput[]): {
  nodes: GraphNode[];
  edges: GraphEdge[];
} {
  const published = notes.filter((note) => !note.draft);
  const publishedIds = new Set(published.map((note) => note.id));
  const degree = new Map(published.map((note) => [note.id, 0]));
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();

  for (const note of published) {
    for (const link of parseWikiLinks(note.body)) {
      if (link.target === note.id || !publishedIds.has(link.target)) continue;

      const [source, target] = [note.id, link.target].sort();
      const key = `${source}\u0000${target}`;
      if (seen.has(key)) continue;

      seen.add(key);
      edges.push({ source, target });
      degree.set(source, (degree.get(source) ?? 0) + 1);
      degree.set(target, (degree.get(target) ?? 0) + 1);
    }
  }

  edges.sort(
    (a, b) =>
      a.source.localeCompare(b.source) || a.target.localeCompare(b.target),
  );

  return {
    nodes: published.map(({ id, title, summary, tags }) => ({
      id,
      title,
      summary,
      tags,
      degree: degree.get(id) ?? 0,
    })),
    edges,
  };
}

export function selectLabelledNodes(
  nodes: GraphNode[],
  limit = 10,
): GraphNode[] {
  return [...nodes]
    .filter((node) => node.degree > 0)
    .sort(
      (a, b) => b.degree - a.degree || a.title.localeCompare(b.title, 'id'),
    )
    .slice(0, Math.max(0, limit));
}

export function findBacklinks(notes: NoteInput[], id: string): NoteInput[] {
  return notes.filter(
    (note) =>
      !note.draft &&
      note.id !== id &&
      parseWikiLinks(note.body).some((link) => link.target === id),
  );
}

export function findRelated(
  notes: NoteInput[],
  note: NoteInput,
  limit = 4,
): NoteInput[] {
  if (limit <= 0) return [];

  const published = notes.filter((item) => !item.draft);
  const linked = new Set(parseWikiLinks(note.body).map((link) => link.target));

  for (const other of published) {
    if (other.id !== note.id && parseWikiLinks(other.body).some((link) => link.target === note.id)) {
      linked.add(other.id);
    }
  }

  const ownTags = new Set(note.tags);

  return published
    .filter((item) => item.id !== note.id && !linked.has(item.id))
    .map((item) => ({
      note: item,
      shared: new Set(item.tags.filter((tag) => ownTags.has(tag))).size,
    }))
    .filter((item) => item.shared > 0)
    .sort(
      (a, b) =>
        b.shared - a.shared || a.note.title.localeCompare(b.note.title, 'id'),
    )
    .slice(0, limit)
    .map((item) => item.note);
}

export function validateWikiLinks(notes: NoteInput[]): LinkError[] {
  const byId = new Map(notes.map((note) => [note.id, note]));
  const errors: LinkError[] = [];
  const seen = new Set<string>();

  for (const note of notes) {
    if (note.draft) continue;

    for (const link of parseWikiLinks(note.body)) {
      let reason: LinkError['reason'] | null = null;

      if (link.target === note.id) {
        reason = 'self';
      } else {
        const target = byId.get(link.target);
        if (!target) reason = 'missing';
        else if (target.draft) reason = 'draft';
      }

      if (!reason) continue;

      const key = `${note.id}\u0000${link.target}\u0000${reason}`;
      if (seen.has(key)) continue;

      seen.add(key);
      errors.push({ file: note.id, target: link.target, reason });
    }
  }

  return errors.sort(
    (a, b) =>
      a.file.localeCompare(b.file) ||
      a.target.localeCompare(b.target) ||
      a.reason.localeCompare(b.reason),
  );
}
