import { describe, expect, it } from 'vitest';
import { slugify } from '../src/lib/slug';

describe('slugify', () => {
  it('mengubah judul biasa menjadi slug', () => {
    expect(slugify('Cara Kerja HTTP')).toBe('cara-kerja-http');
  });

  it('menghapus diakritik', () => {
    expect(slugify('Café déjà vu')).toBe('cafe-deja-vu');
  });

  it('merapikan spasi berulang', () => {
    expect(slugify('  Halo   Dunia  ')).toBe('halo-dunia');
  });

  it('membuang tanda baca', () => {
    expect(slugify('Node.js & Astro: Panduan')).toBe('nodejs-astro-panduan');
  });

  it('menghasilkan string kosong bila tidak ada huruf atau angka', () => {
    expect(slugify('---')).toBe('');
  });
});
