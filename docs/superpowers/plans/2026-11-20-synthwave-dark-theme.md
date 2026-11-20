# Synthwave Dark Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengubah mode gelap menjadi synthwave tenang tanpa menyentuh mode terang, tata letak, atau tipografi.

**Architecture:** Hanya nilai CSS custom property mode gelap dan dua aturan dekoratif yang berubah. Semua komponen sudah membaca variable, jadi tidak ada perubahan struktur.

**Tech Stack:** Astro 7, Tailwind CSS 4, CSS custom properties, `color-mix`.

**Spec:** [docs/superpowers/specs/2026-11-20-synthwave-dark-theme-design.md](../specs/2026-11-20-synthwave-dark-theme-design.md)

## Global Constraints

- Mode terang tetap persis: `#f4f5f2`, `#fbfcfa`, `#15191b`, `#59635e`, `#d8ddd8`, `#0e6b4f`, `#e3efe9`.
- Palet gelap: `#0b0614`, `#140b24`, `#f0e9ff`, `#a99bc4`, `#2e2147`, `#ff4fd8`, `#2a0f2e`.
- Satu aksen per mode. Tidak ada aksen kedua, gradien latar, grid horizon, atau glow di teks isi.
- Glow hanya di titik wordmark dan halo fokus, hanya mode gelap.
- Kontras teks minimal 4,5:1. Aksen terhadap latar minimal 4,5:1.
- Tanpa em dash di teks yang tampil.
- Jangan commit. Pemilik sedang menyelesaikan Fase 2 dan akan commit sendiri.

## Review Focus

- Mode terang tidak berubah satu nilai pun.
- Focus ring tetap terlihat di mode gelap, dan halo tidak muncul di `<main>` saat skip link dipakai.
- Teks muted dan aksen tetap lolos kontras di latar dan permukaan.
- Pilihan tema tetap diterapkan sebelum paint dan bertahan setelah refresh.
- Tidak ada gradien, grid, atau aksen kedua yang menyelinap masuk.

---

## Task 1: Palet gelap dan glow

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/components/Header.astro`

**Interfaces:**
- Consumes: token `--bg`, `--surface`, `--ink`, `--muted`, `--line`, `--accent`, `--accent-soft`.
- Produces: class `wordmark-dot`; halo fokus mode gelap.

- [ ] **Step 1: Ganti nilai variable mode gelap**

Di `src/styles/global.css`, ganti blok `[data-theme="dark"]` menjadi:

```css
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
```

- [ ] **Step 2: Tambah glow wordmark dan halo fokus**

Tambahkan setelah blok mode gelap:

```css
[data-theme="dark"] .wordmark-dot {
  text-shadow: 0 0 14px color-mix(in srgb, var(--accent) 65%, transparent);
}

[data-theme="dark"] :focus-visible:not(main) {
  box-shadow: 0 0 14px color-mix(in srgb, var(--accent) 45%, transparent);
}
```

- [ ] **Step 3: Tambah class pada titik wordmark**

Di `src/components/Header.astro`, ubah:

```astro
arsip<span class="text-accent">.</span>
```

menjadi:

```astro
arsip<span class="wordmark-dot text-accent">.</span>
```

- [ ] **Step 4: Cek tipe dan build**

Run:

```bash
npm run check
npm run build
```

Expected: keduanya lulus tanpa error.

- [ ] **Step 5: Verifikasi kontras**

Run skrip satu kali di Node:

```bash
node -e "const L=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};const r=(a,b)=>(Math.max(L(a),L(b))+.05)/(Math.min(L(a),L(b))+.05);for(const [n,a,b] of [['ink/bg','#f0e9ff','#0b0614'],['muted/bg','#a99bc4','#0b0614'],['muted/surface','#a99bc4','#140b24'],['accent/bg','#ff4fd8','#0b0614'],['accent/surface','#ff4fd8','#140b24']])console.log(n,r(a,b).toFixed(2))"
```

Expected: `ink/bg` sekitar 16,9; `muted/bg` sekitar 7,8; `muted/surface` sekitar 7,4; `accent/bg` sekitar 7,0; `accent/surface` sekitar 6,7. Semua di atas 4,5.

- [ ] **Step 6: Cek manual**

Jalankan `npm run dev`, buka `http://localhost:4321`, lalu:

1. Mode terang: bandingkan dengan tampilan sebelumnya, harus identik.
2. Mode gelap: latar violet, tautan magenta, titik wordmark ber-glow tipis.
3. Tab ke tautan dan tombol: outline magenta terlihat, halo halus muncul.
4. Refresh: pilihan tema bertahan.
5. 360 px: tidak ada scroll horizontal.

---

## Task 2: Sinkronkan dokumen

**Files:**
- Modify: `docs/PRD.md:19`
- Modify: `docs/PRD.md:312-333`
- Modify: `docs/PRD.md:351-358`
- Modify: `README.md:191`
- Modify: `docs/superpowers/plans/2026-11-20-arsip-implementation.md:280-300`
- Modify: `docs/superpowers/specs/2026-11-20-synthwave-dark-theme-design.md:3`

- [ ] **Step 1: Perbarui ringkasan gaya di PRD**

Ganti baris 19 menjadi:

```markdown
| Gaya | Editorial-tech tenang; mode terang hijau, mode gelap synthwave magenta |
```

- [ ] **Step 2: Perbarui prinsip dan palet PRD bagian 10**

Ganti tiga butir prinsip menjadi:

```markdown
- Ketenangan datang dari tipografi, ruang kosong, dan satu aksen per mode. Glow hanya dipakai tipis di titik wordmark dan fokus mode gelap, bukan di latar atau teks isi.
- Satu tema per halaman. Mode terang hijau dan mode gelap synthwave sama-sama dirancang, bukan dibalik otomatis.
- Satu aksen per mode: hijau di terang, magenta di gelap. Dipakai konsisten untuk tautan, fokus, chip aktif, dan titik graph yang aktif.
```

Ganti kolom gelap pada tabel palet:

```markdown
| Latar | `#f4f5f2` | `#0b0614` |
| Permukaan | `#fbfcfa` | `#140b24` |
| Teks | `#15191b` | `#f0e9ff` |
| Teks muted | `#59635e` | `#a99bc4` |
| Garis | `#d8ddd8` | `#2e2147` |
| Aksen | `#0e6b4f` | `#ff4fd8` |
| Aksen lembut | `#e3efe9` | `#2a0f2e` |
```

Tambahkan setelah kalimat kontras:

```markdown
Kontras mode gelap: teks 16,9:1, muted 7,8:1, aksen 7,0:1 terhadap latar. Semua di atas 4,5:1.
```

- [ ] **Step 3: Persempit larangan glow**

Ganti butir larangan menjadi:

```markdown
- Tanpa gradien latar, grid horizon, aksen kedua, atau glow dekoratif di luar titik wordmark dan fokus mode gelap. Tanpa kursor kustom.
```

- [ ] **Step 4: Perbarui README**

Ganti baris 191 menjadi:

```markdown
- Satu aksen per mode: hijau di mode terang, magenta di mode gelap. Jangan menambah aksen kedua.
```

- [ ] **Step 5: Perbarui tutorial Fase 2.6**

Di `docs/superpowers/plans/2026-11-20-arsip-implementation.md`, ganti blok `[data-theme="dark"]` pada contoh `global.css` dengan nilai baru dari Task 1, lalu tambahkan dua aturan glow setelah blok tersebut. Di daftar perilaku Header, tambahkan satu baris: "Titik wordmark memakai class `wordmark-dot`."

- [ ] **Step 6: Tandai design disetujui**

Ubah status di design doc menjadi:

```markdown
**Status:** disetujui 20 November 2026
```

- [ ] **Step 7: Pastikan nilai lama hilang**

Run:

```bash
rg "#0c1210|#121a16|#e7ece8|#9aa8a0|#24302a|#5bd6a8|#17352b" src docs/PRD.md README.md docs/superpowers/plans/2026-11-20-arsip-implementation.md
```

Expected: tidak ada hasil.

---

## Task 3: Verifikasi akhir

**Files:**
- No new files.

- [ ] **Step 1: Jalankan pemeriksaan penuh**

```bash
npm run check
npm run build
```

Expected: lulus.

- [ ] **Step 2: Tinjau diff**

```bash
git diff -- src/styles/global.css src/components/Header.astro
git status --short
```

Expected: hanya perubahan mode gelap, class wordmark, dan dokumen. Mode terang tidak tersentuh.

- [ ] **Step 3: Serahkan commit ke pemilik**

Jangan commit. Laporkan file yang berubah dan minta pemilik memasukkannya ke commit Fase 2.
