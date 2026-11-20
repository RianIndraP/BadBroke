import type { CollectionEntry } from 'astro:content';
import {
  validateWikiLinks,
  type LinkError,
  type NoteInput,
} from './graph';

export type NoteEntry = CollectionEntry<'catatan'>;

export interface Note extends NoteInput {
  date: Date;
  updated?: Date;
  readingMinutes: number;
}

export interface PrepareOptions {
  includeDrafts?: boolean;
  strict?: boolean;
}

const WORDS_PER_MINUTE = 200;

const longDate = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const shortDate = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const reasonLabel: Record<LinkError['reason'], string> = {
  missing: 'target tidak ditemukan',
  draft: 'menunjuk catatan draft',
  self: 'menunjuk diri sendiri',
};

export function readingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} menit baca`;
}

export function formatDate(date: Date): string {
  return longDate.format(date);
}

export function formatShortDate(date: Date): string {
  return shortDate.format(date);
}

export function formatTag(tag: string): string {
  const words = tag.replace(/-+/g, ' ').trim();
  if (!words) return '';

  return words.charAt(0).toUpperCase() + words.slice(1);
}

function compareNotes(a: Note, b: Note): number {
  return (
    b.date.getTime() - a.date.getTime() ||
    a.title.localeCompare(b.title, 'id')
  );
}

export function groupByYear(
  notes: Note[],
): { year: number; notes: Note[] }[] {
  const groups = new Map<number, Note[]>();

  for (const note of [...notes].sort(compareNotes)) {
    const year = note.date.getUTCFullYear();
    const group = groups.get(year);

    if (group) group.push(note);
    else groups.set(year, [note]);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, items]) => ({ year, notes: items }));
}

export function collectTags(notes: Note[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();

  for (const note of notes) {
    for (const tag of note.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort(
      (a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'id'),
    );
}

export function assertValidNotes(notes: Note[]): void {
  const linkErrors = validateWikiLinks(notes);

  if (linkErrors.length > 0) {
    const lines = linkErrors.map(
      (error) =>
        `- ${error.file}: [[${error.target}]] (${reasonLabel[error.reason]})`,
    );

    throw new Error(
      ['Build dihentikan: tautan catatan tidak valid.', ...lines].join('\n'),
    );
  }

  const byTitle = new Map<string, string[]>();

  for (const note of notes) {
    if (note.draft) continue;
    const files = byTitle.get(note.title) ?? [];
    files.push(note.id);
    byTitle.set(note.title, files);
  }

  const duplicates = [...byTitle.entries()].filter(
    ([, files]) => files.length > 1,
  );

  if (duplicates.length > 0) {
    const lines = duplicates.map(
      ([title, files]) => `- "${title}": ${files.join(', ')}`,
    );

    throw new Error(
      ['Build dihentikan: judul catatan harus unik.', ...lines].join('\n'),
    );
  }
}

function toNote(entry: NoteEntry): Note {
  const body = entry.body ?? '';

  return {
    id: entry.id,
    title: entry.data.title,
    summary: entry.data.summary,
    tags: entry.data.tags,
    draft: entry.data.draft,
    body,
    date: entry.data.date,
    updated: entry.data.updated,
    readingMinutes: readingMinutes(body),
  };
}

export function prepareNotes(
  entries: NoteEntry[],
  options: PrepareOptions = {},
): Note[] {
  const { includeDrafts = false, strict = false } = options;
  const notes = entries.map(toNote);

  if (strict) assertValidNotes(notes);

  return notes
    .filter((note) => includeDrafts || !note.draft)
    .sort(compareNotes);
}
