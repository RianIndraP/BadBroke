import { describe, expect, it } from 'vitest';
import {
  buildGraph,
  findBacklinks,
  findRelated,
  validateWikiLinks,
  type NoteInput,
} from '../src/lib/graph';

const note = (id: string, overrides: Partial<NoteInput> = {}): NoteInput => ({
  id,
  title: id,
  summary: `Ringkasan untuk ${id}.`,
  tags: [],
  body: '',
  draft: false,
  ...overrides,
});

describe('buildGraph', () => {
  it('menggabungkan tautan dua arah menjadi satu edge', () => {
    const a = note('a', { body: '[[b]]' });
    const b = note('b', { body: '[[a]]' });

    expect(buildGraph([a, b]).edges).toEqual([{ source: 'a', target: 'b' }]);
  });

  it('menghitung tautan ganda sebagai satu edge', () => {
    const a = note('a', { body: '[[b]] [[b]] [[b|B]]' });
    const b = note('b');

    expect(buildGraph([a, b]).edges).toEqual([{ source: 'a', target: 'b' }]);
  });

  it('tidak membuat edge untuk tautan ke diri sendiri', () => {
    const a = note('a', { body: '[[a]]' });

    expect(buildGraph([a]).edges).toEqual([]);
  });

  it('tidak membuat edge untuk target yang hilang', () => {
    const a = note('a', { body: '[[ghost]]' });

    expect(buildGraph([a]).edges).toEqual([]);
  });

  it('tidak membuat edge ke catatan draft', () => {
    const a = note('a', { body: '[[draf]]' });
    const draf = note('draf', { draft: true });

    expect(buildGraph([a, draf]).edges).toEqual([]);
  });

  it('menghitung degree dari tetangga unik', () => {
    const a = note('a', { body: '[[b]] [[b]] [[c]]' });
    const b = note('b');
    const c = note('c');

    const nodes = buildGraph([a, b, c]).nodes;

    expect(nodes.find((node) => node.id === 'a')?.degree).toBe(2);
    expect(nodes.find((node) => node.id === 'b')?.degree).toBe(1);
    expect(nodes.find((node) => node.id === 'c')?.degree).toBe(1);
  });

  it('mengeluarkan catatan draft dari node dan edge', () => {
    const publik = note('publik', { body: '[[draf]]' });
    const draf = note('draf', { draft: true, body: '[[publik]]' });

    const graph = buildGraph([publik, draf]);

    expect(graph.nodes.map((node) => node.id)).toEqual(['publik']);
    expect(graph.edges).toEqual([]);
  });
});

describe('findBacklinks', () => {
  it('mengembalikan catatan yang menautkan ke target', () => {
    const a = note('a', { body: '[[b]]' });
    const b = note('b');
    const c = note('c', { body: '[[b]] [[b]]' });

    expect(findBacklinks([a, b, c], 'b').map((item) => item.id)).toEqual([
      'a',
      'c',
    ]);
  });

  it('mengabaikan backlink dari draft', () => {
    const draf = note('draf', { draft: true, body: '[[b]]' });
    const b = note('b');

    expect(findBacklinks([draf, b], 'b')).toEqual([]);
  });
});

describe('findRelated', () => {
  it('mengurutkan berdasarkan tag yang sama lalu judul', () => {
    const target = note('target', {
      title: 'Target',
      tags: ['web', 'js'],
      body: '[[linked]]',
    });
    const linked = note('linked', { title: 'Linked', tags: ['web', 'js'] });
    const e = note('e', { title: 'E', tags: ['web', 'js'] });
    const b = note('b', { title: 'B', tags: ['web'] });
    const c = note('c', { title: 'C', tags: ['js'] });
    const f = note('f', { title: 'F', tags: ['lain'] });

    expect(
      findRelated([target, linked, e, b, c, f], target, 3).map(
        (item) => item.id,
      ),
    ).toEqual(['e', 'b', 'c']);
  });

  it('membatasi jumlah catatan terkait', () => {
    const target = note('target', { title: 'Target', tags: ['a'] });
    const candidates = Array.from({ length: 6 }, (_, index) =>
      note(`n${index}`, { title: `N${index}`, tags: ['a'] }),
    );

    expect(findRelated([target, ...candidates], target)).toHaveLength(4);
  });

  it('mengabaikan catatan draft', () => {
    const target = note('target', { tags: ['a'] });
    const draf = note('draf', { tags: ['a'], draft: true });

    expect(findRelated([target, draf], target)).toEqual([]);
  });
});

describe('validateWikiLinks', () => {
  it('tidak melaporkan tautan yang valid', () => {
    const a = note('a', { body: '[[b]]' });
    const b = note('b');

    expect(validateWikiLinks([a, b])).toEqual([]);
  });

  it('melaporkan tautan ke diri sendiri', () => {
    const a = note('a', { body: '[[a]]' });

    expect(validateWikiLinks([a])).toEqual([
      { file: 'a', target: 'a', reason: 'self' },
    ]);
  });

  it('melaporkan target yang hilang satu kali', () => {
    const a = note('a', { body: '[[ghost]] [[ghost]]' });

    expect(validateWikiLinks([a])).toEqual([
      { file: 'a', target: 'ghost', reason: 'missing' },
    ]);
  });

  it('melaporkan tautan ke catatan draft', () => {
    const a = note('a', { body: '[[draf]]' });
    const draf = note('draf', { draft: true });

    expect(validateWikiLinks([a, draf])).toEqual([
      { file: 'a', target: 'draf', reason: 'draft' },
    ]);
  });

  it('mengabaikan tautan di dalam inline code', () => {
    const a = note('a', { body: '`[[ghost]]`' });

    expect(validateWikiLinks([a])).toEqual([]);
  });
});
