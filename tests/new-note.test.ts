import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
	createNote,
	renderNote,
	today,
} from '../scripts/new-note';

const template = `---
title: "Judul catatan"
summary: "Ringkasan sementara."
date: 2026-11-19
updated: 2026-11-19
tags: ["topik"]
draft: true
---

Isi catatan.
`;

const roots: string[] = [];

const makeRoot = (): string => {
	const root = mkdtempSync(join(tmpdir(), 'arsip-new-'));
	roots.push(root);
	mkdirSync(join(root, 'templates'), { recursive: true });
	writeFileSync(join(root, 'templates', 'catatan.md'), template);
	return root;
};

afterEach(() => {
	for (const root of roots.splice(0)) {
		rmSync(root, { recursive: true, force: true });
	}
});

describe('renderNote', () => {
	it('mengisi judul, tanggal, dan mempertahankan draft', () => {
		const result = renderNote(template, {
			title: 'Cara Kerja HTTP',
			date: '2026-11-20',
		});

		expect(result).toContain('title: "Cara Kerja HTTP"');
		expect(result).toContain('date: 2026-11-20');
		expect(result).toContain('updated: 2026-11-20');
		expect(result).toContain('draft: true');
		expect(result).not.toContain('2026-11-19');
	});

	it('meng-escape tanda kutip dan garis miring terbalik', () => {
		const result = renderNote(template, {
			title: 'Belajar "Astro" \\ Node',
			date: '2026-11-20',
		});

		expect(result).toContain('title: "Belajar \\"Astro\\" \\\\ Node"');
	});

	it('memaksa draft true meskipun template berisi draft false', () => {
		const result = renderNote(
			template.replace('draft: true', 'draft: false'),
			{ title: 'Catatan Baru', date: '2026-11-20' },
		);

		expect(result).toContain('draft: true');
		expect(result).not.toContain('draft: false');
	});
});

describe('createNote', () => {
	it('menulis catatan baru memakai slug dan draft true', () => {
		const root = makeRoot();
		const result = createNote({
			root,
			title: 'Cara Kerja HTTP',
			date: '2026-11-20',
		});

		const content = readFileSync(result.target, 'utf8');

		expect(result.slug).toBe('cara-kerja-http');
		expect(result.relative).toBe(
			'src/content/catatan/cara-kerja-http.md',
		);
		expect(content).toContain('title: "Cara Kerja HTTP"');
		expect(content).toContain('draft: true');
	});

	it('membuat folder catatan bila belum ada', () => {
		const root = makeRoot();
		const result = createNote({
			root,
			title: 'Catatan Baru',
			date: '2026-11-20',
		});

		expect(readFileSync(result.target, 'utf8')).toContain(
			'title: "Catatan Baru"',
		);
	});

	it('menolak menimpa file yang sudah ada', () => {
		const root = makeRoot();
		createNote({ root, title: 'Catatan Kembar', date: '2026-11-20' });

		expect(() =>
			createNote({ root, title: 'Catatan Kembar', date: '2026-11-21' }),
		).toThrow(/sudah ada/i);
	});

	it('menolak judul yang terlalu pendek', () => {
		const root = makeRoot();

		expect(() => createNote({ root, title: 'a' })).toThrow(/3 sampai 100/);
	});
});

describe('today', () => {
	it('memformat tanggal lokal sebagai YYYY-MM-DD', () => {
		expect(today(new Date(2026, 0, 5))).toBe('2026-01-05');
	});
});
