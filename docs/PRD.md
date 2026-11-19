# PRD: Arsip

**Status:** disetujui
**Tanggal:** 19 November 2026
**Disetujui:** 20 November 2026
**Penulis:** Rian Indra Pratama
**Versi:** 1.1

## 0. Keputusan inti

| Area | Keputusan |
|---|---|
| Produk | Arsip pengetahuan publik berbahasa Indonesia |
| Penulis | Satu orang, menulis lewat file Markdown di repo |
| Framework | Astro 7, output statis |
| Konten | Markdown + frontmatter, tautan ala Obsidian `[[slug]]` |
| Graph | React island + `d3-force` di canvas |
| Pencarian | Pagefind, dimuat saat dialog dibuka |
| Gaya | Editorial-tech tenang, satu aksen hijau, terang dan gelap |
| SEO | HTML statis, sitemap, RSS, JSON-LD, metadata per halaman |
| Deploy | Vercel atau static host lain, tanpa backend |
| Nama | "Arsip" sebagai nama kerja, bisa diganti di `src/config.ts` |

## 1. Ringkasan

Arsip adalah situs statis untuk menyimpan materi yang penulis pelajari sebagai catatan Markdown yang saling terhubung. Halaman utama menampilkan peta jaringan catatan. Setiap titik membuka satu catatan. Pembaca bisa masuk lewat peta, daftar topik, arsip, atau pencarian instan.

Situs ini publik dan bisa dibaca siapa saja. Penulis tetap satu-satunya yang menulis. Tidak ada akun, komentar, editor online, atau database.

Bukan produk: aplikasi catatan pribadi dengan login, media sosial, CMS, atau blog berlangganan.

## 2. Masalah dan tujuan

Masalah penulis:
- Materi pelajaran tersebar di banyak tempat dan sulit dihubungkan.
- Menulis catatan untuk dipublikasikan terasa berat karena harus mengurus desain dan teknis.
- Hubungan antar ide tidak terlihat setelah catatan selesai.

Masalah pembaca:
- Sulit menemukan materi yang relevan dan melihat konteks antar materi.
- Banyak catatan teknis sulit dibaca karena tipografi dan tata letaknya buruk.

Tujuan:
- Satu tempat untuk menulis cepat, menautkan, dan menerbitkan.
- Satu peta pengetahuan yang tumbuh dari tautan yang benar-benar ditulis, bukan hiasan.
- Halaman baca yang nyaman, cepat, aksesibel, dan ditemukan mesin pencari.

## 3. Pengguna

**Pemilik (penulis).** Menambah catatan dalam 2 menit, menautkan ke catatan lain, melihat pratinjau, lalu deploy. Nyaman dengan terminal dan Git. Windows sebagai lingkungan utama.

**Pembaca umum.** Datang dari Google, media sosial, atau tautan langsung. Ingin jawaban atau gambaran cepat, lalu menjelajah catatan terkait.

**Perekrut atau klien (sekunder).** Menilai kedalaman materi dan cara penulis menghubungkan ide. Tidak akan membaca semuanya.

## 4. Goals, non-goals, anti-goals

Goals v1:
- Graph interaktif yang dibangun dari tautan nyata antar catatan.
- Halaman catatan yang enak dibaca di ponsel dan desktop.
- Pencarian instan untuk judul, isi, dan topik.
- Alur menulis tanpa database: satu file Markdown per catatan.
- SEO teknis lengkap dan halaman yang cepat.
- Mode terang dan gelap, aksesibilitas WCAG 2.2 AA.
- Semua konten tetap bisa diakses tanpa JavaScript dan tanpa graph.

Non-goals v1:
- Akun, komentar, suka, notifikasi.
- Editor online, CMS, database.
- Newsletter, analytics dashboard, iklan.
- Multi-bahasa dan terjemahan.
- Fitur AI.
- Komponen interaktif di dalam catatan (MDX bisa ditambah nanti).

Anti-goals (dianggap gagal walau terlihat jalan):
- Graph yang ramai tapi tidak membantu menemukan catatan.
- Halaman catatan berat karena JavaScript yang tidak perlu.
- Desain yang mengorbankan keterbacaan demi efek visual.
- Konten yang hanya bisa ditemukan lewat graph.
- Data palsu, angka hiasan, atau label versi di halaman publik.

## 5. Definisi sukses

- Menambah catatan: salin template atau jalankan generator, isi, commit. Di bawah 2 menit.
- Build gagal dengan pesan jelas jika frontmatter tidak valid, tautan `[[slug]]` putus, atau tanggal salah.
- Halaman catatan mendapat skor Lighthouse mobile minimal 95 untuk Performance, SEO, dan Accessibility.
- Pencarian menampilkan hasil dalam 300 ms setelah pengguna mengetik, setelah indeks termuat.
- Halaman utama nyaman dipakai pada lebar 360 px, dan graph tetap 60 fps pada 300 catatan.
- Semua catatan bisa ditemukan lewat arsip, topik, pencarian, dan tautan biasa tanpa graph.
- LCP di bawah 2,0 detik dan CLS di bawah 0,1 pada koneksi 4G kelas menengah.

## 6. Pendekatan yang dipertimbangkan

### Framework

| Opsi | Hasil | Alasan |
|---|---|---|
| **A. Astro + React island** | Dipilih | HTML statis untuk semua halaman, JS hanya untuk graph dan pencarian. SEO dan kecepatan terbaik untuk situs berisi konten. |
| B. Next.js App Router (SSG) | Ditolak | Bisa, tetapi JS dan konfigurasi lebih berat untuk hasil konten yang sama. Dibutuhkan kalau nanti ada akun dan komentar. |
| C. Vite + React SPA | Ditolak | Halaman dirender di browser, buruk untuk SEO dan first paint. |

### Graph

| Opsi | Hasil | Alasan |
|---|---|---|
| **`d3-force` di canvas** | Dipilih | Kontrol penuh atas fisika, label, hover, dan performa. Tanpa wrapper berat. |
| Static SVG hasil precompute | Ditolak | Paling ringan, tetapi kehilangan kesan hidup yang diminta. Dipakai sebagai fallback `prefers-reduced-motion`. |
| `react-force-graph` | Ditolak | Cepat dibuat, tetapi menambah wrapper dan batasan styling yang tidak perlu. |

### Konten dan pencarian

- **Markdown di repo** dipilih. Cepat, versioned, tanpa backend. CMS ditolak karena menambah database dan login yang tidak dibutuhkan.
- **Pagefind** dipilih. Indeks dibuat saat build, tanpa server, hasil pencarian sudah memuat cuplikan teks. Mesin pencari client-side dengan indeks buatan sendiri ditolak karena hasil dan cuplikannya lebih lemah.

## 7. Ruang lingkup dan rute

| Rute | Isi | Render |
|---|---|---|
| `/` | Intro, graph, catatan terbaru, topik | Statis + island graph |
| `/catatan` | Semua catatan, dikelompokkan per tahun | Statis |
| `/catatan/[slug]` | Satu catatan, backlink, catatan terkait | Statis |
| `/topik` | Semua topik dan jumlah catatan | Statis |
| `/topik/[tag]` | Catatan dengan topik tertentu | Statis |
| `/tentang` | Penjelasan singkat situs dan penulis | Statis |
| `/404` | Halaman tidak ditemukan | Statis |
| `/rss.xml` | Umpan RSS catatan | Endpoint statis |
| `/sitemap-index.xml` | Sitemap | Dibuat `@astrojs/sitemap` |
| `/robots.txt` | Aturan crawler | Endpoint statis |

Pencarian berupa dialog di semua halaman. Tidak ada rute `/cari`.

## 8. Model konten

### Lokasi dan nama file

- Satu catatan = satu file di `src/content/catatan/`.
- Nama file menjadi slug URL. Contoh: `cara-kerja-http.md` menjadi `/catatan/cara-kerja-http`.
- Format: huruf kecil, angka, tanda hubung, ASCII. Tanpa spasi, huruf kapital, atau karakter khusus.
- Nama file tidak boleh diubah setelah dipublikasikan karena tautan dan URL akan putus.

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

| Field | Tipe | Wajib | Aturan |
|---|---|---|---|
| `title` | string | ya | 3 sampai 100 karakter, unik |
| `summary` | string | ya | 20 sampai 160 karakter, dipakai untuk meta description dan daftar |
| `date` | tanggal | ya | Format `YYYY-MM-DD`, tidak di masa depan |
| `updated` | tanggal | tidak | Opsional, tidak lebih awal dari `date` |
| `tags` | string[] | ya | 1 sampai 3 tag, huruf kecil, kebab-case |
| `draft` | boolean | tidak | Default `false`. `true` berarti tidak dibangun di produksi |

### Isi

- Markdown biasa. Tanpa H1 di dalam isi, karena H1 berasal dari judul.
- Heading memakai H2 dan H3. Heading harus deskriptif.
- Blok kode memakai bahasa: ` ```ts `, ` ```bash `.
- Gambar opsional, wajib punya alt yang menjelaskan isi.
- Sumber eksternal ditulis sebagai tautan Markdown biasa di bagian "Sumber".
- HTML mentah tidak dipakai.

### Tautan antar catatan

- `[[slug]]` menjadi tautan ke catatan tersebut, dengan judul catatan sebagai teks.
- `[[slug|teks tampil]]` memakai teks tampilan sendiri.
- Target wajib ada. Build produksi gagal jika target tidak ditemukan, menunjuk ke draft, atau menunjuk ke diri sendiri.
- Tautan di dalam blok kode dan inline code diabaikan.
- Tautan ganda dihitung satu.
- Semua tautan bersifat dua arah untuk keperluan graph, tetapi ditampilkan sebagai tautan biasa.

### Data turunan

- **Backlink:** catatan lain yang menautkan ke halaman ini, dihitung saat build.
- **Catatan terkait:** maksimal 4 catatan dengan tag yang sama, diurutkan dari jumlah tag yang sama, tanpa catatan yang sudah ditautkan langsung.
- **Node graph:** satu per catatan, dengan `degree` sebagai jumlah tautan.
- **Edge graph:** hanya dari tautan `[[...]]`, tanpa arah panah. Tag tidak membuat edge, tetapi dipakai untuk filter dan catatan terkait.
- **Halaman topik:** dibuat dari semua tag unik.

### Draft

- `draft: true` tidak dibangun di produksi: tidak ada halaman, tidak masuk graph, arsip, topik, RSS, sitemap, atau indeks pencarian.
- Di `npm run dev`, draft tampil dengan label "Draft".
- Peringatan: `draft: true` hanya menyembunyikan dari situs. Jika repo publik, isi draft tetap terbaca di GitHub. Jangan simpan materi sensitif di repo.

### Konten awal

- Semua catatan ditulis oleh pemilik. Implementasi tidak membuat catatan contoh di produksi.
- Test memakai fixture sementara. Konten palsu tidak boleh ikut ter-build.
- Situs harus tetap benar dengan nol catatan: empty state di graph, arsip, dan topik.
- Untuk rilis, disarankan minimal 6 catatan saling tertaut. Ini gerbang konten pemilik, bukan tugas implementasi.

### Template

Template penulisan ada di `templates/catatan.md`. Generator `npm run new -- "Judul"` menyalin template, mengisi tanggal, dan membuat slug otomatis.

## 9. UX per halaman

### Global

- Header setinggi 64 px di desktop, 56 px di ponsel. Sticky dengan latar semi-transparan dan garis bawah tipis.
- Isi header: wordmark "arsip.", tautan Catatan, Topik, Tentang, tombol pencarian, tombol tema. Di ponsel, tautan masuk ke menu ringkas.
- Skip link "Lewati ke konten".
- Footer: nama penulis, `© {tahun} {penulis}`, tautan RSS, Semua catatan, Tentang. Tanpa lisensi terbuka di v1; hak cipta penulis.
- Tema mengikuti sistem secara default. Pilihan pengguna disimpan dan diterapkan sebelum paint agar tidak berkedip.
- Bahasa halaman `id`. Tanggal memakai format Indonesia.

### Halaman utama

Urutan: header, intro, graph, catatan terbaru, topik, footer.

Intro:
- H1: "Catatan yang saling terhubung."
- Subteks: "Arsip materi yang saya pelajari, tumbuh jadi peta yang bisa dijelajahi. Cari langsung atau ikuti tautannya."
- Statistik nyata: jumlah catatan dan topik, kecil dan muted.
- Aksi: tombol utama "Cari catatan" membuka dialog pencarian. Tautan sekunder "Semua catatan" menuju arsip.
- Tanpa eyebrow, tanpa label versi, tanpa pita dekoratif.

Graph:
- Kanvas selebar kontainer, tinggi 60vh di desktop (minimal 420 px, maksimal 640 px) dan 380 px di ponsel.
- Titik adalah catatan. Ukuran titik naik perlahan mengikuti jumlah tautan. Garis adalah tautan.
- Filter chip: "Semua" dan maksimal 6 topik teratas. Topik lain lewat tautan "Semua topik".
- Desktop: hover menyalakan titik dan tetangganya, meredupkan sisanya, dan menampilkan judul. Klik membuka catatan. Drag memindahkan titik tanpa membuka catatan.
- Ponsel: ketuk titik memilih dan menampilkan panel di bawah graph berisi judul, ringkasan, tag, dan tombol "Baca catatan". Ketuk area kosong membatalkan pilihan.
- Tanpa pan atau zoom di v1 agar scroll halaman tidak direbut.
- `prefers-reduced-motion`: simulasi dijalankan sampai selesai sebelum digambar, lalu statis. Hover tetap bekerja.
- Tanpa JavaScript: area graph menampilkan pesan singkat dan tautan ke arsip. Graph bersifat pelengkap, bukan satu-satunya navigasi.
- Graph kosong: teks "Belum ada catatan yang dipublikasikan." dengan tautan ke arsip.
- Label permanen hanya untuk titik dengan derajat tinggi, maksimal 10 label. Judul dipotong dengan elipsis.

Catatan terbaru:
- Enam catatan terbaru, urut tanggal.
- Baris berisi tanggal, judul, ringkasan satu baris, dan tag.
- Satu garis di atas grup, tanpa garis per baris dan tanpa kartu.
- Tautan "Semua catatan".

Topik:
- Daftar chip dengan jumlah catatan. Maksimal 8 topik teratas, lalu tautan ke halaman arsip topik.
- Bukan kartu, bukan grid tiga kolom.

### Arsip `/catatan`

- H1 "Semua catatan", jumlah catatan, tombol pencarian.
- Dikelompokkan per tahun, terbaru dulu.
- Baris sama dengan catatan terbaru.
- Empty state: "Belum ada catatan." dan tautan ke Tentang.

### Halaman catatan

- Lebar baca maksimal 68 karakter. Desktop memakai grid artikel + daftar isi lengket 200 px bila heading minimal 3. Ponsel tanpa daftar isi.
- Tautan kembali "Semua catatan" di atas judul.
- H1 judul, lalu meta: tanggal, "diperbarui" bila ada, waktu baca, tag.
- Ringkasan tampil sebagai paragraf pembuka yang lebih besar.
- Isi Markdown dengan tipografi baca.
- Blok kode dengan latar berbeda, scroll horizontal, dan label bahasa.
- Di akhir: "Ditautkan dari" berisi backlink, lalu "Catatan terkait" maksimal 4. Keduanya disembunyikan bila kosong.
- Tanpa komentar, tanpa tombol share, tanpa progress bar.
- Meta halaman lengkap untuk SEO.

### Arsip topik `/topik`

- H1 "Topik" dan satu kalimat singkat.
- Semua topik, diurutkan dari jumlah catatan terbanyak lalu alfabetis.
- Baris berisi nama topik dan jumlah catatan. Tanpa kartu.
- Empty state: "Belum ada topik."
- Metadata unik.

### Halaman topik `/topik/[tag]`

- H1 nama topik, jumlah catatan, daftar catatan.
- Chip topik lain di bawah.
- Metadata unik per topik.

### Tentang

- Satu halaman singkat: apa situs ini, siapa penulis, topik yang dibahas, cara situs dibangun, dan satu kontak.
- Tanpa foto stok. Boleh tanpa foto.
- Tautan ke peta dan arsip.

### Pencarian

- Dialog di semua halaman. Tombol di header dan pintasan `Ctrl/Cmd + K` atau `/` saat fokus bukan di input.
- Pagefind dimuat saat dialog pertama kali dibuka, bukan saat halaman dimuat.
- Input autofocus, hasil muncul setelah jeda 80 ms.
- Hasil: judul, cuplikan teks dengan penanda, tag. Navigasi dengan panah atas/bawah dan Enter.
- Escape menutup dan mengembalikan fokus ke pemicu. Latar halaman tidak ikut scroll.
- Ponsel: dialog memenuhi layar.
- Kueri kosong: petunjuk singkat dan chip topik.
- Tidak ada hasil: "Tidak ada hasil untuk ..." dengan tautan ke arsip.
- Gagal memuat indeks: pesan "Pencarian gagal dimuat. Coba muat ulang halaman." tanpa membuat halaman rusak.

### 404

- Pesan tenang, tombol pencarian, tautan ke beranda dan arsip.
- Status HTTP 404.

## 10. Arah visual

Reading this as: public knowledge garden untuk pembaca umum dan pemiliknya, dengan bahasa editorial-tech yang tenang, memakai Astro, Tailwind, dan `d3-force`.

Dials: `DESIGN_VARIANCE 6`, `MOTION_INTENSITY 4`, `VISUAL_DENSITY 4`.

### Prinsip

- Graph adalah aset visual utama dan berasal dari data nyata. Tidak ada stok foto, ilustrasi dekoratif, atau tangkapan layar palsu.
- Ketenangan datang dari tipografi, ruang kosong, dan satu aksen. Bukan dari gradien, glow, atau animasi di mana-mana.
- Satu tema per halaman. Mode terang dan gelap sama-sama dirancang, bukan dibalik otomatis.
- Satu aksen dipakai konsisten untuk tautan, fokus, chip aktif, dan titik graph yang aktif.
- Tanpa kartu untuk konten yang bisa dipisahkan garis dan ruang.
- Tanpa em dash di seluruh teks yang tampil. Hanya tanda hubung biasa.

### Palet

| Token | Terang | Gelap |
|---|---|---|
| Latar | `#f4f5f2` | `#0c1210` |
| Permukaan | `#fbfcfa` | `#121a16` |
| Teks | `#15191b` | `#e7ece8` |
| Teks muted | `#59635e` | `#9aa8a0` |
| Garis | `#d8ddd8` | `#24302a` |
| Aksen | `#0e6b4f` | `#5bd6a8` |
| Aksen lembut | `#e3efe9` | `#17352b` |

Kontras teks minimal 4,5:1. Kontras aksen di latar minimal 4,5:1 untuk teks. Semua pasangan diuji di kedua mode.

### Tipografi

- **Newsreader** untuk judul dan isi catatan. Dipilih karena situs ini memang arsip bacaan, bukan dashboard. Bukan Fraunces atau Instrument Serif.
- **Geist** untuk navigasi, label, tombol, meta, dan chip.
- Font di-self-host lewat Fontsource, subset Latin, `font-display: swap`.
- Judul halaman: `clamp(2rem, 5vw, 3.5rem)`, line-height 1,05, letter-spacing -0,02em.
- Isi catatan: 19 px, line-height 1,7, maksimal 68ch.
- Teks UI: 14 sampai 16 px.

### Bentuk dan gerak

- Radius: tombol dan chip pill, panel dan dialog 14 px, blok kode 8 px. Aturan ini konsisten di seluruh situs.
- Garis 1 px. Tanpa bayangan tajam. Dialog boleh memakai bayangan tipis yang diberi tint latar.
- Gerak hanya untuk graph dan umpan balik hover/fokus, 150 sampai 200 ms. Tanpa scroll reveal, parallax, marquee, atau animasi berulang.
- `prefers-reduced-motion` mematikan animasi graph, transisi dialog, dan gerak lain. Hover berubah langsung.

### Larangan

- Tanpa em dash.
- Tanpa eyebrow di setiap section. Situs ini memakai nol eyebrow.
- Tanpa penomoran section, label versi, penanda "scroll", strip lokasi atau waktu, dan titik status dekoratif.
- Tanpa tiga kartu fitur sejajar, tanpa grid kartu untuk catatan, tanpa progress bar hiasan.
- Tanpa gradien ungu atau glow. Tanpa kursor kustom.
- Tanpa gambar palsu dari div. Graph adalah kanvas data nyata.
- Tombol wajib lolos kontras dan label tidak boleh terbungkus dua baris di desktop.

## 11. Arsitektur teknis

### Stack

- Astro 7, TypeScript strict, output statis.
- React 19 island hanya untuk graph.
- Tailwind CSS v4 lewat `@tailwindcss/vite`, plus plugin typography dengan override token.
- `d3-force` untuk simulasi. Canvas 2D untuk render.
- Pagefind sebagai langkah postbuild.
- `@astrojs/sitemap`, `@astrojs/rss`.
- Fontsource untuk Geist dan Newsreader.
- `astro-icon` + ikon Phosphor untuk ikon statis. Satu keluarga ikon, stroke konsisten.
- Vitest untuk unit test logika graph dan tautan.

### Alur data

1. Astro membaca semua file di `src/content/catatan/` lewat Content Collection dan skema Zod.
2. Parser tautan mengambil `[[slug]]` dari body, mengabaikan blok kode dan inline code.
3. Validator memastikan setiap target ada dan bukan draft di build produksi.
4. Halaman utama membangun `nodes`, `edges`, dan `tags` saat build, lalu mengirimkannya sebagai props ke island graph.
5. Halaman catatan menghitung backlink dan catatan terkait saat build.
6. Pagefind mengindeks HTML hasil build, hanya area artikel.

### Struktur file

```
.
├── docs/PRD.md
├── public/
│   ├── favicon.svg
│   └── og.png
├── scripts/new-note.mjs
├── src/
│   ├── components/
│   │   ├── GraphExplorer.tsx
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Search.astro
│   │   ├── NoteList.astro
│   │   ├── TopicChips.astro
│   │   ├── Seo.astro
│   │   └── ThemeToggle.astro
│   ├── content/catatan/
│   ├── layouts/BaseLayout.astro
│   ├── lib/
│   │   ├── notes.ts
│   │   ├── graph.ts
│   │   ├── wiki-links.ts
│   │   └── format.ts
│   ├── pages/
│   │   ├── index.astro
│   │   ├── catatan/index.astro
│   │   ├── catatan/[slug].astro
│   │   ├── topik/index.astro
│   │   ├── topik/[tag].astro
│   │   ├── tentang.astro
│   │   ├── 404.astro
│   │   ├── rss.xml.ts
│   │   └── robots.txt.ts
│   ├── styles/global.css
│   ├── config.ts
│   └── content.config.ts
├── templates/catatan.md
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

### Graph

- Data: `{ id, title, summary, tags, degree }` dan `{ source, target }`.
- Parameter fisika awal: link distance 70, charge -140, collision radius mengikuti ukuran titik. Nilai final ditentukan saat implementasi dan diuji di 360 px serta desktop.
- Simulasi berhenti setelah dingin. Tidak ada loop render terus-menerus.
- Canvas memakai device pixel ratio maksimal 2. Ukuran dihitung ulang lewat `ResizeObserver`.
- Warna diambil dari CSS variable agar mode terang dan gelap konsisten.
- Label digambar di canvas dengan halo tipis agar terbaca di atas garis.
- Hit test memakai posisi node, cukup linear untuk 300 catatan.
- Drag memakai pointer events. Perpindahan di bawah 4 px dianggap klik.
- `prefers-reduced-motion`: jalankan tick secara sinkron, gambar sekali, tanpa animasi.
- Batas v1: 300 catatan nyaman. Di atas 500, layout perlu di-precompute saat build. Catat batas ini di kode.

### Pencarian

- Pagefind dijalankan setelah `astro build` dengan `--site dist`.
- Hanya `<article>` halaman catatan yang diindeks. Header, footer, dan graph diabaikan.
- UI pencarian ditulis vanilla TypeScript, bukan React, agar halaman catatan tetap ringan.
- Modul Pagefind diimpor dinamis saat dialog pertama dibuka.
- Di `npm run dev`, pencarian menampilkan pesan bahwa indeks tersedia lewat `npm run build && npm run preview`.

### Konfigurasi

`src/config.ts` berisi:
- `title`, `tagline`, `description`
- `url` kanonik
- `author` dan kontak
- tautan sosial opsional
- jumlah catatan terbaru

### Tes dan validasi

- `astro check` untuk tipe.
- Vitest: parsing `[[...]]`, pengabaian kode, deteksi tautan putus, perhitungan degree, backlink, dan related.
- `npm run build` sebagai pemeriksaan integrasi: skema, tautan, rute, RSS, sitemap.
- Uji manual: keyboard pencarian, mode gelap, 360 px, reduced motion, Lighthouse.

## 12. SEO

- HTML statis, satu H1 per halaman, hierarki heading benar.
- Title unik: `{judul} · Arsip` untuk catatan, `{topik} · Arsip` untuk topik.
- Meta description dari `summary`.
- Canonical absolut dari `config.url`.
- Open Graph dan Twitter Card dengan gambar default 1200x630. Gambar OG per catatan tidak termasuk v1.
- JSON-LD `BlogPosting` di catatan: headline, description, datePublished, dateModified, author, inLanguage `id`, keywords, url, mainEntityOfPage. JSON-LD `WebSite` di beranda.
- Sitemap otomatis, RSS berisi catatan non-draft, robots mengarah ke sitemap.
- Internal link dari tautan `[[...]]`, backlink, catatan terkait, topik, dan arsip.
- URL bersih tanpa tanggal, stabil, huruf kecil.
- Draft tidak masuk sitemap, RSS, atau indeks pencarian.
- Tidak ada halaman tipis: setiap catatan punya ringkasan dan minimal satu tautan keluar setelah konten cukup.
- Sebelum deploy, `url` harus diisi. Canonical yang salah lebih merusak daripada tidak ada canonical.

## 13. Aksesibilitas

- Target WCAG 2.2 AA.
- Kontras teks minimal 4,5:1 di kedua mode.
- Fokus terlihat jelas: outline 2 px aksen dengan offset 2 px.
- Skip link, landmark, dan urutan heading benar.
- Dialog pencarian: `dialog` native, fokus masuk ke input, Escape menutup, fokus kembali ke pemicu.
- Tombol dan tautan punya label yang jelas. Ikon saja wajib punya `aria-label`.
- Target sentuh minimal 44 px.
- Tidak ada horizontal scroll pada 320 px.
- Teks bisa diperbesar 200% tanpa kehilangan konten.
- Graph bersifat pelengkap. Semua tujuan tersedia lewat arsip, topik, catatan terbaru, dan pencarian. Kanvas diberi label deskriptif, tetapi tidak bisa dinavigasi keyboard di v1. Ini batasan sadar dan didokumentasikan.
- `prefers-reduced-motion` dihormati di graph dan dialog.
- Mode gelap diuji, bukan hanya dibalik.
- Empty state dan error state punya teks yang bisa dibaca pembaca layar.

## 14. Performa

- Halaman catatan: JS awal di bawah 10 KB gzip sebelum pencarian dibuka. Tanpa React.
- Beranda: total JS di bawah 100 KB gzip, termasuk React dan `d3-force`.
- Font: dua keluarga, subset Latin, `swap`, preload untuk font utama.
- Tanpa gambar di beranda. Gambar catatan memakai lazy loading.
- LCP di bawah 2,0 detik, INP di bawah 200 ms, CLS di bawah 0,1.
- Lighthouse mobile: catatan minimal 95 untuk Performance, SEO, Accessibility. Beranda minimal 90 untuk Performance.
- Simulasi graph berhenti saat dingin, tidak membakar CPU.
- Canvas DPR dibatasi 2.

## 15. Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Graph terlalu sepi saat baru 3 catatan | Peta terlihat rusak | Terbitkan minimal 6 catatan yang saling tertaut sebelum rilis. |
| Graph tidak bisa diakses keyboard | Sebagian pengguna tidak bisa memakai peta | Arsip, topik, pencarian, dan catatan terbaru selalu tersedia. |
| Pagefind kurang baik untuk stemming bahasa Indonesia | Hasil pencarian kurang pintar | Uji kueri umum. Judul dan ringkasan memuat kata kunci. Jika perlu, ganti ke MiniSearch tanpa mengubah UI. |
| Pencarian tidak ada di dev | Penulis tidak bisa menguji saat menulis | Dokumentasikan `npm run build && npm run preview`. |
| Canvas berat di perangkat rendah | Ponsel tersendat | Simulasi berhenti, DPR dibatasi, target 300 catatan. Di atas 500 precompute. |
| Tautan putus setelah rename file | Navigasi dan graph rusak | Build gagal. Nama file dianggap permanen. |
| Repo publik membocorkan draft | Materi pribadi terlihat | Peringatan jelas. Draft bukan fitur privasi. Repo privat bila perlu. |
| OG per catatan belum ada | Share sosial generik | Diterima di v1, ditingkatkan nanti. |
| Nama, domain, dan identitas belum final | Branding sementara | Semua di `src/config.ts`, mudah diganti. |

## 16. Milestone

1. **Fondasi.** Scaffold Astro, Tailwind, TypeScript, config, layout, header, footer, token desain, mode gelap, SEO dasar.
2. **Konten.** Content collection, skema, parser tautan, validasi, template, generator, halaman catatan, arsip, topik, arsip topik, tentang, 404.
3. **Graph.** Perhitungan data, island React, fisika, hover, filter, panel ponsel, reduced motion, fallback tanpa JS.
4. **Pencarian.** Pagefind, dialog vanilla, keyboard, empty dan error state.
5. **SEO dan rilis.** RSS, sitemap, robots, JSON-LD, OG default, audit aksesibilitas dan performa, catatan pemilik (disarankan 6 yang saling tertaut), deploy.

Setiap milestone selesai hanya jika `astro check` dan `npm run build` lulus, dan halaman terkait diuji di 360 px serta desktop.

## 17. Kriteria selesai

- Situs benar dengan nol catatan dan dengan catatan nyata. Untuk rilis, minimal 6 catatan saling tertaut yang ditulis pemilik tampil di graph dan arsip.
- Menambah catatan baru tidak memerlukan perubahan kode.
- Tautan `[[slug]]` putus menggagalkan build dengan pesan yang menyebut file dan target.
- Pencarian menemukan kata dari judul dan isi catatan.
- Semua rute merespons 200, kecuali 404. Termasuk `/topik`.
- Mode terang dan gelap lolos kontras.
- Keyboard bisa menyelesaikan alur cari lalu buka catatan tanpa mouse.
- Reduced motion menghentikan animasi graph.
- Lighthouse memenuhi target di bagian Performa.
- RSS, sitemap, robots, canonical, dan JSON-LD tervalidasi.
- README cocok dengan perilaku nyata.
- Tidak ada em dash, label versi, penomoran section, atau teks hiasan di halaman publik.

## 18. Yang diserahkan ke builder

- Nilai akhir parameter fisika graph dan ambang label.
- Detail spacing dan skala tipografi selama token dan aturan di atas diikuti.
- Cara tepat mengambil warna CSS variable untuk canvas.
- Struktur internal parser tautan, asal konsisten dengan remark plugin.
- Jumlah tick simulasi dan strategi resize.
- Pemilihan library test tambahan bila diperlukan.
- Desain gambar OG default.

## 19. Pertanyaan terbuka

- Nama situs final, domain, dan kontak. Sementara memakai "Arsip", `https://example.com`, dan data di `src/config.ts`. Penulis sudah final: Rian Indra Pratama. Tidak menghambat pembangunan.
- Topik awal. Mengikuti isi catatan pertama, tidak perlu ditentukan sekarang.
- Lisensi konten. Default v1: hak cipta penulis, tanpa lisensi terbuka. Bisa diganti menjadi CC BY atau CC BY-SA nanti lewat satu baris di footer.
