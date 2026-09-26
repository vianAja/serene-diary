# User Requirements — SereneDiary Revamp

Dokumen ini merinci requirement fungsional & acceptance criteria dari `01-PRD.md`, ditulis sebagai user story agar mudah diterjemahkan langsung ke kode oleh AI coding assistant.

## 1. Persona

### Persona A — Najwan (Authenticated Owner)
Satu-satunya user aplikasi ini, login via Google SSO (email masuk allowlist `allowed_users`). Berperan sebagai mahasiswa (punya tugas & materi kuliah dengan deadline) sekaligus infrastructure engineer/trainer (punya task profesional). Butuh satu tempat ringkas untuk memantau semua task + menulis catatan.

### Persona B — Pengunjung Publik (Anonymous Reader)
Tidak punya akun, tidak login. Hanya mengakses Notes yang berstatus Public lewat link langsung atau halaman index publik. Read-only sepenuhnya.

---

## 2. Requirement — Fitur Existing (Dipertahankan, Direstyle)

Fungsi-fungsi ini **tidak dihapus**, hanya direstyle mengikuti prinsip minimalist + palet baru. AI coding assistant tidak perlu membangun ulang logikanya dari nol.

| Route | Deskripsi Fungsi Saat Ini | Perubahan yang Diharapkan |
|---|---|---|
| `/dashboard` (→ jadi `/checkin`) | Checklist harian dari template aktif | Direstyle + digabung dengan section task berdeadline baru (lihat FR-1) |
| `/templates` | CRUD template checklist rutin | Direstyle saja, fungsi tetap |
| `/reports/weekly` | Rekap progres mingguan | Direstyle saja |
| `/reports/monthly` | Rekap progres bulanan | Direstyle saja |
| `/calendar` | Kalender & scheduled tasks | Direstyle; opsional tampilkan deadline Check-in sebagai marker tambahan |
| `/settings` | Pengaturan aplikasi | Direstyle saja |
| `/sign-in` | Login Google SSO | Direstyle sesuai palet baru |

---

## 3. Requirement — Fitur Baru

### FR-1 — Halaman Check-in (gabungan)
**User Story:** Sebagai Najwan, saya ingin melihat semua task utama saya (tugas kuliah, materi kuliah, pekerjaan) dalam satu halaman Check-in, agar saya tahu apa yang harus dikerjakan hari ini.

**Acceptance Criteria:**
- [ ] Halaman `/checkin` menampilkan dua bagian: **(a)** checklist rutin dari template aktif (sistem lama, dipertahankan), dan **(b)** daftar Task Berdeadline (baru).
- [ ] Setiap Task punya: judul, kategori (`Tugas Kuliah` / `Materi Kuliah` / `Kerjaan` / `Lainnya`), deskripsi singkat opsional, tanggal expire/deadline (tanggal, waktu opsional).
- [ ] Task bisa ditandai selesai (checkbox), progres tersimpan ke database.
- [ ] Task yang mendekati deadline diberi badge visual berbeda dari task yang sudah lewat deadline (overdue) — **murni visual, tanpa push/email**.
- [ ] Task bisa ditambah, diedit, dan dihapus langsung dari halaman ini (CRUD).
- [ ] Data tersimpan per user (`userId`) di Postgres via Drizzle, tabel baru `checkin_items` (lihat `03-TECH-STACK.md` §3).

### FR-2 — Filter & Kategori Check-in
**User Story:** Sebagai Najwan, saya ingin memfilter task berdasarkan kategori dan status, agar tidak kewalahan melihat semua task sekaligus.

**Acceptance Criteria:**
- [ ] Bisa filter task berdasarkan kategori.
- [ ] Bisa filter berdasarkan status: Semua / Aktif / Selesai / Overdue.

### FR-3 — Menulis Note (Markdown)
**User Story:** Sebagai Najwan, saya ingin menulis catatan dalam format Markdown dan menyimpannya sebagai draft privat.

**Acceptance Criteria:**
- [ ] Ada halaman manajemen Notes (privat, terproteksi login) yang menampilkan semua notes milik saya beserta statusnya (Public/Private).
- [ ] Ada editor sederhana: field judul, slug (auto-generate dari judul, tetap bisa diedit manual), textarea isi Markdown, live preview hasil render, toggle status Public/Private.
- [ ] Note baru selalu default **Private**.
- [ ] Note bisa diedit dan dihapus kapan saja.

### FR-4 — Publikasi & Akses Publik Notes
**User Story:** Sebagai pengunjung publik, saya ingin membaca note yang sudah dipublikasikan tanpa perlu login.

**Acceptance Criteria:**
- [ ] Saat status note diubah ke Public, note bisa diakses lewat URL publik tanpa autentikasi apa pun.
- [ ] Ada halaman index publik yang menampilkan daftar note Public saja (judul, ringkasan singkat, tanggal publish) — tanpa menampilkan draft/private.
- [ ] Konten Markdown dirender ke HTML dengan **sanitasi** (tidak boleh raw HTML/script tereksekusi).
- [ ] Jika note diubah kembali ke Private, halaman publiknya langsung tidak bisa diakses lagi (404 atau redirect, bukan error 500).

**Catatan desain (perlu konfirmasi Najwan):**
Karena "Notes" perlu dua wajah berbeda — manajemen privat (create/edit/toggle publish) vs listing publik (baca saja) — direkomendasikan pisah route agar tidak tercampur:
- **Publik:** `/notes` (index, hanya yang Public) dan `/notes/[slug]` (detail).
- **Manajemen (privat, di dalam grup `(app)` yang terproteksi):** `/notes/manage` atau ditaruh sebagai sub-halaman di `/settings`.

Jika Najwan lebih suka pola lain (misal manajemen tetap di `/notes` saat login, dan publik pakai path berbeda seperti `/n/[slug]`), sesuaikan — yang penting halaman manajemen **tidak boleh** bisa diakses tanpa login.

### FR-5 — Redesign Minimalist & Palet Baru
**User Story:** Sebagai Najwan, saya ingin semua halaman terasa ringkas, tidak banyak teks, dengan palet warna baru yang konsisten.

**Acceptance Criteria:**
- [ ] Teks label/deskripsi dipangkas ke inti; hindari paragraf panjang di UI, ganti dengan ikon + label singkat (tooltip bila perlu detail tambahan).
- [ ] Palet warna baru (`#F9F7F7`, `#DBE2EF`, `#3F72AF`, `#112D4E`) diterapkan lewat CSS variables di `globals.css`, menggantikan token lama sepenuhnya.
- [ ] Navigasi (sidebar desktop & bottom nav mobile) diperbarui: entri "Daily" diganti menjadi **"Check-in"**, tambah entri baru **"Notes"**.
- [ ] Kontras teks tetap terbaca dengan palet baru, khususnya teks di atas warna gelap `#112D4E` dan warna primer `#3F72AF`.

---

## 4. Non-Goals (Eksplisit Ditolak untuk Fase Ini)
- Push notification browser, email reminder, atau bot WhatsApp/Telegram.
- Multi-user login selain satu allowlisted user yang sudah ada.
- Kolom komentar atau interaksi sosial apa pun di halaman Notes publik.
- Editor WYSIWYG kompleks (rich text) untuk Notes — cukup Markdown + preview.
