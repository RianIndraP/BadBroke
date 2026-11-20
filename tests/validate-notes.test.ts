import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
	collectValidationErrors,
	formatErrors,
	readNotes,
} from '../scripts/validate-notes.mjs';

const roots: string[] = [];

const makeDir = (): string => {
	const dir = mkdtempSync(join(tmpdir(), 'arsip-validate-'));
	roots.push(dir);
	return dir;
};

const writeNote = (
	dir: string,
	id: string,
	options: { title?: string; draft?: boolean; body?: string } = {},
): void => {
	const { title = id, draft = false, body = '' } = options;

	writeFileSync(
		join(dir, `${id}.md`),
		`---\ntitle: "${title}"\nsummary: "Ringkasan yang cukup panjang untuk catatan uji."\ndate: 2026-11-19\ntags: ["uji"]\ndraft: ${draft}\n---\n\n${body}\n`,
	);
};

afterEach(() => {
	for (const root of roots.splice(0)) {
		rmSync(root, { recursive: true, force: true });
	}
});

describe('readNotes', () => {
	it('membaca frontmatter dan body', () => {
		const dir = makeDir();
		writeNote(dir, 'contoh', { body: 'Isi [[lain]].' });

		const [note] = readNotes(dir);

		expect(note).toMatchObject({
			id: 'contoh',
			title: 'contoh',
			draft: false,
		});
		expect(note.body).toContain('Isi [[lain]].');
	});

	it('mengembalikan daftar kosong bila folder tidak ada', () => {
		expect(readNotes(join(tmpdir(), `arsip-tidak-ada-${Date.now()}`))).toEqual(
			[],
		);
	});
});

describe('collectValidationErrors', () => {
	it('melaporkan tautan putus dari catatan terbit', () => {
		const dir = makeDir();
		writeNote(dir, 'a', { body: '[[ghost]]' });

		expect(collectValidationErrors(readNotes(dir))).toEqual([
			{ file: 'a', target: 'ghost', reason: 'missing' },
		]);
	});

	it('melaporkan tautan ke draft dan tautan ke diri sendiri', () => {
		const dir = makeDir();
		writeNote(dir, 'a', { body: '[[a]] [[draf]]' });
		writeNote(dir, 'draf', { draft: true });

		expect(collectValidationErrors(readNotes(dir))).toEqual([
			{ file: 'a', target: 'a', reason: 'self' },
			{ file: 'a', target: 'draf', reason: 'draft' },
		]);
	});

	it('mengabaikan tautan dari catatan draft', () => {
		const dir = makeDir();
		writeNote(dir, 'draf', { draft: true, body: '[[ghost]]' });

		expect(collectValidationErrors(readNotes(dir))).toEqual([]);
	});

	it('melaporkan judul duplikat hanya untuk catatan terbit', () => {
		const dir = makeDir();
		writeNote(dir, 'a', { title: 'Judul Sama' });
		writeNote(dir, 'b', { title: 'Judul Sama' });
		writeNote(dir, 'c', { title: 'Judul Sama', draft: true });

		expect(collectValidationErrors(readNotes(dir))).toEqual([
			{ duplicateTitle: 'Judul Sama', files: ['a', 'b'] },
		]);
	});
});

describe('formatErrors', () => {
	it('menyebut file, target, dan judul yang bermasalah', () => {
		const message = formatErrors([
			{ file: 'a', target: 'ghost', reason: 'missing' },
			{ duplicateTitle: 'Judul Sama', files: ['a', 'b'] },
		]);

		expect(message).toContain('tautan catatan tidak valid');
		expect(message).toContain('- a: [[ghost]] (target tidak ditemukan)');
		expect(message).toContain('judul catatan harus unik');
		expect(message).toContain('- "Judul Sama": a, b');
	});
});
