// @ts-check
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import { parse as parseYaml } from 'yaml';
import { remarkWikiLinks } from './src/lib/wiki-links.ts';

const notesDir = new URL('./src/content/catatan/', import.meta.url);
let titleCache = { mtime: -1, titles: new Map() };

function getNoteTitles() {
    let files = [];
    let mtime = 0;

    try {
        files = readdirSync(notesDir).filter((file) => file.endsWith('.md'));
        for (const file of files) {
            mtime = Math.max(mtime, statSync(new URL(file, notesDir)).mtimeMs);
        }
    } catch {
        return new Map();
    }

    if (mtime === titleCache.mtime) return titleCache.titles;

    const titles = new Map();

    for (const file of files) {
        try {
            const raw = readFileSync(new URL(file, notesDir), 'utf8');
            const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
            if (!match) continue;

            const data = parseYaml(match[1]);
            if (data && typeof data.title === 'string') {
                titles.set(file.replace(/\.md$/, ''), data.title);
            }
        } catch {
            // Catatan yang belum valid dilewati; validasi penuh terjadi saat halaman dibangun.
        }
    }

    titleCache = { mtime, titles };
    return titles;
}

/** @param {string} target */
function resolveWikiLink(target) {
    const title = getNoteTitles().get(target);
    return title ? { href: `/catatan/${target}/`, title } : null;
}

export default defineConfig({
    site: 'https://example.com',
    integrations: [icon()],
    markdown: {
        processor: unified({
            remarkPlugins: [[remarkWikiLinks, { resolve: resolveWikiLink }]],
        }),
    },
    vite: {
        plugins: [tailwindcss()],
    },
});
