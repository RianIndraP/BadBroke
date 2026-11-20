import type { CollectionEntry } from 'astro:content';
import { describe, expect, it } from 'vitest';
import {
  collectTags,
  formatDate,
  formatReadingTime,
  formatShortDate,
  formatTag,
  groupByYear,
  prepareNotes,
  readingMinutes,
  type Note,
} from '../src/lib/notes';

type Entry = CollectionEntry<'catatan'>;

const entry = (
  id: string,
  data: Partial<Entry['data']> = {},
  body = '',
): Entry =>
  ({
    id,
    collection: 'catatan',
    data: {
      title: `Catatan ${id}`,
      summary: 'Ringkasan yang cukup panjang untuk memenuhi schema.',
      date: new Date('2026-11-19T00:00:00Z'),
      tags: ['web'],
      draft: false,
      ...data,
    },
    body,
  }) as Entry;

const note = (id: string, overrides: Partial<Note> = {}): Note => ({
  id,
  title: `Catatan ${id}`,
  summary: `Ringkasan ${id}.`,
  tags: [],
  body: '',
  draft: false,
  date: new Date('2026-11-19T00:00:00Z'),
  readingMinutes: 1,
  ...overrides,
});

describe('readingMinutes', () => {
  it('membulatkan ke atas dengan 200 kata per menit', () => {
    expect(readingMinutes(Array.from({ length: 400 }, () => 'kata').join(' '))).toBe(2);
    expect(readingMinutes(Array.from({ length: 401 }, () => 'kata').join(' '))).toBe(3);
  });

  it('memberi minimal satu menit untuk isi kosong', () => {
    expect(readingMinutes('')).toBe(1);
  });
});

describe('formatReadingTime', () => {
  it('menulis menit baca', () => {
    expect(formatReadingTime(4)).toBe('4 menit baca');
  });
});

describe('format tanggal', () => {
  it('memakai nama bulan Indonesia', () => {
    const date = new Date('2026-11-19T00:00:00Z');

    expect(formatDate(date)).toBe('19 November 2026');
    expect(formatShortDate(date)).toBe('19 Nov 2026');
  });
});

describe('formatTag', () => {
  it('mengubah kebab-case menjadi kalimat', () => {
    expect(formatTag('desain-produk')).toBe('Desain produk');
    expect(formatTag('web')).toBe('Web');
  });
});

describe('groupByYear', () => {
  it('mengurutkan tahun dan catatan dari yang terbaru', () => {
    const notes = [
      note('a', { date: new Date('2025-01-01T00:00:00Z') }),
      note('b', { date: new Date('2026-01-01T00:00:00Z') }),
      note('c', { date: new Date('2026-06-01T00:00:00Z') }),
    ];

    const groups = groupByYear(notes);

    expect(groups.map((group) => group.year)).toEqual([2026, 2025]);
    expect(groups[0].notes.map((item) => item.id)).toEqual(['c', 'b']);
  });
});

describe('collectTags', () => {
  it('mengurutkan jumlah terbanyak lalu alfabetis', () => {
    const notes = [
      note('a', { tags: ['web', 'js'] }),
      note('b', { tags: ['web'] }),
      note('c', { tags: ['desain'] }),
    ];

    expect(collectTags(notes)).toEqual([
      { tag: 'web', count: 2 },
      { tag: 'desain', count: 1 },
      { tag: 'js', count: 1 },
    ]);
  });
});

describe('prepareNotes', () => {
  it('menyaring draft kecuali diminta', () => {
    const entries = [
      entry('publik', { date: new Date('2026-11-19T00:00:00Z') }),
      entry('draf', { draft: true, date: new Date('2026-11-18T00:00:00Z') }),
    ];

    expect(prepareNotes(entries).map((item) => item.id)).toEqual(['publik']);
    expect(
      prepareNotes(entries, { includeDrafts: true }).map((item) => item.id),
    ).toEqual(['publik', 'draf']);
  });

  it('melempar error yang menyebut file dan target saat tautan hilang', () => {
    const entries = [entry('a', {}, 'Lihat [[ghost]].')];

    expect(() => prepareNotes(entries, { strict: true })).toThrow(
      /a: \[\[ghost\]\] \(target tidak ditemukan\)/,
    );
  });

  it('melempar error saat tautan menunjuk draft', () => {
    const entries = [
      entry('a', {}, 'Lihat [[draf]].'),
      entry('draf', { draft: true }),
    ];

    expect(() => prepareNotes(entries, { strict: true })).toThrow(
      /menunjuk catatan draft/,
    );
  });

  it('melempar error saat tautan menunjuk diri sendiri', () => {
    const entries = [entry('a', {}, '[[a]]')];

    expect(() => prepareNotes(entries, { strict: true })).toThrow(
      /menunjuk diri sendiri/,
    );
  });

  it('melempar error saat judul duplikat', () => {
    const entries = [
      entry('a', { title: 'Judul Sama' }),
      entry('b', { title: 'Judul Sama' }),
    ];

    expect(() => prepareNotes(entries, { strict: true })).toThrow(
      /judul catatan harus unik/,
    );
  });

  it('tidak melempar saat strict false', () => {
    const entries = [entry('a', {}, '[[ghost]]')];

    expect(() => prepareNotes(entries)).not.toThrow();
  });

  it('mengabaikan tautan putus dari draft saat strict', () => {
    const entries = [
      entry('draf', { draft: true }, '[[ghost]]'),
    ];

    expect(() =>
      prepareNotes(entries, { strict: true, includeDrafts: true }),
    ).not.toThrow();
  });
});
