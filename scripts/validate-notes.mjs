import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { parseWikiLinks } from '../src/lib/wiki-links.ts';

const defaultNotesDir = fileURLToPath(
	new URL('../src/content/catatan/', import.meta.url),
);

const reasonLabel = {
	missing: 'target tidak ditemukan',
	draft: 'menunjuk catatan draft',
	self: 'menunjuk diri sendiri',
};

export function readNotes(dir = defaultNotesDir) {
	let files;

	try {
		files = readdirSync(dir, { recursive: true }).filter((file) =>
			file.endsWith('.md'),
		);
	} catch {
		return [];
	}

	return files.flatMap((file) => {
		const raw = readFileSync(join(dir, file), 'utf8');
		const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);

		if (!match) return [];

		const data = parseYaml(match[1]);
		if (!data || typeof data !== 'object') return [];

		const id = file.replace(/\\/g, '/').replace(/\.md$/, '');

		return [
			{
				id,
				title: typeof data.title === 'string' ? data.title : id,
				summary: typeof data.summary === 'string' ? data.summary : '',
				tags: Array.isArray(data.tags) ? data.tags : [],
				body: raw.slice(match[0].length),
				draft: data.draft === true,
			},
		];
	});
}

export function collectValidationErrors(notes) {
	const byId = new Map(notes.map((note) => [note.id, note]));
	const seen = new Set();
	const errors = [];

	for (const note of notes) {
		if (note.draft) continue;

		for (const link of parseWikiLinks(note.body)) {
			let reason = null;

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

	const titles = new Map();

	for (const note of notes) {
		if (note.draft) continue;
		const files = titles.get(note.title) ?? [];
		files.push(note.id);
		titles.set(note.title, files);
	}

	for (const [title, files] of titles) {
		if (files.length > 1) {
			errors.push({ duplicateTitle: title, files });
		}
	}

	return errors.sort((a, b) => {
		const left = a.file ?? a.duplicateTitle ?? '';
		const right = b.file ?? b.duplicateTitle ?? '';
		return left.localeCompare(right);
	});
}

export function formatErrors(errors) {
	const linkErrors = errors.filter((error) => error.reason);
	const titleErrors = errors.filter((error) => error.duplicateTitle);
	const lines = [];

	if (linkErrors.length > 0) {
		lines.push('Build dihentikan: tautan catatan tidak valid.');
		for (const error of linkErrors) {
			lines.push(
				`- ${error.file}: [[${error.target}]] (${reasonLabel[error.reason]})`,
			);
		}
	}

	if (titleErrors.length > 0) {
		if (lines.length > 0) lines.push('');
		lines.push('Build dihentikan: judul catatan harus unik.');
		for (const error of titleErrors) {
			lines.push(`- "${error.duplicateTitle}": ${error.files.join(', ')}`);
		}
	}

	return lines.join('\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	const errors = collectValidationErrors(readNotes());

	if (errors.length > 0) {
		console.error(formatErrors(errors));
		process.exitCode = 1;
	}
}
