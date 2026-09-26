# Prompt Vibe Coding — SereneDiary Revamp

> Cara pakai: taruh 3 file (`01-PRD.md`, `02-USER-REQUIREMENTS.md`, `03-TECH-STACK.md`) di root repo `serene-diary` (atau folder `docs/`), lalu tempel prompt di bawah ini ke tool AI coding kamu (Claude Code, Cursor, dsb) di dalam repo tersebut.

---

Kamu adalah AI pair-programmer yang bekerja di repo Next.js **"SereneDiary"** ini. Sebelum melakukan perubahan apa pun, lakukan langkah berikut:

1. Baca `AGENTS.md` di root repo dan ikuti instruksinya. Versi Next.js di sini (16.2.6) punya breaking changes dibanding versi yang umum kamu kenal — cek isi `node_modules/next/dist/docs/` untuk hal-hal terkait routing, middleware, dan konfigurasi sebelum menulis kode apa pun yang menyentuh area itu.
2. Baca tiga dokumen berikut secara berurutan sebagai konteks wajib sebelum coding:
   - `01-PRD.md` — tujuan, ruang lingkup, dan asumsi desain revamp ini.
   - `02-USER-REQUIREMENTS.md` — requirement fungsional detail + acceptance criteria per fitur.
   - `03-TECH-STACK.md` — keputusan teknis, skema database, struktur routing, dan token warna yang **wajib** diikuti.
3. Pelajari struktur project yang sudah ada — `src/app`, `src/components`, `src/lib`, `src/lib/db/schema.ts`, `src/proxy.ts`, `src/auth.ts` — pahami pola yang dipakai (contoh: setiap route API memanggil `getAuthorizedUserId()` sendiri untuk cek sesi). **Ikuti pola yang sama**, jangan membuat pola baru yang berbeda gaya dari kode yang sudah ada.

Kerjakan secara bertahap per fase di bawah ini. **Jangan kerjakan semua fase sekaligus dalam satu commit besar** — selesaikan satu fase, tunjukkan ringkasan file yang diubah/ditambah, baru lanjut ke fase berikutnya setelah saya review.

## Fase 1 — Foundation & Warna
- Update `src/app/globals.css`: ganti seluruh token warna sesuai `03-TECH-STACK.md` §7.
- Refactor komponen visual global (`app-shell`, `sidebar-nav`, `mobile-bottom-nav`, kartu/surface di berbagai halaman) ke gaya minimalist: kurangi copy/teks panjang, rapikan spacing, pastikan kontras tetap aman terutama di atas warna gelap.
- Update `sidebar-nav.tsx` & `mobile-bottom-nav.tsx`: ganti label "Daily" → **"Check-in"**, tambahkan entri baru **"Notes"**.

## Fase 2 — Daily Check-in
- Tambahkan tabel `checkin_items` di `src/lib/db/schema.ts` sesuai `03-TECH-STACK.md` §3, lalu jalankan `npm run db:generate && npm run db:push`.
- Buat `src/lib/checkin-items.ts` (ikuti pola serupa `daily-checklist.ts` / `scheduled-tasks.ts`) untuk query CRUD.
- Buat API routes `src/app/api/checkin/route.ts` dan `src/app/api/checkin/[id]/route.ts` sesuai `03-TECH-STACK.md` §4.
- Rename/refactor `/dashboard` menjadi `/checkin` (dengan redirect dari path lama): tampilkan checklist rutin (sistem template existing, **tidak dihapus**) + section baru daftar task berdeadline dengan badge urgensi. Ikuti FR-1 dan FR-2 di `02-USER-REQUIREMENTS.md`.
- Sebelum implementasi badge urgensi, konfirmasi ke saya: pakai Opsi A atau Opsi B dari `03-TECH-STACK.md` §7 (strict 4 warna vs tambah 2 warna aksen terbatas).

## Fase 3 — Notes (Markdown, Publik)
- Tambahkan tabel `notes` di `src/lib/db/schema.ts` sesuai `03-TECH-STACK.md` §3.
- Install `react-markdown`, `remark-gfm`, `rehype-sanitize`.
- Buat `src/lib/notes.ts` untuk query CRUD + fungsi ambil-by-slug (dengan filter `visibility`).
- Buat API routes `src/app/api/notes/route.ts` dan `src/app/api/notes/[slug]/route.ts` sesuai `03-TECH-STACK.md` §4 — perhatikan GET publik vs mutasi yang wajib terproteksi.
- Buat halaman manajemen Notes (privat, terproteksi, di grup `(app)`) untuk create/edit/toggle publish, sesuai FR-3.
- Buat halaman publik `/notes` (index, hanya note Public) dan `/notes/[slug]` (detail), render Markdown dengan sanitasi, **tanpa autentikasi**, sesuai FR-4.
- Update `src/proxy.ts`: tambahkan route publik Notes ke `publicRoutes` dengan hati-hati agar halaman manajemen tidak ikut ter-expose (lihat `03-TECH-STACK.md` §5).

## Fase 4 — Poles Akhir
- Restyle halaman yang tersisa (`templates`, `reports/weekly`, `reports/monthly`, `calendar`, `settings`, `sign-in`) mengikuti palet & prinsip minimalist yang sama seperti Fase 1.
- Jalankan `npm run lint` dan `npm run build`, perbaiki semua error/warning sebelum menganggap fase ini selesai.
- **Jangan** implementasikan sistem notifikasi push/email/WA apa pun — cukup badge urgensi visual di UI sesuai `03-TECH-STACK.md` §8.

Di setiap akhir fase, tunjukkan ringkasan singkat: file apa saja yang ditambah/diubah, dan poin apa (jika ada) yang butuh keputusan/konfirmasi saya sebelum lanjut.
