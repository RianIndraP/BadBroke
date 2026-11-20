# Arsip

Arsip adalah situs statis untuk menyimpan materi yang saya pelajari sebagai catatan Markdown yang saling terhubung. Halaman utama menampilkan peta jaringan catatan. Klik satu titik untuk membuka materinya.

Situs publik, tanpa akun dan tanpa database. Desain lengkap dan keputusan produk ada di [docs/PRD.md](docs/PRD.md).

> **Status:** PRD disetujui 20 November 2026. Implementasi dimulai. Penulis: Rian Indra Pratama.

## Stack

- [Astro 7](https://astro.build) dengan output statis
- TypeScript strict
- Tailwind CSS v4
- React 19 hanya untuk island graph
- [`d3-force`](https://d3js.org/d3-force) dan canvas untuk peta catatan
- [Pagefind](https://pagefind.app) untuk pencarian, diindeks saat build
- Geist dan Newsreader, di-self-host lewat Fontsource
- Ikon Phosphor lewat `astro-icon`

## Menjalankan

Butuh Node.js 22.23.4 atau lebih baru dan npm. Proyek ini dikembangkan dengan Node 24 dan npm 11.

```bash
npm install
npm run dev
```

Buka `http://localhost:4321`.

```bash
npm run build
npm run preview
```

Pencarian hanya aktif pada hasil build. Untuk menguji pencarian, jalankan `npm run build` lalu `npm run preview`, bukan `npm run dev`.

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi ke `dist/`, termasuk indeks Pagefind |
| `npm run preview` | Pratinjau hasil build |
| `npm run check` | Cek tipe dan validasi Astro |
| `npm test` | Jalankan test Vitest |
| `npm run new -- "Judul catatan"` | Buat catatan baru dari template |

## Menulis catatan

### Cara cepat

```bash
npm run new -- "Cara kerja HTTP"
```

Perintah ini membuat `src/content/catatan/cara-kerja-http.md` dari `templates/catatan.md`, mengisi tanggal hari ini, dan membiarkannya sebagai draft. Buka file itu, tulis, lalu ubah `draft: false` saat siap terbit.

### Cara manual

PowerShell:

```powershell
Copy-Item templates\catatan.md src\content\catatan\cara-kerja-http.md
```

Bash:

```bash
cp templates/catatan.md src/content/catatan/cara-kerja-http.md
```

Nama file adalah URL. `cara-kerja-http.md` menjadi `/catatan/cara-kerja-http`. Gunakan huruf kecil, angka, dan tanda hubung saja. Jangan ganti nama file setelah catatan dipublikasikan karena tautan dan URL akan putus.

### Frontmatter

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

| Field | Wajib | Aturan |
|---|---|---|
| `title` | ya | 3 sampai 100 karakter, unik |
| `summary` | ya | 20 sampai 160 karakter, dipakai sebagai meta description |
| `date` | ya | `YYYY-MM-DD`, tidak di masa depan |
| `updated` | tidak | `YYYY-MM-DD`, tidak lebih awal dari `date` |
| `tags` | ya | 1 sampai 3 tag, huruf kecil, kebab-case |
| `draft` | tidak | Default `false`. `true` menyembunyikan catatan dari produksi |

### Menautkan catatan

Tautan antar catatan memakai sintaks Obsidian:

```md
Lihat [[cara-kerja-http]] untuk dasar request dan response.

Atau dengan teks sendiri: [[cara-kerja-http|penjelasan HTTP]].
```

Aturan:

- `[[slug]]` memakai judul catatan sebagai teks tautan.
- `[[slug|teks]]` memakai teks yang kamu tulis.
- Target wajib ada. Build produksi gagal jika target tidak ditemukan, masih draft, atau menunjuk ke diri sendiri.
- Tautan dari catatan draft tidak diperiksa sampai draft diterbitkan. Jadi draft baru boleh berisi tautan placeholder, tetapi tautan publik yang menunjuk draft tetap menggagalkan build.
- Tautan di dalam blok kode dan inline code diabaikan.
- Tautan ini yang membentuk garis di graph dan bagian "Ditautkan dari" pada halaman catatan.
- Catatan dengan tag sama otomatis muncul sebagai "Catatan terkait", maksimal empat.

### Tag dan draft

- Gunakan 1 sampai 3 tag per catatan. Pakai tag yang sudah ada bila cocok, karena tag yang berbeda untuk hal yang sama memecah topik.
- Halaman `/topik/[tag]` dibuat otomatis dari tag yang dipakai.
- `draft: true` berarti catatan tidak dibangun, tidak masuk graph, arsip, RSS, sitemap, atau pencarian.
- Draft tetap file biasa di repo. Jika repo publik, isinya tetap terlihat di GitHub. Jangan simpan materi sensitif.

### Yang divalidasi saat build

- Frontmatter sesuai skema.
- Tanggal valid dan urutannya benar.
- Setiap target `[[...]]` pada catatan terbit ada.
- Tidak ada tautan dari catatan terbit ke draft.
- Tidak ada tautan ke diri sendiri.
- Judul catatan terbit tidak duplikat.

Pemeriksaan tautan dan judul berjalan lewat `scripts/validate-notes.mjs` sebelum Astro membangun halaman. Kalau ada yang salah, build berhenti dengan pesan yang menyebut file dan masalahnya. Tautan di dalam catatan draft belum diperiksa; tautan itu baru wajib benar saat draft diubah menjadi terbit.

## Struktur proyek

```
.
├── docs/PRD.md
├── public/
│   ├── favicon.svg
│   └── og.png
├── scripts/
│   ├── new-note.ts          # Generator catatan
│   └── validate-notes.mjs   # Validasi tautan dan judul sebelum build
├── src/
│   ├── components/         # Header, footer, daftar catatan, graph, pencarian
│   ├── content/catatan/    # Semua catatan .md
│   ├── layouts/            # Layout dasar
│   ├── lib/                # Parser tautan, graph, format tanggal
│   ├── pages/              # Rute
│   ├── styles/global.css   # Token desain dan Tailwind
│   ├── config.ts           # Nama, domain, penulis
│   └── content.config.ts   # Skema frontmatter
├── templates/catatan.md    # Template menulis
├── astro.config.mjs
└── package.json
```

## Konfigurasi situs

Ubah `src/config.ts` sebelum deploy:

- `title` dan `tagline`: nama situs dan deskripsi singkat.
- `url`: alamat kanonik tanpa garis miring di akhir. Wajib benar agar canonical, sitemap, dan RSS valid.
- `author`: nama penulis untuk JSON-LD dan footer.
- `contact`: email atau tautan yang ditampilkan di halaman Tentang.
- `recentNotes`: jumlah catatan di beranda, default 6.

Nama kerja "Arsip" bisa diganti tanpa menyentuh komponen.

## SEO

Yang sudah otomatis:

- HTML statis dan cepat.
- Title dan meta description per halaman.
- Canonical dari `config.url`.
- Open Graph dan Twitter Card dengan gambar default.
- Sitemap, RSS, dan robots.txt.
- JSON-LD `BlogPosting` per catatan dan `WebSite` di beranda.
- Tautan internal dari graph, backlink, tag, dan arsip.

Yang perlu kamu lakukan per catatan:

- Tulis judul yang jelas, bukan puitis.
- Isi `summary` 120 sampai 160 karakter yang menjelaskan isi.
- Pilih 1 sampai 3 tag yang konsisten.
- Tautkan minimal satu catatan lain.
- Cantumkan sumber di bagian "Sumber" bila materinya berasal dari luar.
- Pastikan `date` dan `updated` benar.

Gambar OG per catatan belum ada di v1. Semua halaman memakai `public/og.png`.

## Desain

- Token warna dan tipografi ada di `src/styles/global.css`.
- Satu aksen per mode: hijau di mode terang, magenta di mode gelap. Jangan menambah aksen kedua.
- Mode terang dan gelap sama-sama diuji.
- Font: Newsreader untuk judul dan isi, Geist untuk antarmuka.
- Radius: tombol dan chip pill, panel 14 px, kode 8 px.
- Gerak dibatasi pada graph dan umpan balik hover. `prefers-reduced-motion` mematikan animasi.
- Tanpa em dash di teks yang tampil.

## Deploy

Situs ini statis. Vercel, Netlify, atau Cloudflare Pages semuanya bisa.

1. Isi `url` di `src/config.ts` dengan domain final.
2. Push repo.
3. Di layanan hosting, set build command `npm run build` dan output directory `dist`.
4. Node.js 22.23.4 atau lebih baru.

Tidak ada environment variable yang dibutuhkan.

## Aksesibilitas dan batasan v1

- Graph adalah navigasi pelengkap. Semua catatan bisa diakses lewat arsip, topik, catatan terbaru, dan pencarian.
- Graph belum bisa dinavigasi dengan keyboard. Ini batasan sadar untuk v1.
- Pencarian baru tersedia setelah build.
- Target nyaman sampai sekitar 300 catatan. Di atas 500, layout graph perlu dihitung saat build.
- Belum ada komentar, akun, CMS, atau gambar OG per catatan.

## Lisensi

Kode mengikuti kebutuhan pemilik repo. Isi catatan adalah hak cipta penulis. Tidak ada lisensi terbuka di v1; footer menampilkan `© {tahun} {penulis}`. Bisa diganti menjadi CC BY atau CC BY-SA nanti.
