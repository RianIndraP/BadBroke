# Design: Tema Gelap Synthwave Tenang

**Status:** disetujui 20 November 2026
**Tanggal:** 20 November 2026
**Pemilik:** Rian Indra Pratama
**Terkait:** [PRD](../../PRD.md) bagian 10

## Tujuan

- Mode gelap terasa synthwave: latar violet hampir hitam, teks lavender, satu aksen magenta neon.
- Mode terang tetap sama persis: editorial tenang dengan aksen hijau.
- Situs tetap nyaman untuk bacaan panjang. Tidak ada grid, gradien latar, atau animasi glow.
- Semua teks dan aksen lolos WCAG 2.2 AA di mode gelap.

## Non-goals

- Tidak mengubah tata letak, tipografi, komponen, atau graph.
- Tidak menambah tema ketiga.
- Tidak memakai dua aksen neon, gradien ungu, grid horizon, atau glow di mana-mana.
- Tidak mengubah mode terang.

## Pendekatan

1. **Synthwave tenang (dipilih).** Palet violet dan magenta, plus glow tipis hanya di titik wordmark dan state fokus.
2. **Synthwave penuh.** Gradien latar, grid horizon, magenta dan cyan, glow di tautan dan tombol. Ditolak karena melanggar prinsip tenang dan satu aksen.
3. **Warna saja.** Tanpa glow sama sekali. Ditolak karena kurang terasa synthwave.

## Palet mode gelap

| Token | Nilai | Catatan |
|---|---|---|
| Latar | `#0b0614` | Violet hampir hitam |
| Permukaan | `#140b24` | Untuk dialog, panel, blok kode |
| Teks | `#f0e9ff` | Kontras 16,9:1 terhadap latar |
| Teks muted | `#a99bc4` | Kontras 7,8:1 terhadap latar, 7,4:1 terhadap permukaan |
| Garis | `#2e2147` | Dekoratif, bukan teks |
| Aksen | `#ff4fd8` | Kontras 7,0:1 terhadap latar, 6,7:1 terhadap permukaan |
| Aksen lembut | `#2a0f2e` | Latar chip aktif dan penanda halus |

Mode terang tidak berubah:

```css
:root {
  --bg: #f4f5f2;
  --surface: #fbfcfa;
  --ink: #15191b;
  --muted: #59635e;
  --line: #d8ddd8;
  --accent: #0e6b4f;
  --accent-soft: #e3efe9;
}
```

## Perilaku visual

- Titik pada wordmark `arsip.` memakai `text-shadow` magenta lembut, hanya di mode gelap.
- Focus ring tetap outline 2 px aksen. Di mode gelap ditambah halo tipis memakai `color-mix`.
- Teks isi tidak memakai glow. Tidak ada gradien latar.
- Logika tema sistem, `localStorage`, dan penerapan sebelum paint tidak berubah.
- Graph di Fase 5 membaca CSS variable, jadi otomatis mengikuti palet. Warna hover memakai aksen dengan opacity, bukan aksen kedua.
- Tema syntax highlighting untuk blok kode ditentukan nanti di Fase 4. Di luar lingkup perubahan ini.

## Dampak file

- `src/styles/global.css`: ganti nilai variable mode gelap, tambah `.wordmark-dot`, tambah halo fokus mode gelap.
- `src/components/Header.astro`: tambah class `wordmark-dot` pada titik wordmark.
- `docs/PRD.md`: perbarui bagian 10 (prinsip, palet, larangan) dan ringkasan stack.
- `README.md`: perbarui aturan satu aksen per mode.
- `docs/superpowers/plans/2026-11-20-arsip-implementation.md`: perbarui blok CSS di Fase 2.6.

## Verifikasi

- Toggle terang dan gelap, refresh, pilihan tema tetap.
- Mode terang tidak berubah dari tampilan sekarang.
- 360 px tanpa scroll horizontal.
- Kontras teks dan aksen di mode gelap sesuai tabel.
- `npm run check` dan `npm run build` lulus.
- PRD tidak lagi melarang semua glow; larangan dipersempit ke glow dekoratif di luar wordmark dan fokus.
