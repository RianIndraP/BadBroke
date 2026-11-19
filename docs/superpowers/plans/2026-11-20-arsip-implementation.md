# Arsip Implementation Plan

> **Execution mode:** human implementer, agent as instructor. Rian writes and runs the code; the agent gives exact next steps, explains errors, and reviews results. This user-supplied method overrides the default subagent/native handoff.

**Goal:** Build a static Indonesian knowledge archive with a force-directed note graph, fast reading pages, search, and complete SEO.

**Architecture:** Astro 7 renders every page to static HTML. Notes are Markdown files in one content collection, linked with `[[slug]]` syntax. A single React island renders the graph on canvas from build-time data. Pagefind indexes the built HTML for search.

**Tech Stack:** Astro 7.4.13, React 19.3.1, TypeScript 6.0.3, Tailwind CSS 4.3.5, `d3-force` 3.0.1, Pagefind 1.6.0, Vitest 5.1.1. Node 24.11.1 (minimum 22.23.4), npm 11.6.4.

**Spec:** [docs/PRD.md](../../PRD.md)

## Global Constraints

- Working directory: `D:\APK\Project\Project1`.
- Site name: "Arsip". Author: "Rian Indra Pratama". Domain: placeholder `https://example.com` until deploy.
- Static output only. No backend, database, auth, or comments.
- Language: Indonesian. Code identifiers in English.
- No em dash (`—` or `–`) in visible copy. Use a plain hyphen.
- One accent only: light `#0e6b4f`, dark `#5bd6a8`. Never add a second accent.
- Graph edges come only from `[[slug]]` links. Tags drive filters and related notes, not edges.
- Frontmatter: `title` 3-100 chars, `summary` 20-160 chars, `date` `YYYY-MM-DD`, optional `updated`, 1-3 lowercase kebab tags, `draft` default `false`.
- File name is the slug. Lowercase ASCII, digits, hyphens. Changing a published file name breaks links.
- Production must work with zero notes. No demo notes in production.
- Drafts must not appear in pages, graph, archive, tags, RSS, sitemap, or search.
- Every page must work at 360 px and in light and dark mode.
- Use `npm.cmd` instead of `npm` if PowerShell still blocks `npm.ps1`.
- Commit after every task. Do not commit `node_modules`, `dist`, or `.astro`.

## Review Focus

1. Zero notes: homepage, archive, and topic pages render empty states without errors, and `npm run build` succeeds.
2. Wiki links inside fenced code blocks and inline code are never converted to links or graph edges.
3. A draft note never leaks into production HTML, graph data, archive counts, topic counts, RSS, sitemap, or search.
4. A broken wiki link fails the production build with the source file and missing target in the message.
5. Graph survives one node, disconnected clusters, long titles, and roughly 300 nodes without a blank canvas or runaway CPU.

---

## Task 1: Environment and repository baseline

**Files:**
- None yet. This task prepares the tools and commits the existing docs.

**Interfaces:**
- Produces: working `node`, `npm`, `git`, and a clean baseline commit.

- [ ] **Step 1: Allow npm scripts in PowerShell**

Run in PowerShell:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

If the command is blocked, keep using `npm.cmd` and `npx.cmd` for every command in this plan.

- [ ] **Step 2: Verify the tools**

```powershell
node -v
npm -v
git --version
```

Expected: Node `v24.x` or at least `v22.23.4`, npm `11.x` or newer, Git installed. If `npm -v` fails with an execution policy error, run `npm.cmd -v` and use `npm.cmd` from now on.

- [ ] **Step 3: Initialize Git and commit the documents**

```powershell
cd D:\APK\Project\Project1
git init
git config user.name "Rian Indra Pratama"
git config user.email "GANTI_DENGAN_EMAIL_GITHUB"
git add .
git commit -m "docs: add approved PRD, README, and note template"
```

Expected: one commit. Replace the email with the email used on GitHub. This is a local repo setting, not global.

---

## Task 2: Astro foundation and design shell

**Files:**
- Create: `package.json`, `astro.config.ts`, `tsconfig.json`, `.gitignore`
- Create: `src/config.ts`, `src/styles/global.css`, `src/layouts/BaseLayout.astro`
- Create: `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/ThemeToggle.astro`
- Create: `src/pages/index.astro`
- Test: manual check in browser plus `npm run check` and `npm run build`

**Interfaces:**
- Consumes: nothing.
- Produces: `siteConfig` with `{ title, tagline, description, url, author, contact, recentNotes }`; base layout with theme handling; working dev and build commands.

- [ ] **Step 1: Create the package manifest and ignore file**

Run:

```powershell
npm init -y
```

Create `.gitignore` now with `node_modules/`, `dist/`, and `.astro/`. Replace `package.json` with scripts: `dev` (`astro dev`), `build` (`astro build && pagefind --site dist`), `preview` (`astro preview`), `check` (`astro check`), `test` (`vitest run`), `new` (`node scripts/new-note.mjs`). Set `"type": "module"`, `"private": true`, and Node engine `>=22.23.4`. Do not run the build yet; `scripts/new-note.mjs` and Pagefind arrive in later tasks.

- [ ] **Step 2: Install runtime dependencies**

```powershell
npm install astro@7.4.13 @astrojs/react@7.1.9 @astrojs/sitemap@3.7.6 @astrojs/rss@4.0.19 tailwindcss@4.3.5 @tailwindcss/vite@4.3.5 @tailwindcss/typography@0.5.20 react@19.3.1 react-dom@19.3.1 d3-force@3.0.1 astro-icon@1.2.0 @iconify-json/ph@1.2.2 @fontsource-variable/geist@5.3.0 @fontsource-variable/newsreader@5.3.0 unist-util-visit@5.2.0 yaml@2.9.1
```

- [ ] **Step 3: Install development dependencies**

```powershell
npm install -D typescript@6.0.3 @astrojs/check@0.9.12 @types/react@19.3.0 @types/react-dom@19.3.0 @types/d3-force@3.0.10 @types/mdast@4.0.4 vitest@5.1.1 pagefind@1.6.0
```

- [ ] **Step 4: Create the Astro and TypeScript config**

`astro.config.ts` sets `site` from the placeholder URL, adds `react()`, `sitemap()`, and `icon()`, and adds the Tailwind Vite plugin. `tsconfig.json` extends `astro/tsconfigs/strict` and includes `.astro/types.d.ts`.

- [ ] **Step 5: Create `src/config.ts` and the base layout**

`siteConfig` contains the site name, tagline, description, URL, author "Rian Indra Pratama", contact placeholder, and `recentNotes: 6`. The base layout imports both Fontsource families, `global.css`, sets `lang="id"`, renders the header, main slot, footer, and the inline theme script that sets `data-theme` before paint. It also renders a skip link.

- [ ] **Step 6: Create design tokens and the shell**

`global.css` maps the light and dark palette to CSS variables, sets Newsreader for prose and headings, Geist for UI, one accent, the documented radii, focus ring, and Tailwind layers. Header: wordmark "arsip.", links Catatan, Topik, Tentang, search button placeholder, theme toggle. Footer: author, copyright year, RSS, archive, about. Use Phosphor icons through `astro-icon`. Keep the mobile header on one line with a menu button.

- [ ] **Step 7: Create a temporary homepage shell**

`src/pages/index.astro` renders an H1 and one paragraph inside the base layout. Use the final copy from the PRD. No graph yet.

- [ ] **Step 8: Verify the foundation**

```powershell
npm run check
npm run build
npm run dev
```

Expected: build succeeds without Pagefind because the search step is not added yet; use `astro build` temporarily if the combined build is not ready. Browser shows the page at 360 px, light and dark, and the theme choice persists after refresh. Stop the dev server with `Ctrl + C`.

- [ ] **Step 9: Commit**

```powershell
git add .
git commit -m "feat: scaffold Astro and design shell"
```

---

## Task 3: Wiki links, graph data, and validation

**Files:**
- Create: `src/lib/wiki-links.ts`, `src/lib/graph.ts`, `src/lib/slug.ts`
- Create: `tests/wiki-links.test.ts`, `tests/graph.test.ts`, `tests/slug.test.ts`
- Create: `vitest.config.ts`
- Modify: `astro.config.ts` to register `remarkWikiLinks`

**Interfaces:**
- Consumes: nothing from earlier tasks except TypeScript setup.
- Produces:
  - `parseWikiLinks(body: string): WikiLink[]` where `WikiLink = { target: string; label?: string }`
  - `remarkWikiLinks(options: { resolve: (target: string) => { href: string; title: string } | null }): (tree: Root) => void`
  - `buildGraph(notes: NoteInput[]): { nodes: GraphNode[]; edges: GraphEdge[] }`
  - `findBacklinks(notes: NoteInput[], id: string): NoteInput[]`
  - `findRelated(notes: NoteInput[], note: NoteInput, limit?: number): NoteInput[]`
  - `validateWikiLinks(notes: NoteInput[]): LinkError[]`
  - `slugify(title: string): string`
  - Types: `NoteInput` has `id, title, summary, tags, body, draft`; `GraphNode` adds `degree`; `GraphEdge` has `source, target`; `LinkError` has `file, target, reason` with reason `missing | draft | self`.

- [ ] **Step 1: Add Vitest config**

Create `vitest.config.ts` with `test.include: ['tests/**/*.test.ts']` and Node environment. Run `npm test` once. Expected: no tests found or zero failures, not a config error.

- [ ] **Step 2: Write failing wiki link tests**

Cover:
- `[[cara-kerja-http]]` returns target `cara-kerja-http`.
- `[[cara-kerja-http|penjelasan HTTP]]` returns the label.
- `[[a]]` inside a fenced code block is ignored.
- `[[a]]` inside inline code is ignored.
- Surrounding text and whitespace are trimmed.

Run `npm test`. Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement `parseWikiLinks` and the remark plugin**

Parse outside fenced and inline code only. The remark plugin visits `text` nodes, replaces wiki links with `link` nodes, uses the resolver for `href` and default label, and leaves unresolved targets untouched so validation can report them. Register the plugin in `astro.config.ts` with a resolver that reads note titles from `src/content/catatan` and caches by directory modification time. The resolver may use a small frontmatter reader; keep it internal.

Run `npm test`. Expected: PASS.

- [ ] **Step 4: Write failing graph tests**

Cover:
- Two notes linking to each other produce one undirected edge, not two.
- Duplicate links produce one edge.
- A self-link produces no edge.
- A missing target produces no edge and one validation error.
- A link to a draft produces a validation error.
- Degree counts unique neighbors.
- Drafts are excluded from nodes and edges.
- Backlinks return the source notes.
- Related notes are ranked by shared tags, exclude self and directly linked notes, and cap at 4.

Run `npm test`. Expected: FAIL.

- [ ] **Step 5: Implement `buildGraph`, backlinks, related, and validation**

Use only notes with `draft: false`. Deduplicate undirected pairs. Ignore links to missing notes in graph output, but report them in `validateWikiLinks`. Sort related notes deterministically by shared tag count then title.

Run `npm test`. Expected: PASS.

- [ ] **Step 6: Write and run slug tests**

Cover "Cara Kerja HTTP" to `cara-kerja-http`, diacritics, repeated spaces, and punctuation. Implement `slugify`. Run `npm test`. Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add .
git commit -m "feat: add wiki link parser, graph data, and validation"
```

---

## Task 4: Content collection, pages, and writing workflow

**Files:**
- Create: `src/content.config.ts`, `src/lib/notes.ts`
- Create: `src/components/NoteList.astro`, `src/components/TopicChips.astro`
- Create: `src/pages/catatan/index.astro`, `src/pages/catatan/[slug].astro`
- Create: `src/pages/topik/index.astro`, `src/pages/topik/[tag].astro`
- Create: `src/pages/tentang.astro`, `src/pages/404.astro`
- Create: `scripts/new-note.mjs`
- Modify: `src/pages/index.astro` for the real intro, latest notes, and topics
- Modify: `package.json` script `new`
- Test: build with zero notes, one temporary note, a broken link, and a draft

**Interfaces:**
- Consumes: `buildGraph`, `findBacklinks`, `findRelated`, `validateWikiLinks`, `parseWikiLinks`, `slugify`.
- Produces: `getAllNotes(includeDrafts?: boolean)` and `getNoteIndex()`; route params; `new` script.

- [ ] **Step 1: Define the content schema**

`src/content.config.ts` uses the glob loader on `src/content/catatan`, with Zod validation for title, summary, date, updated, tags, and draft. Enforce summary length 20-160, tags 1-3, lowercase kebab-case, and `updated >= date`.

- [ ] **Step 2: Create the notes loader and validation**

`getAllNotes()` loads the collection, sorts by date descending, filters drafts in production, and calls `validateWikiLinks`. On errors, throw one error listing each file and target. `getNoteIndex()` returns id, title, and draft for the remark resolver.

- [ ] **Step 3: Create the note page**

Renders title, summary, date, optional updated, reading time, tags, article body with the remark plugin, TOC when at least 3 headings, backlinks, and related notes. Use `getStaticPaths` from all notes. Note pages must be static.

- [ ] **Step 4: Create archive, topic, about, and 404 pages**

Archive groups by year. `/topik` lists all tags with counts sorted by count then name. `/topik/[tag]` lists notes for one tag. About uses the author data. 404 links to search, home, and archive. Every page has an empty state.

- [ ] **Step 5: Update the homepage content sections**

Replace the temporary shell with the final H1, subtext, real note/topic counts, latest 6 notes, and topic chips. Keep the graph area reserved for Task 5. Use no cards.

- [ ] **Step 6: Create the note generator**

`scripts/new-note.mjs` imports `slugify`, reads `templates/catatan.md`, replaces the title and dates, forces `draft: true`, writes `src/content/catatan/<slug>.md`, and refuses to overwrite. Print the created path. Test the script manually with a temporary title, inspect the file, then delete it.

- [ ] **Step 7: Verify empty, valid, broken, and draft states**

Run `npm run build` with no notes. Expected: PASS and empty states exist.

Create one temporary note with `draft: false`, run the build, open the note, archive, and topic pages. Expected: all render. Add a `[[tidak-ada]]` link, run the build. Expected: FAIL with the file name and target. Remove the broken link. Set the note to `draft: true` and build. Expected: the note is absent from archive and topic counts. Delete the temporary note.

- [ ] **Step 8: Commit**

```powershell
git add .
git commit -m "feat: add content collection and note pages"
```

---

## Task 5: Graph island

**Files:**
- Create: `src/components/GraphExplorer.tsx`, `src/components/GraphPanel.tsx` if needed
- Modify: `src/pages/index.astro`, `src/styles/global.css`
- Test: manual at 360 px and desktop, with 0, 1, 2, 10, and 50 notes

**Interfaces:**
- Consumes: `GraphNode[]`, `GraphEdge[]`, tags with counts from the homepage loader; CSS variables for colors.
- Produces: interactive canvas with hover, click, drag, tag filters, mobile selection panel, and reduced-motion static render.

- [ ] **Step 1: Pass graph data from the homepage**

Build nodes, edges, and top tags at build time. Serialize only the fields the island needs: id, title, summary, tags, degree. No note body.

- [ ] **Step 2: Render the canvas**

Create the React island with `client:load`. Reserve its height in CSS to avoid layout shift. Draw nodes, edges, and selective labels on a 2D canvas. Use `d3-force` with link, charge, collision, and center forces. Stop the simulation when it cools; do not run a permanent animation frame loop. Cap device pixel ratio at 2 and handle resize.

- [ ] **Step 3: Add interactions**

Desktop hover highlights the node and neighbors and dims the rest; click navigates; drag moves a node and does not navigate when the pointer moves more than 4 px. Filters are buttons with `aria-pressed`; selecting a tag dims non-matching nodes. Mobile tap selects a node and shows a panel with title, summary, tags, and "Baca catatan"; tapping empty space clears it. No pan or zoom in v1.

- [ ] **Step 4: Add fallbacks**

Without JavaScript, show a short message and a link to the archive. With `prefers-reduced-motion`, compute ticks synchronously and draw once. Show an empty state when there are no nodes. Ensure the graph is not the only navigation.

- [ ] **Step 5: Verify graph behavior**

Use temporary notes to create 1, 2, 10, and 50 nodes. Check long titles, a disconnected node, light/dark theme, resize, 360 px, keyboard focus on filter buttons, and reduced motion via DevTools. Expected: no blank canvas, no clipped panel, no infinite CPU usage. Delete temporary notes.

- [ ] **Step 6: Commit**

```powershell
git add .
git commit -m "feat: add interactive note graph"
```

---

## Task 6: Search

**Files:**
- Create: `src/components/SearchDialog.astro`, `src/scripts/search.ts`
- Modify: `src/components/Header.astro`, `src/layouts/BaseLayout.astro`, `src/styles/global.css`, `package.json`
- Test: `npm run build && npm run preview`

**Interfaces:**
- Consumes: built HTML from Pagefind.
- Produces: accessible dialog with `Ctrl/Cmd + K`, `/`, arrow navigation, Enter, Escape, empty, no-result, and load-error states.

- [ ] **Step 1: Add the Pagefind postbuild step**

Set `build` to `astro build && pagefind --site dist`. Add `data-pagefind-body` to the note article and `data-pagefind-ignore` to header, footer, and graph. Run the build. Expected: `dist/pagefind/` exists.

- [ ] **Step 2: Build the dialog markup**

Use a native `<dialog>` with a labelled input, results list, live status region, and close button. The header search button opens it. Add the keyboard shortcuts only when the event target is not an input, textarea, or contenteditable.

- [ ] **Step 3: Load Pagefind on first open**

Dynamically import `/pagefind/pagefind.js`, initialize, and run searches with a short debounce. Render title, excerpt, and tags. Handle zero results, load failure, and dev mode (no index) with clear messages. Keep focus in the dialog and restore it on close.

- [ ] **Step 4: Verify search**

Run `npm run build` then `npm run preview`. Search a title word, a body word, a tag, and a nonsense query. Use only the keyboard. Test at 360 px. Expected: results highlight and navigate, Escape closes, focus returns, no layout break. In `npm run dev`, confirm the helpful "search needs a build" message.

- [ ] **Step 5: Commit**

```powershell
git add .
git commit -m "feat: add Pagefind search dialog"
```

---

## Task 7: SEO, feeds, and share image

**Files:**
- Create: `src/components/Seo.astro`, `src/pages/rss.xml.ts`, `src/pages/robots.txt.ts`
- Create: `public/og.png`, `public/favicon.svg`
- Modify: `astro.config.ts` site URL, note/topic/about pages, base layout
- Test: view source, Rich Results Test, RSS validator, Lighthouse

**Interfaces:**
- Consumes: `siteConfig`, note data.
- Produces: title, description, canonical, Open Graph, Twitter Card, JSON-LD, RSS, robots, sitemap, default share image.

- [ ] **Step 1: Add the SEO component**

Accept title, description, type, canonical path, dates, tags, and optional image. Render title template, meta description, canonical, Open Graph, Twitter Card, and JSON-LD. Note pages use `BlogPosting`; home uses `WebSite`. Escape `<` in JSON.

- [ ] **Step 2: Add RSS and robots**

RSS includes published notes sorted by date, with summary and link. Robots points to the sitemap. Sitemap integration already uses `site`; keep drafts out by never building them.

- [ ] **Step 3: Add the share image and favicon**

Create `public/og.png` at 1200x630 with the wordmark, site name, and a short line. Create a simple text-based `favicon.svg`. No stock photography.

- [ ] **Step 4: Verify SEO and accessibility**

Build, preview, and inspect source on home, note, topic, archive, about, and 404. Check one H1, canonical, meta description, OG tags, JSON-LD, RSS, robots, and sitemap. Run Lighthouse mobile on a note page. Expected: Performance, SEO, Accessibility at least 95. Fix regressions before commit.

- [ ] **Step 5: Commit**

```powershell
git add .
git commit -m "feat: add SEO metadata, feeds, and share image"
```

---

## Task 8: First real content and deploy

**Files:**
- Create: at least 6 files in `src/content/catatan/`
- Modify: `src/config.ts` with final domain and contact
- Test: production build, graph, search, RSS, sitemap, mobile

**Interfaces:**
- Consumes: the writing workflow and every page.
- Produces: a deployable site with real content.

- [ ] **Step 1: Write the first 6 notes**

Use `npm run new -- "Judul"`. Fill the summary, tags, body, and at least one `[[link]]` per note. Set `draft: false` only when finished. Suggested seed topics: one core note, two notes that link to it, and three notes that link among the group.

- [ ] **Step 2: Verify the content graph**

Build and preview. Check every note has a backlink or related note where expected. Open the archive, all topics, and search. Fix broken links. Expected: the graph is connected enough to explore.

- [ ] **Step 3: Set the final URL**

Update `siteConfig.url` to the real domain before deploy. Verify canonical, sitemap, RSS, and OG URLs use it. If the domain is not ready, use the hosting preview URL temporarily.

- [ ] **Step 4: Deploy as a static site**

Push to GitHub, create a Vercel or Netlify project, set build `npm run build`, output `dist`, Node 22.23.4 or newer. No environment variables. Expected: production deploy succeeds and search works.

- [ ] **Step 5: Final smoke test**

On the production URL: graph loads, node click works, search returns results, theme persists, mobile 360 px is clean, RSS and sitemap open, and Lighthouse meets targets. Submit the sitemap to Google Search Console.

- [ ] **Step 6: Commit and tag**

```powershell
git add .
git commit -m "content: publish first notes"
git tag v1.0.0
```

---

## Self-Review

- **Spec coverage:** All routes in PRD §7 have a task. Content model §8 is Task 3 and 4. UX §9 is Tasks 4, 5, 6. Visual §10 is Task 2 and 5. Architecture §11 is Tasks 2-7. SEO §12 is Task 7. Accessibility §13 and performance §14 are Tasks 5-7. Launch §16 is Task 8.
- **Empty and failure states:** Tasks 4, 5, 6, and 8 cover zero notes, broken links, drafts, search errors, and graph edge cases.
- **Type consistency:** `NoteInput`, `GraphNode`, `GraphEdge`, `LinkError`, `WikiLink`, and `slugify` are defined once in Task 3 and consumed with the same names later.
- **Review focus tests:** Zero notes in Task 4 Step 7, code-block links in Task 3 Step 2, drafts in Task 3 Step 4 and Task 4 Step 7, broken links in Task 3 Step 4 and Task 4 Step 7, graph edge cases in Task 5 Step 5.
- **Proportion:** The plan names decisions and verification; implementation details stay for execution.
