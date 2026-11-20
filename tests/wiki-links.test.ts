import type { Root } from 'mdast';
import { describe, expect, it } from 'vitest';
import { parseWikiLinks, remarkWikiLinks } from '../src/lib/wiki-links';

describe('parseWikiLinks', () => {
  it('membaca target tunggal', () => {
    expect(parseWikiLinks('Lihat [[cara-kerja-http]].')).toEqual([
      { target: 'cara-kerja-http' },
    ]);
  });

  it('memakai label bila diberikan', () => {
    expect(parseWikiLinks('[[cara-kerja-http|penjelasan HTTP]]')).toEqual([
      { target: 'cara-kerja-http', label: 'penjelasan HTTP' },
    ]);
  });

  it('memangkas spasi pada target dan label', () => {
    expect(
      parseWikiLinks('[[  cara-kerja-http  |  penjelasan HTTP  ]]'),
    ).toEqual([
      { target: 'cara-kerja-http', label: 'penjelasan HTTP' },
    ]);
  });

  it('mengabaikan tautan di dalam blok kode berpagar', () => {
    const body = ['Teks.', '```', '[[diabaikan]]', '```', '[[dipakai]]'].join(
      '\n',
    );

    expect(parseWikiLinks(body)).toEqual([{ target: 'dipakai' }]);
  });

  it('mengabaikan tautan di dalam inline code', () => {
    expect(parseWikiLinks('Pakai `[[diabaikan]]` lalu [[dipakai]].')).toEqual([
      { target: 'dipakai' },
    ]);
  });

  it('mempertahankan urutan beberapa tautan', () => {
    expect(parseWikiLinks('[[a]] lalu [[b|B]]')).toEqual([
      { target: 'a' },
      { target: 'b', label: 'B' },
    ]);
  });
});

describe('remarkWikiLinks', () => {
  it('mengganti wiki link dengan judul target', () => {
    const tree: Root = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: 'Lihat [[a]].' }],
        },
      ],
    };

    remarkWikiLinks({
      resolve: (target) =>
        target === 'a' ? { href: '/catatan/a/', title: 'Catatan A' } : null,
    })(tree);

    expect(tree.children[0]).toEqual({
      type: 'paragraph',
      children: [
        { type: 'text', value: 'Lihat ' },
        {
          type: 'link',
          url: '/catatan/a/',
          children: [{ type: 'text', value: 'Catatan A' }],
        },
        { type: 'text', value: '.' },
      ],
    });
  });

  it('membiarkan target yang tidak ditemukan apa adanya', () => {
    const tree: Root = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: '[[ghost]]' }],
        },
      ],
    };

    remarkWikiLinks({ resolve: () => null })(tree);

    expect(tree.children[0]).toEqual({
      type: 'paragraph',
      children: [{ type: 'text', value: '[[ghost]]' }],
    });
  });
});
