# Phase 4 Implementation Plan: Note Pages and Writing Workflow

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Catatan bisa dibaca, diarsipkan, dikelompokkan per topik, dan dibuat lewat satu perintah.

**Architecture:** Data collection dibaca di setiap halaman lewat `getCollection`, lalu diubah oleh helper murni di `src/lib/notes.ts`. Halaman memakai komponen daftar dan chip yang sama. Generator menyalin `templates/catatan.md` dan mengisi judul, slug, serta tanggal.

**Tech Stack:** Astro 7, Tailwind CSS 4, TypeScript, Vitest, Node 24.

**Spec:** [docs/PRD.md](../../PRD.md) bagian 8 dan 9; [tutorial Fase 4](./2026-11-20-arsip-implementation.md).

## Global Constraints

- Semua teks yang tampil berbahasa Indonesia. Tanpa em dash.
- Satu aksen per mode. Jangan menambah warna baru.
- Situs harus benar dengan nol catatan: arsip dan topik punya empty state.
- `draft: true` tampil hanya di `npm run dev`, dengan label "Draft". Build produksi tidak membangun halaman, daftar, topik, atau tautan draft.
- Build produksi gagal dengan pesan jelas bila ada tautan `[[...]]` yang hilang, menunjuk draft, atau menunjuk diri sendiri, dan bila judul catatan duplikat.
- Artikel catatan maksimal 68 karakter, daftar isi hanya di desktop bila ada minimal 3 heading.
- Semua tautan internal memakai trailing slash, mengikuti output statis Astro.
- Tanggal diformat `id-ID` dengan zona waktu UTC agar tidak bergeser.
- Jangan membuat catatan contoh permanen. Fixture sementara wajib dihapus setelah verifikasi.
- Satu commit di akhir Fase 4: `feat: add note pages and writing workflow`.

## Review Focus

- Build dengan nol catatan tidak menghasilkan error.
- Draft tidak bocor ke produksi, tetapi terlihat di dev.
- Tautan putus menggagalkan build dan pesannya menyebut file dan target.
- Backlink dan catatan terkait tidak menampilkan draft atau tautan ganda.
- Daftar isi tidak muncul di ponsel dan tidak muncul bila heading kurang dari 3.
- Generator menolak menimpa file dan selalu menulis `draft: true`.
- 360 px tidak scroll horizontal, mode terang dan gelap terbaca, fokus keyboard terlihat.

---

## Task 1: Helper catatan murni

**Files:**
- Create: `src/lib/notes.ts`
- Create: `tests/notes.test.ts`

**Interfaces:**
- Consumes: `NoteInput`, `validateWikiLinks` dari `src/lib/graph.ts`; tipe `CollectionEntry` dari `astro:content` (type-only).
- Produces:
  - `interface Note extends NoteInput { date: Date; updated?: Date; readingMinutes: number }`
  - `prepareNotes(entries: NoteEntry[], options?: { includeDrafts?: boolean; strict?: boolean }): Note[]`
  - `readingMinutes(body: string): number`
  - `formatReadingTime(minutes: number): string`
  - `formatDate(date: Date): string`
  - `formatShortDate(date: Date): string`
  - `formatTag(tag: string): string`
  - `groupByYear(notes: Note[]): { year: number; notes: Note[] }[]`
  - `collectTags(notes: Note[]): { tag: string; count: number }[]`
  - `assertValidNotes(notes: Note[]): void`

- [ ] **Step 1: Tulis test yang gagal**

Buat `tests/notes.test.ts` dengan kasus:
1. `readingMinutes` membulatkan ke atas dengan 200 kata per menit dan minimal 1.
2. `formatReadingTime(4)` menghasilkan `"4 menit baca"`.
3. `formatDate` menghasilkan `"19 November 2026"` dan `formatShortDate` menghasilkan `"19 Nov 2026"`.
4. `formatTag("desain-produk")` menghasilkan `"Desain produk"`.
5. `groupByYear` mengurutkan tahun terbaru dulu dan catatan terbaru dulu di dalam tahun.
6. `collectTags` mengurutkan jumlah terbanyak lalu alfabetis.
7. `prepareNotes` menyaring draft saat `includeDrafts` false dan mempertahankannya saat true.
8. `prepareNotes` melempar error yang menyebut file dan target saat `strict` true dan ada tautan hilang dari catatan terbit.
9. `prepareNotes` melempar error saat ada judul duplikat.
10. `prepareNotes` tidak melempar saat `strict` false.
11. `prepareNotes` mengabaikan tautan putus dari catatan draft saat `strict`.

Jalankan `npm test` dan pastikan test baru gagal karena modul belum ada.

- [ ] **Step 2: Implementasi minimal**

Buat `src/lib/notes.ts`. `NoteEntry` adalah `CollectionEntry<"catatan">`. `prepareNotes` memetakan entry ke `Note`, memvalidasi tautan dan judul catatan terbit bila `strict`, lalu menyaring draft sesuai opsi dan mengurutkan tanggal menurun. Catatan draft tidak diperiksa sebagai sumber tautan, tetapi tetap dianggap target yang tidak boleh ditautkan sebelum terbit.

Pesan error tautan:

```
Build dihentikan: tautan catatan tidak valid.
- <file>: [[<target>]] (target tidak ditemukan|menunjuk catatan draft|menunjuk diri sendiri)
```

Pesan judul duplikat:

```
Build dihentikan: judul catatan harus unik.
- "<judul>": <file-a>, <file-b>
```

- [ ] **Step 3: Jalankan test**

Run: `npm test`

Expected: semua test lulus.

---

## Task 2: Komponen daftar dan chip

**Files:**
- Create: `src/components/NoteList.astro`
- Create: `src/components/TopicChips.astro`
- Modify: `src/styles/global.css` bila perlu gaya chip

**Interfaces:**
- `NoteList` props: `notes: Note[]`, `variant?: "default" | "compact"`, `headingLevel?: 2 | 3`, `emptyMessage?: string`, `emptyHref?: string`, `emptyLabel?: string`.
- `TopicChips` props: `topics: { tag: string; count?: number }[]`, `activeTag?: string`, `label?: string`.

- [ ] **Step 1: Buat NoteList**

Baris daftar berisi tanggal, label Draft bila perlu, judul sebagai tautan, ringkasan, dan chip topik. `variant="compact"` hanya menampilkan tanggal dan judul. Tanpa kartu, tanpa bayangan, hanya garis pemisah.

- [ ] **Step 2: Buat TopicChips**

Chip berupa tautan pill. Bila `count` ada, tampilkan jumlah. Bila `activeTag` sama, pakai `aria-current="page"` dan gaya aksen lembut.

- [ ] **Step 3: Cek tipe**

Run: `npm run check`

Expected: 0 error. Komponen belum dipakai, jadi belum ada cek visual.

---

## Task 3: Halaman arsip dan topik

**Files:**
- Create: `src/pages/catatan/index.astro`
- Create: `src/pages/topik/index.astro`
- Create: `src/pages/topik/[tag].astro`

**Interfaces:**
- Consumes: `prepareNotes`, `groupByYear`, `collectTags`, `formatTag`; `NoteList`, `TopicChips`.
- Produces rute `/catatan/`, `/topik/`, `/topik/[tag]/`.

- [ ] **Step 1: Halaman arsip**

`getCollection("catatan")` lalu `prepareNotes(entries, { includeDrafts: import.meta.env.DEV, strict: import.meta.env.PROD })`. H1 "Semua catatan", jumlah catatan, kelompok per tahun. Empty state "Belum ada catatan." dengan tautan ke `/tentang/`.

- [ ] **Step 2: Halaman topik**

H1 "Topik", satu kalimat pengantar, semua topik urut jumlah lalu alfabetis, masing-masing menuju `/topik/<tag>/`. Empty state "Belum ada topik."

- [ ] **Step 3: Halaman topik tunggal**

`getStaticPaths` membuat satu rute per tag unik. H1 nama topik yang diformat, jumlah catatan, `NoteList`, lalu `TopicChips` topik lain dengan `activeTag`.

- [ ] **Step 4: Verifikasi build nol catatan**

Run: `npm run build`

Expected: build lulus, dua rute statis baru ada (`/catatan/` dan `/topik/`).

---

## Task 4: Halaman catatan

**Files:**
- Create: `src/pages/catatan/[slug].astro`
- Create: `scripts/validate-notes.mjs`
- Modify: `src/styles/global.css` untuk warna `prose` dan blok kode
- Modify: `package.json` untuk `prebuild`

**Interfaces:**
- Consumes: `prepareNotes`, `findBacklinks`, `findRelated`, `render`, `NoteList`, `TopicChips`.
- Produces rute `/catatan/[slug]/` dengan daftar isi, backlink, dan catatan terkait.

- [ ] **Step 1: getStaticPaths**

Muat semua catatan dengan draft bila dev. Untuk setiap catatan, hitung backlink dan related dari daftar yang sama. Kirim `note`, `entry`, `backlinks`, dan `related` sebagai props.

- [ ] **Step 2: Susun halaman**

Tautan "Semua catatan", H1, meta tanggal, updated, waktu baca, dan chip topik. Ringkasan sebagai paragraf pembuka. `<Content />` di dalam `article` dengan lebar 68ch.

- [ ] **Step 3: Daftar isi**

Filter heading depth 2 dan 3. Tampilkan `nav aria-label="Daftar isi"` yang lengket hanya di `lg` bila jumlah heading minimal 3. Di ponsel tidak dirender.

- [ ] **Step 4: Backlink dan terkait**

Tampilkan "Ditautkan dari" dan "Catatan terkait" memakai `NoteList variant="compact"` bila tidak kosong.

- [ ] **Step 5: Tipografi**

Tambahkan variabel `--tw-prose-*` yang membaca token situs. Blok kode memakai permukaan, garis, radius 8 px, dan scroll horizontal. Bila output Shiki punya `data-language`, tampilkan label bahasa lewat CSS.

- [ ] **Step 6: Validator pra-build**

Buat `scripts/validate-notes.mjs` yang membaca frontmatter dan body setiap file di `src/content/catatan/`, lalu memeriksa tautan putus, tautan ke draft, tautan ke diri sendiri, dan judul terbit yang duplikat. Jalankan lewat `"prebuild": "node --no-warnings scripts/validate-notes.mjs"` agar `npm run build` berhenti dengan exit code 1 dan pesan yang menyebut file serta target sebelum Astro berjalan.

Validator terpisah diperlukan karena Astro 7 di Windows crash setelah `getStaticPaths` melempar error validasi. Tautan dari catatan draft tidak diperiksa, tetapi tautan publik yang menunjuk draft tetap ditolak.

- [ ] **Step 7: Verifikasi dengan fixture sementara**

Buat dua catatan sementara yang saling tertaut, satu draft, dan satu tautan putus bergiliran. Cek:
1. Catatan muncul di `/catatan/` dan `/topik/`.
2. Halaman catatan memuat backlink dan related yang benar.
3. Draft tidak muncul saat `npm run build`, tetapi muncul saat `npm run dev`.
4. Tautan putus menggagalkan build dan pesannya menyebut file serta target.
5. Hapus fixture dan build ulang.

---

## Task 5: Tentang dan 404

**Files:**
- Create: `src/pages/tentang.astro`
- Create: `src/pages/404.astro`

- [ ] **Step 1: Tentang**

Jelaskan situs, penulis, topik yang dibahas (chip dari data nyata, maksimal 8), cara situs dibangun, dan kontak bila `siteConfig.contact` diisi. Tautan ke beranda dan arsip. Tanpa foto stok.

- [ ] **Step 2: 404**

Pesan tenang, tautan ke beranda dan arsip. H1 "Halaman tidak ditemukan".

- [ ] **Step 3: Build**

Run: `npm run build`

Expected: `/tentang/index.html` dan `/404.html` ada.

---

## Task 6: Generator catatan

**Files:**
- Create: `scripts/new-note.ts`
- Create: `tests/new-note.test.ts`
- Modify: `package.json` untuk script `"new"`

**Interfaces:**
- Consumes: `slugify` dari `src/lib/slug.ts`, `templates/catatan.md`.
- Produces:
  - `renderNote(template: string, options: { title: string; date: string }): string`
  - `createNote(options: { root?: string; title: string; date?: string }): { slug: string; target: string; relative: string }`
  - CLI `npm run new -- "Judul catatan"`.

- [ ] **Step 1: Tulis test yang gagal**

Test `renderNote` mengganti judul, `date`, dan `updated`, memaksa `draft: true` meskipun template berisi `draft: false`, serta meng-escape `"` dan `\`. Test `createNote` menulis file baru, memakai slug, membuat folder, dan menolak file yang sudah ada. Gunakan direktori sementara dari `node:os`.

- [ ] **Step 2: Implementasi**

Validasi judul 3 sampai 100 karakter setelah spasi dirapikan. Escape `"` dan `\` untuk YAML. Buat file dengan flag `wx` agar tidak menimpa. Tanggal default memakai tanggal lokal `YYYY-MM-DD`. Cetak path relatif dan langkah berikutnya.

- [ ] **Step 3: Daftarkan script**

`"new": "node --no-warnings scripts/new-note.ts"`. Node 24 menjalankan TypeScript langsung lewat type stripping, jadi test bisa mengimpor fungsi tanpa file deklarasi terpisah.

- [ ] **Step 4: Jalankan test dan CLI**

Run: `npm test`, lalu `npm run new -- "Catatan Uji Generator"`.

Expected: file `src/content/catatan/catatan-uji-generator.md` dibuat dengan `draft: true`. Hapus file itu setelah dicek.

---

## Task 7: Verifikasi akhir, dokumentasi, commit

**Files:**
- Modify: `README.md` untuk perintah, aturan tautan, dan struktur
- Modify: `docs/PRD.md` untuk aturan tautan dan struktur
- Modify: `docs/superpowers/plans/2026-11-20-arsip-implementation.md` untuk tutorial Fase 4

- [ ] **Step 1: Jalankan pemeriksaan penuh**

Run: `npm test`, `npm run check`, `npm run build`

Expected: semua lulus dengan nol catatan.

- [ ] **Step 2: Uji integrasi lengkap**

Dengan fixture sementara:
1. Dua catatan saling tertaut muncul di arsip, topik, dan halaman catatan.
2. Draft tidak muncul di build produksi.
3. Tautan putus menggagalkan build.
4. Backlink dan related benar.
5. Hapus fixture, build ulang, pastikan bersih.

- [ ] **Step 3: Tinjau tampilan**

Jalankan `npm run dev`, cek 360 px dan desktop, mode terang dan gelap, keyboard, serta daftar isi.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add note pages and writing workflow"
```
