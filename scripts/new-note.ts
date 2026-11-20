import {
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from 'node:fs';
import {
	join,
	relative as relativePath,
	sep,
} from 'node:path';
import { pathToFileURL } from 'node:url';
import { slugify } from '../src/lib/slug.ts';

export interface RenderOptions {
	title: string;
	date: string;
}

export interface CreateOptions extends Partial<RenderOptions> {
	root?: string;
	title: string;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function escapeYaml(value: string): string {
	return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function normalizeTitle(title: string): string {
	const normalized = title.trim().replace(/\s+/g, ' ');

	if (normalized.length < 3 || normalized.length > 100) {
		throw new Error('Judul harus 3 sampai 100 karakter.');
	}

	return normalized;
}

function assertDate(date: string): void {
	if (!DATE_RE.test(date)) {
		throw new Error('Tanggal harus berformat YYYY-MM-DD.');
	}
}

export function today(now = new Date()): string {
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function renderNote(template: string, options: RenderOptions): string {
	assertDate(options.date);

	return template
		.replace(/^title:.*$/m, `title: "${escapeYaml(options.title)}"`)
		.replace(/^date:.*$/m, `date: ${options.date}`)
		.replace(/^updated:.*$/m, `updated: ${options.date}`)
		.replace(/^draft:.*$/m, 'draft: true');
}

export function createNote(
	options: CreateOptions,
): { slug: string; target: string; relative: string } {
	const root = options.root ?? process.cwd();
	const title = normalizeTitle(options.title);
	const date = options.date ?? today();
	const slug = slugify(title);

	if (!slug) {
		throw new Error('Judul tidak menghasilkan slug yang valid.');
	}

	const directory = join(root, 'src', 'content', 'catatan');
	const target = join(directory, `${slug}.md`);
	const shown = relativePath(root, target).split(sep).join('/');

	if (existsSync(target)) {
		throw new Error(`File sudah ada: ${shown}`);
	}

	const template = readFileSync(join(root, 'templates', 'catatan.md'), 'utf8');
	mkdirSync(directory, { recursive: true });

	try {
		writeFileSync(target, renderNote(template, { title, date }), {
			flag: 'wx',
		});
	} catch (error) {
		if (
			error instanceof Error &&
			'code' in error &&
			error.code === 'EEXIST'
		) {
			throw new Error(`File sudah ada: ${shown}`);
		}
		throw error;
	}

	return { slug, target, relative: shown };
}

if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(process.argv[1]).href
) {
	const title = process.argv.slice(2).join(' ').trim();

	if (!title) {
		console.error('Pakai: npm run new -- "Judul catatan"');
		process.exitCode = 1;
	} else {
		try {
			const result = createNote({ title });
			console.log(`Dibuat: ${result.relative}`);
			console.log('');
			console.log('Langkah berikutnya:');
			console.log('1. Buka file dan isi summary, tag, serta isi catatan.');
			console.log('2. Ubah draft menjadi false saat siap terbit.');
		} catch (error) {
			console.error(
				error instanceof Error ? error.message : String(error),
			);
			process.exitCode = 1;
		}
	}
}
