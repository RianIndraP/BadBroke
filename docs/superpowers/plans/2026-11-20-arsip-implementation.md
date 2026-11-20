# Tutorial Implementasi Arsip

**Untuk:** Rian Indra Pratama
**Spesifikasi:** [PRD](../../PRD.md)
**Terminal:** Git Bash
**Status:** mulai ulang dari fondasi

Tutorial ini menggantikan rencana implementasi berbahasa Inggris. Semua langkah ditulis dalam bahasa Indonesia, memakai Git Bash, dan disusun dari yang paling kecil.

Kamu yang menjalankan perintah dan menulis file. Saya berperan sebagai instruktur: memberi urutan, isi file, dan memeriksa error.

## Cara memakai tutorial ini

1. Kerjakan berurutan. Jangan lompat fase.
2. Satu fase selesai, satu commit.
3. Jangan lanjut kalau pengecekan masih gagal.
4. Jangan membuat file kosong. Isi langsung atau minta isinya ke saya.
5. Kalau ada error, kirim perintah yang dijalankan dan pesan lengkapnya.
6. Folder `docs/` dan `templates/` jangan dihapus. Itu PRD dan template catatan.

## Kenapa file dibuat manual, bukan hanya `npm install`?

Ada dua hal berbeda:

- `npm install astro` memasang **alat** ke `node_modules`.
- Membuat file seperti `src/pages/index.astro` adalah **menyusun proyeknya**.

Astro tidak tahu halamanmu seperti apa hanya dari paket yang terpasang. Kamu tetap perlu file halaman, layout, dan konfigurasi.

`npm create astro` bisa membuat file awal otomatis, tetapi folder ini sudah berisi `README.md`, `docs/`, dan `templates/`. Scaffold otomatis berisiko menimpa dokumen atau membuat proyek di subfolder. Karena itu kita buat manual, sedikit demi sedikit.

Kita juga tidak menginstall semua dependency di awal. Setiap fase hanya menambah paket yang benar-benar dipakai.

## Peta fase

| Fase | Hasil | Keterangan |
|---|---|---|
| 0 | Lingkungan siap | Cek Node, npm, Git, dan posisi folder |
| 1 | Halaman Astro pertama | Astro saja, belum Tailwind |
| 2 | Tampilan dasar | Tailwind, font, header, footer, tema |
| 3 | Model konten | Frontmatter, `[[tautan]]`, graph data, test |
| 4 | Halaman catatan | Catatan, arsip, topik, tentang, 404 |
| 5 | Graph | Peta catatan interaktif |
| 6 | Pencarian | Pagefind dan dialog pencarian |
| 7 | SEO | Metadata, RSS, sitemap, gambar share |
| 8 | Konten dan rilis | Tulis catatan nyata, deploy |

---

## Fase 0: Cek posisi

Buka Git Bash, lalu jalankan:

```bash
cd /d/APK/Project/Project1
pwd
ls -la
node -v
npm -v
git --version
```

Yang diharapkan:

- `pwd` menampilkan `/d/APK/Project/Project1`
- Node minimal `v22.23.4`. Kamu memakai Node 24.
- npm dan Git bisa dijalankan.
- Folder berisi `.git`, `README.md`, `docs/`, `templates/`, dan `.gitignore`.

Kalau `npm` diblokir di PowerShell, jangan pakai PowerShell. Di Git Bash, `npm` biasanya langsung bekerja. Kalau tidak, coba `npm.cmd -v`.

Cek commit terakhir:

```bash
git log --oneline -1
```

Kalau belum ada commit, buat:

```bash
git add .
git commit -m "docs: add PRD, README, and note template"
```

Jangan lanjut sebelum `node -v`, `npm -v`, dan `git log` berhasil.

---

## Fase 1: Halaman Astro pertama

**Tujuan:** membuktikan Astro bisa menampilkan satu halaman. Belum ada Tailwind, React, graph, atau pencarian.

### 1.1 Buat folder halaman

```bash
mkdir -p src/pages
```

### 1.2 Buat `package.json`

Pastikan kamu berada di `/d/APK/Project/Project1`. Jalankan:

```bash
cat > package.json <<'EOF'
{
  "name": "arsip",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  }
}
EOF
```

### 1.3 Buat `.gitignore`

```bash
cat > .gitignore <<'EOF'
node_modules/
dist/
.astro/
EOF
```

### 1.4 Buat halaman pertama

```bash
cat > src/pages/index.astro <<'EOF'
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Arsip</title>
  </head>
  <body>
    <h1>Arsip</h1>
    <p>Catatan yang saling terhubung.</p>
  </body>
</html>
EOF
```

### 1.5 Install Astro saja

```bash
npm install astro@7.4.13
```

Tunggu sampai selesai. Perintah ini membuat `node_modules/` dan `package-lock.json`, lalu menambahkan Astro ke `package.json`.

### 1.6 Jalankan server

```bash
npm run dev
```

Buka `http://localhost:4321` di browser. Yang diharapkan: halaman putih dengan tulisan **Arsip** dan satu kalimat.

Cek juga di lebar 360 px lewat DevTools. Belum ada desain, jadi yang penting tidak ada error dan halaman bisa dibuka.

Hentikan server dengan `Ctrl + C`.

### 1.7 Build produksi

```bash
npm run build
```

Yang diharapkan: folder `dist/` dibuat dan tidak ada error.

### 1.8 Commit

```bash
git add package.json package-lock.json .gitignore src
git commit -m "feat: add minimal Astro page"
```

**Berhenti di sini.** Kirim hasil `npm run dev` dan `npm run build`. Setelah berhasil, lanjut ke Fase 2.

---

## Fase 2: Tailwind dan tampilan dasar

**Tujuan:** halaman memakai Tailwind, font yang benar, mode terang/gelap, header, footer, dan layout dasar.

### 2.1 Install paket fase ini

```bash
npm install tailwindcss@4.3.5 @tailwindcss/vite@4.3.5 @tailwindcss/typography@0.5.20 @fontsource-variable/geist@5.3.0 @fontsource-variable/newsreader@5.3.0 astro-icon@1.2.0 @iconify-json/ph@1.2.2
```

```bash
npm install -D @astrojs/check@0.9.12 typescript@6.0.3 @types/node@24.19.2
```

### 2.2 Tambah script cek

Ubah `package.json` sampai bagian `scripts` menjadi:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "check": "astro check"
}
```

### 2.3 Buat konfigurasi Astro

Buat `astro.config.mjs`:

```js
// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://example.com',
  integrations: [icon()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

`site` masih placeholder. Nanti diganti dengan domain asli sebelum deploy.

### 2.4 Buat konfigurasi TypeScript

Buat `tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

### 2.5 Buat konfigurasi situs

Buat `src/config.ts`:

```ts
export const siteConfig = {
  title: 'Arsip',
  tagline: 'Catatan yang saling terhubung.',
  description:
    'Arsip materi yang saya pelajari, tumbuh jadi peta yang bisa dijelajahi.',
  url: 'https://example.com',
  author: 'Rian Indra Pratama',
  contact: '',
  recentNotes: 6,
};
```

### 2.6 Buat token desain

Buat `src/styles/global.css` dengan isi berikut. Mode terang tetap hijau editorial. Mode gelap memakai palet synthwave tenang: violet gelap, teks lavender, aksen magenta.

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

:root {
  --bg: #f4f5f2;
  --surface: #fbfcfa;
  --ink: #15191b;
  --muted: #59635e;
  --line: #d8ddd8;
  --accent: #0e6b4f;
  --accent-soft: #e3efe9;
  color-scheme: light;
}

[data-theme="dark"] {
  --bg: #0b0614;
  --surface: #140b24;
  --ink: #f0e9ff;
  --muted: #a99bc4;
  --line: #2e2147;
  --accent: #ff4fd8;
  --accent-soft: #2a0f2e;
  color-scheme: dark;
}

[data-theme="dark"] .wordmark-dot {
  text-shadow: 0 0 14px color-mix(in srgb, var(--accent) 65%, transparent);
}

[data-theme="dark"] :focus-visible:not(main) {
  box-shadow: 0 0 14px color-mix(in srgb, var(--accent) 45%, transparent);
}

@theme inline {
  --font-sans: "Geist Variable", ui-sans-serif, system-ui, sans-serif;
  --font-serif: "Newsreader Variable", ui-serif, Georgia, serif;
  --color-paper: var(--bg);
  --color-surface: var(--surface);
  --color-ink: var(--ink);
  --color-muted: var(--muted);
  --color-line: var(--line);
  --color-accent: var(--accent);
  --color-accent-soft: var(--accent-soft);
}

@layer base {
  html {
    scroll-behavior: smooth;
  }

  body {
    background: var(--bg);
    color: var(--ink);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }

  h1,
  h2,
  h3 {
    font-family: var(--font-serif);
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  a {
    color: var(--accent);
  }

  ::selection {
    background: var(--accent);
    color: var(--bg);
  }

  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }

    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}

.skip-link {
  position: absolute;
  left: 1rem;
  top: -100px;
  z-index: 50;
  background: var(--bg);
  color: var(--ink);
  padding: 0.75rem 1rem;
  border: 1px solid var(--line);
  border-radius: 999px;
}

.skip-link:focus {
  top: 1rem;
}
```

### 2.7 Buat layout dan komponen

File yang perlu dibuat:

- `src/layouts/BaseLayout.astro`
- `src/components/Header.astro`
- `src/components/Footer.astro`
- `src/components/ThemeToggle.astro`
- `src/pages/index.astro` (ganti halaman Fase 1)

Perilaku yang harus ada:

**BaseLayout**
- Mengimpor font Geist dan Newsreader dari Fontsource.
- Mengimpor `global.css`.
- Menulis tema sebelum halaman digambar agar tidak berkedip.
- `lang="id"`, skip link, header, slot utama, footer.
- Menerima `title` dan `description`.

**Header**
- Wordmark `arsip.`
- Titik wordmark memakai class `wordmark-dot` agar mendapat glow magenta tipis di mode gelap.
- Tautan Catatan, Topik, Tentang.
- Tombol tema.
- Satu baris di desktop dan 360 px.
- Tombol pencarian baru ditambahkan di Fase 6, jangan buat tombol mati sekarang.

**Footer**
- Nama penulis dan tahun berjalan.
- Nanti ditambah tautan RSS, Semua catatan, dan Tentang saat halamannya sudah ada.

**ThemeToggle**
- Tombol dengan `aria-label`.
- Mengubah `data-theme` di `<html>`.
- Menyimpan pilihan ke `localStorage`.
- Ikon matahari dan bulan dari Phosphor.

**Halaman utama**
- H1: "Catatan yang saling terhubung."
- Subteks: "Arsip materi yang saya pelajari, tumbuh jadi peta yang bisa dijelajahi. Cari langsung atau ikuti tautannya."
- Belum ada graph. Area graph disiapkan di Fase 5.
- Tanpa kartu, tanpa eyebrow, tanpa animasi scroll.

Minta isi keempat file komponen kepada saya saat sudah sampai langkah ini. Jangan menebak sendiri dulu.

### 2.8 Cek manual di browser

Jalankan:

```bash
npm run dev
```

Buka `http://localhost:4321`, lalu periksa:

- Header dan footer tampil.
- Wordmark, nav, dan tombol tema terbaca.
- Tombol tema mengganti terang/gelap.
- Pilihan tema tetap setelah refresh.
- Tidak ada scroll horizontal di 360 px.
- Teks terang dan gelap sama-sama terbaca.
- Tab menampilkan focus ring.
- Console tidak ada error atau 404 font/CSS.

"Manual check" artinya pemeriksaan dengan mata dan klik di browser. Bukan test otomatis.

### 2.9 Cek otomatis

Hentikan dev server, lalu:

```bash
npm run check
npm run build
```

`npm run check` memeriksa tipe TypeScript dan struktur Astro. `npm run build` membuat hasil produksi di `dist/`.

### 2.10 Commit

```bash
git add .
git commit -m "feat: add Tailwind design shell"
```

**Berhenti di sini** dan kirim hasil `npm run check` serta `npm run build`.

---

## Fase 3: Model konten dan tautan

**Tujuan:** catatan Markdown punya aturan yang jelas, tautan `[[slug]]` bisa dibaca, dan data graph dihitung saat build.

### 3.1 Install paket

```bash
npm install yaml@2.9.1 unist-util-visit@5.2.0
npm install @astrojs/markdown-remark@7.3.10
npm install -D vitest@5.1.1 @types/mdast@4.0.4
```

Astro 7 memakai Sätteri sebagai prosesor Markdown default. Plugin `remark` hanya berjalan bila `@astrojs/markdown-remark` terpasang. Daftarkan plugin lewat `markdown.processor`:

```js
import { unified } from '@astrojs/markdown-remark';

markdown: {
  processor: unified({
    remarkPlugins: [[remarkWikiLinks, { resolve: resolveWikiLink }]],
  }),
},
```

Jangan memakai `markdown.remarkPlugins`; bidang itu sudah deprecated di Astro 7.

### 3.2 File yang dibuat

- `src/content.config.ts`: skema frontmatter.
- `src/lib/wiki-links.ts`: parser `[[...]]` dan plugin Markdown.
- `src/lib/graph.ts`: node, edge, backlink, related, validasi.
- `src/lib/slug.ts`: pembuat slug dari judul.
- `astro.config.mjs`: plugin `remark` untuk tautan `[[slug]]` lewat `markdown.processor`.
- `tests/wiki-links.test.ts`
- `tests/graph.test.ts`
- `tests/slug.test.ts`
- `vitest.config.ts`

### 3.3 Aturan frontmatter

```yaml
---
title: "Cara kerja HTTP"
summary: "Penjelasan singkat request, response, dan status code yang sering dipakai."
date: 2026-11-19
updated: 2026-11-19
tags: ["web", "jaringan"]
draft: false
---
```

- `title`: 3 sampai 100 karakter.
- `summary`: 20 sampai 160 karakter.
- `date`: `YYYY-MM-DD`.
- `updated`: opsional, tidak lebih awal dari `date`.
- `tags`: 1 sampai 3, huruf kecil, kebab-case.
- `draft`: default `false`.

Di Astro 7, impor `z` dari `astro/zod`. Impor `z` dari `astro:content` masih jalan tetapi sudah deprecated dan akan dihapus di Astro 8. `defineCollection` tetap diimpor dari `astro:content`.

### 3.4 Aturan tautan

- `[[cara-kerja-http]]` menjadi tautan dengan judul catatan.
- `[[cara-kerja-http|penjelasan HTTP]]` memakai teks sendiri.
- Tautan di dalam blok kode dan inline code diabaikan.
- Target harus ada.
- Tautan ke draft atau ke diri sendiri menggagalkan build produksi.
- Edge graph hanya berasal dari tautan ini. Tag hanya untuk filter dan catatan terkait.

### 3.5 Urutan kerja

1. Tulis test parser yang gagal.
2. Implementasikan parser sampai test lulus.
3. Tulis test graph: edge ganda, self-link, target hilang, draft, backlink, related.
4. Implementasikan graph sampai test lulus.
5. Tulis test slug.
6. Jalankan `npm test`.

### 3.6 Cek

```bash
npm test
npm run check
npm run build
```

Build harus tetap berhasil dengan nol catatan.

### 3.7 Commit

```bash
git add .
git commit -m "feat: add content schema and graph data"
```

**Berhenti di sini.** Kirim hasil `npm test`. Saya beri isi parser dan test lengkap agar tidak ada tebakan.

---

## Fase 4: Halaman catatan dan alur menulis

**Tujuan:** catatan bisa dibaca, diarsipkan, dikelompokkan per topik, dan dibuat lewat satu perintah.

### 4.1 File yang dibuat

- `src/lib/notes.ts`: memuat collection, menyaring draft, memvalidasi tautan.
- `src/components/NoteList.astro`
- `src/components/TopicChips.astro`
- `src/pages/catatan/index.astro`
- `src/pages/catatan/[slug].astro`
- `src/pages/topik/index.astro`
- `src/pages/topik/[tag].astro`
- `src/pages/tentang.astro`
- `src/pages/404.astro`
- `scripts/new-note.mjs`
- `templates/catatan.md` sudah ada, tidak perlu dibuat ulang.

### 4.2 Perilaku halaman

**Catatan**
- H1 judul, ringkasan, tanggal, waktu baca, tag.
- Isi Markdown dengan lebar 68 karakter.
- Daftar isi di desktop bila heading minimal 3.
- Backlink dan catatan terkait di akhir.
- Tanpa komentar dan tanpa tombol share.

**Arsip**
- Semua catatan, dikelompokkan per tahun.
- Empty state bila belum ada catatan.

**Topik**
- `/topik` menampilkan semua topik dan jumlah catatan.
- `/topik/[tag]` menampilkan catatan untuk satu topik.

**Tentang dan 404**
- Tentang menjelaskan situs dan penulis.
- 404 punya tautan ke beranda dan arsip.

**Generator**
- `npm run new -- "Judul catatan"` membuat file dari template.
- Nama file memakai slug.
- Tanggal diisi otomatis.
- `draft: true` agar tidak langsung terbit.
- Menolak menimpa file yang sudah ada.

### 4.3 Cek wajib

1. Build dengan nol catatan berhasil.
2. Satu catatan sementara muncul di arsip dan topik.
3. Tautan `[[tidak-ada]]` menggagalkan build dan menyebut file target.
4. Catatan `draft: true` tidak muncul di halaman produksi.
5. Hapus catatan sementara setelah selesai.

### 4.4 Commit

```bash
git add .
git commit -m "feat: add note pages and writing workflow"
```

---

## Fase 5: Graph

**Tujuan:** halaman utama menampilkan peta catatan yang bisa dijelajahi.

### 5.1 Install paket

```bash
npm install @astrojs/react@7.1.9 react@19.3.1 react-dom@19.3.1 d3-force@3.0.1
npm install -D @types/react@19.3.0 @types/react-dom@19.3.0 @types/d3-force@3.0.10
```

### 5.2 File yang dibuat

- `src/components/GraphExplorer.tsx`
- `src/components/GraphPanel.tsx` bila diperlukan
- `src/pages/index.astro` diubah untuk mengirim data graph
- `src/styles/global.css` ditambah gaya panel dan filter

### 5.3 Perilaku

- Kanvas 60vh di desktop, 380 px di ponsel.
- Node adalah catatan, garis adalah tautan.
- Ukuran node mengikuti jumlah tautan.
- Hover: node dan tetangganya menyala, sisanya meredup.
- Klik: buka catatan.
- Drag: pindahkan node tanpa membuka catatan.
- Filter topik dengan tombol `aria-pressed`.
- Ponsel: ketuk node menampilkan panel dengan judul, ringkasan, tag, dan tombol Baca.
- `prefers-reduced-motion`: gambar statis.
- Tanpa JavaScript: pesan dan tautan ke arsip.
- Graph kosong: empty state.
- Simulasi berhenti setelah dingin, tidak ada animasi terus-menerus.
- Batas nyaman 300 catatan.

### 5.4 Cek

- 0 catatan, 1 catatan, 2 catatan terpisah, dan 10 catatan.
- Judul panjang tidak keluar dari kanvas.
- 360 px dan desktop.
- Mode terang dan gelap.
- Reduced motion.
- CPU tidak naik terus setelah graph diam.

### 5.5 Commit

```bash
git add .
git commit -m "feat: add interactive note graph"
```

---

## Fase 6: Pencarian

**Tujuan:** pencarian instan untuk judul, isi, dan topik.

### 6.1 Install Pagefind

```bash
npm install -D pagefind@1.6.0
```

### 6.2 Ubah script build

```json
"build": "astro build && pagefind --site dist"
```

### 6.3 File yang dibuat

- `src/components/SearchDialog.astro`
- `src/scripts/search.ts`
- `src/components/Header.astro` ditambah tombol pencarian
- `src/layouts/BaseLayout.astro` memuat dialog

### 6.4 Aturan indeks

- `<article>` halaman catatan diberi `data-pagefind-body`.
- Header, footer, dan graph diberi `data-pagefind-ignore`.
- Pagefind hanya tersedia setelah build. Di `npm run dev`, tampilkan pesan yang jelas.

### 6.5 Perilaku

- Tombol pencarian di header.
- Pintasan `Ctrl/Cmd + K` dan `/` saat fokus bukan di input.
- Dialog dengan input autofocus.
- Hasil berisi judul, cuplikan, dan tag.
- Navigasi panah atas/bawah dan Enter.
- Escape menutup dan mengembalikan fokus.
- Ada empty state, no-result, dan error load.
- Ponsel memenuhi layar.

### 6.6 Cek

```bash
npm run build
npm run preview
```

Cari kata dari judul, isi, tag, dan kueri yang tidak ada. Coba hanya dengan keyboard. Cek 360 px.

### 6.7 Commit

```bash
git add .
git commit -m "feat: add Pagefind search"
```

---

## Fase 7: SEO, RSS, dan sitemap

**Tujuan:** halaman mudah ditemukan mesin pencari dan dibagikan.

### 7.1 Install paket

```bash
npm install @astrojs/sitemap@3.7.6 @astrojs/rss@4.0.19
```

### 7.2 File yang dibuat

- `src/components/Seo.astro`
- `src/pages/rss.xml.ts`
- `src/pages/robots.txt.ts`
- `public/og.png`
- `public/favicon.svg`
- Integrasi sitemap di `astro.config.mjs`

### 7.3 Yang harus ada

- Title unik per halaman.
- Meta description dari `summary`.
- Canonical dari `siteConfig.url`.
- Open Graph dan Twitter Card.
- JSON-LD `BlogPosting` di catatan dan `WebSite` di beranda.
- RSS catatan non-draft.
- Sitemap otomatis.
- Robots mengarah ke sitemap.
- Gambar share 1200x630.

### 7.4 Cek

- Lihat source halaman: title, description, canonical, OG.
- Buka `/rss.xml`, `/sitemap-index.xml`, `/robots.txt`.
- Jalankan Lighthouse mobile di halaman catatan.
- Target: Performance, SEO, Accessibility minimal 95.

### 7.5 Commit

```bash
git add .
git commit -m "feat: add SEO metadata and feeds"
```

---

## Fase 8: Konten nyata dan deploy

**Tujuan:** situs terisi dan bisa dibuka publik.

### 8.1 Tulis catatan

```bash
npm run new -- "Judul catatan"
```

- Isi `summary` 120 sampai 160 karakter.
- Pilih 1 sampai 3 tag.
- Tautkan minimal satu catatan lain.
- Ubah `draft` menjadi `false` hanya saat siap.

Untuk rilis pertama, disarankan minimal 6 catatan yang saling tertaut.

### 8.2 Cek graph dan pencarian

- Graph punya beberapa cluster.
- Backlink muncul.
- Catatan terkait muncul.
- Pencarian menemukan isi catatan.
- Arsip dan topik benar.

### 8.3 Ganti URL asli

Ubah `siteConfig.url` dan `site` di `astro.config.mjs` menjadi domain asli. Tanpa ini, canonical, sitemap, dan RSS menunjuk alamat yang salah.

### 8.4 Deploy

- Push ke GitHub.
- Buat proyek Vercel atau Netlify.
- Build command: `npm run build`.
- Output: `dist`.
- Node 22.23.4 atau lebih baru.
- Tidak ada environment variable.

### 8.5 Cek produksi

- Graph terbuka.
- Klik node membuka catatan.
- Pencarian bekerja.
- Tema bertahan setelah refresh.
- 360 px rapi.
- RSS dan sitemap terbuka.
- Lighthouse memenuhi target.

### 8.6 Tag rilis

```bash
git add .
git commit -m "content: publish first notes"
git tag v1.0.0
```

---

## Kamus error

| Error | Arti | Tindakan |
|---|---|---|
| `EJSONPARSE` | `package.json` kosong atau bukan JSON valid | Isi dengan JSON yang benar, cek koma dan tanda kutip |
| `npm.ps1 cannot be loaded` | Execution policy PowerShell | Pakai Git Bash atau `npm.cmd` |
| `Cannot find package 'astro'` | Dependency belum terpasang | `npm install`, pastikan berada di folder proyek |
| `astro: not found` | Script dijalankan di folder salah | `pwd`, lalu `cd /d/APK/Project/Project1` |
| `npm run build` gagal di Pagefind | Pencarian belum dibangun | Sementara pakai `npx astro build`, penuh di Fase 6 |
| CSS tidak muncul | `global.css` belum diimpor | Impor di layout |
| Tema tidak bertahan | Script tema belum jalan | Cek `localStorage` dan `data-theme` |
| Port 4321 dipakai | Server lain masih hidup | `Ctrl + C` atau `npm run dev -- --port 4322` |
| Build gagal karena `[[...]]` | Target tautan tidak ada | Perbaiki slug atau buat catatannya |
| Halaman 404 di awal | Halaman belum dibuat | Normal sebelum Fase 4 |

## Struktur akhir

```
Project1/
├── docs/
│   ├── PRD.md
│   └── superpowers/plans/2026-11-20-arsip-implementation.md
├── public/
│   ├── favicon.svg
│   └── og.png
├── scripts/
│   └── new-note.mjs
├── src/
│   ├── components/
│   ├── content/catatan/
│   ├── layouts/
│   ├── lib/
│   ├── pages/
│   ├── styles/global.css
│   ├── config.ts
│   └── content.config.ts
├── templates/catatan.md
├── .gitignore
├── astro.config.mjs
├── package.json
├── README.md
└── tsconfig.json
```

## Checklist rilis

- [ ] `npm run check` lulus.
- [ ] `npm test` lulus.
- [ ] `npm run build` lulus.
- [ ] Minimal 6 catatan saling tertaut.
- [ ] Graph bekerja di 360 px dan desktop.
- [ ] Pencarian bekerja lewat `npm run preview`.
- [ ] Tema terang dan gelap lolos kontras.
- [ ] Reduced motion mematikan animasi.
- [ ] RSS, sitemap, robots, canonical, dan JSON-LD benar.
- [ ] URL asli sudah menggantikan `https://example.com`.
- [ ] Lighthouse mobile memenuhi target.
- [ ] Tidak ada tautan putus.
- [ ] Tidak ada em dash di teks yang tampil.

## Yang belum termasuk

- Akun dan login.
- Komentar.
- Editor online atau CMS.
- Database.
- Newsletter.
- Multi-bahasa.
- Gambar OG per catatan.
- Pan dan zoom graph.

## Catatan versi

Tutorial ini memakai Astro 7.4.13, React 19.3.1, Tailwind 4.3.5, Pagefind 1.6.0, dan Node 22.23.4 atau lebih baru. Versi boleh berbeda selama tidak ada error kompatibilitas.
