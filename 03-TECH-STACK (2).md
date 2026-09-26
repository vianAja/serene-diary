# Tech Stack & Arsitektur — SereneDiary Revamp

## 1. Stack Dasar (Dipertahankan, Jangan Diganti)
- **Framework:** Next.js 16.2.6 (App Router).
  ⚠️ **PENTING:** Repo ini punya `AGENTS.md` di root yang menegaskan versi Next.js di sini **berbeda dari versi yang umum dikenal** (breaking changes pada API/konvensi/struktur file). **Wajib baca isi `node_modules/next/dist/docs/` sebelum menulis kode baru** yang menyentuh routing, middleware, atau konfigurasi — jangan asumsikan pola Next.js versi lama.
- **UI:** React 19.2.4 + Tailwind CSS v4 (konfigurasi lewat `@theme inline` di `globals.css`, **bukan** `tailwind.config.js` klasik).
- **Ikon:** `lucide-react`.
- **Font:** Manrope (dipertahankan — sudah cocok dengan gaya minimalist).
- **ORM & DB:** Drizzle ORM + `@neondatabase/serverless` / `postgres` (Neon Postgres, serverless-friendly).
- **Auth:** NextAuth v4 (`next-auth`), provider Google saja, dibatasi allowlist email (tabel `allowed_users` + `src/lib/allowed-users.ts`).
- **Middleware custom:** `src/proxy.ts` (bukan `middleware.ts` standar — penamaan disengaja, jangan diubah tanpa menyesuaikan konfigurasi Next.js-nya).
- **Deployment:** Vercel (`vercel.json` di root).
- **Scripts:** npm; `db:generate` / `db:push` / `db:seed` via drizzle-kit.

## 2. Prinsip Kerja untuk Revamp
Ini adalah **revamp**, bukan rewrite:
- Pertahankan pola yang sudah ada — contoh: setiap route API memanggil `getAuthorizedUserId()` sendiri untuk cek sesi (lihat `src/lib/authorized-user.ts` & contoh di `src/app/api/templates/route.ts`); skema Drizzle memakai `id` bertipe `text()` yang di-generate manual (bukan auto-increment `serial`).
- Ikuti struktur folder & penamaan file yang sudah ada (`src/app/(app)/...`, `src/lib/<domain>.ts`, `src/app/api/<resource>/route.ts`).
- Jangan hapus tabel/data lama tanpa migration path yang jelas. Fitur baru = tabel baru.

## 3. Perubahan Skema Database (Drizzle)

Tabel yang **sudah ada** (dipertahankan apa adanya): `checklistTemplates`, `templateChecklistItems`, `dailyChecklists`, `checklistEntries`, `scheduledTasks`, `allowedUsers`.

Tambahkan ke `src/lib/db/schema.ts`:

```ts
export const checkinItems = pgTable("checkin_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(), // 'tugas_kuliah' | 'materi_kuliah' | 'kerjaan' | 'lainnya'
  description: text("description").notNull().default(""),
  dueAt: timestamp("due_at", { withTimezone: true }),
  status: text("status").notNull().default("todo"), // 'todo' | 'in_progress' | 'done'
  completedAt: timestamp("completed_at", { withTimezone: true }),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notes = pgTable("notes", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  contentMd: text("content_md").notNull().default(""),
  visibility: text("visibility").notNull().default("private"), // 'public' | 'private'
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
```

Migrasi dijalankan seperti biasa:
```bash
npm run db:generate
npm run db:push
```

## 4. Routing Baru

**Halaman (App Router):**
- `src/app/(app)/checkin/page.tsx` — halaman utama gabungan (checklist rutin + task berdeadline). Bisa hasil rename dari `dashboard/page.tsx`, dengan redirect `/dashboard` → `/checkin` untuk kompatibilitas link lama.
- `src/app/(app)/notes/manage/page.tsx` — CRUD Notes milik user, **terproteksi**.
- `src/app/(public)/notes/page.tsx` — index publik Notes (hanya `visibility = 'public'`).
- `src/app/(public)/notes/[slug]/page.tsx` — detail publik satu note.

**API Routes (pola: setiap handler cek sesi sendiri, ikuti contoh existing):**
- `src/app/api/checkin/route.ts` — `GET` (list), `POST` (create). Proteksi via `getAuthorizedUserId()`.
- `src/app/api/checkin/[id]/route.ts` — `PATCH` (update/toggle status), `DELETE`. Proteksi via `getAuthorizedUserId()`.
- `src/app/api/notes/route.ts` — `GET`: publik, tapi **hanya kembalikan** note dengan `visibility = 'public'` bila request tidak membawa sesi valid; `POST`: wajib proteksi via `getAuthorizedUserId()`.
- `src/app/api/notes/[slug]/route.ts` — `GET`: publik jika `visibility = 'public'`, selain itu 404 untuk non-owner; `PATCH`/`DELETE`: wajib proteksi via `getAuthorizedUserId()`.

## 5. Middleware (`src/proxy.ts`)
- Tambahkan `/notes` ke dalam daftar `publicRoutes`, **tapi hati-hati**: karena `/notes/manage` juga diawali `/notes`, pastikan urutan pengecekan tidak membuat halaman manajemen ikut lolos sebagai publik. Solusi paling aman: pisahkan lewat route group (`(public)` vs `(app)`) seperti di §4, lalu di `publicRoutes` cukup masukkan path spesifik `/notes` dan pola `/notes/[slug]` (bukan wildcard `/notes` yang meng-cover semua sub-path).
- Untuk API: semua `/api/*` sudah otomatis lolos middleware (lihat kode existing — `pathname.startsWith("/api/")` langsung `next()`), jadi proteksi **wajib** dilakukan di level handler seperti pola yang sudah dipakai di seluruh API route lain. GET publik notes tidak perlu mewajibkan `getAuthorizedUserId()`, tapi mutasi (POST/PATCH/DELETE) wajib.

## 6. Library Baru yang Direkomendasikan
- **Render Markdown:** `react-markdown` + `remark-gfm` (dukungan tabel, strikethrough, dll) + `rehype-sanitize` (**wajib**, karena konten ini bisa diakses publik tanpa login — cegah XSS dari HTML mentah di dalam Markdown).
- Tidak perlu tambah state management baru; React state/hooks bawaan sudah cukup untuk skala app ini.
- (Opsional, kalau ingin editor+preview split-pane instan) `@uiw/react-md-editor` — tapi untuk menjaga filosofi minimalist & dependency ringan, textarea polos + panel preview `react-markdown` sudah cukup.

## 7. Desain Visual — Token Warna Baru

Ganti isi `:root` di `src/app/globals.css` (menggantikan token lama sepenuhnya):

```css
:root {
  --background: #F9F7F7;
  --foreground: #112D4E;
  --muted: #5b7392;          /* turunan medium antara primary & foreground, untuk teks sekunder */
  --surface: #ffffff;
  --surface-soft: #F9F7F7;
  --surface-strong: #DBE2EF;
  --primary: #3F72AF;
  --primary-soft: #6f97c4;   /* tint lebih terang dari primary, untuk hover/disabled state */
  --secondary: #DBE2EF;
  --accent: #112D4E;
  --outline: #DBE2EF;
  --shadow: 0 12px 32px rgba(17, 45, 78, 0.08);
}
```

**Catatan penting:** 4 warna inti yang diberikan (`#F9F7F7`, `#DBE2EF`, `#3F72AF`, `#112D4E`) **tidak menyediakan warna semantik** (kuning/merah) untuk status urgensi task di fitur Check-in. Ini perlu keputusan Najwan sebelum implementasi Fase 2:

- **Opsi A (strict 4 warna):** tidak menambah warna sama sekali. "Mendekati deadline" ditandai dengan outline dashed atau opacity lebih tinggi pada `#112D4E`; "overdue" ditandai dengan fill solid `#112D4E` + ikon (bukan warna baru).
- **Opsi B (tambah 2 warna aksen terbatas):** tambahkan `--warning: #b9853f` dan `--danger: #b23a3a`, dipakai **sangat terbatas** — hanya untuk badge kecil status urgensi, tidak untuk elemen UI lain. Ini lebih mudah dibaca sekilas tapi sedikit menyimpang dari palet asli.

Rekomendasi default: **Opsi B** dengan porsi pemakaian minimal, karena kejelasan status deadline cukup penting secara fungsional, tapi keputusan akhir tetap di Najwan.

**Tipografi:** pertahankan Manrope, tapi pangkas hierarki ke 2–3 ukuran heading + 1 ukuran body agar "sedikit teks" juga terasa secara visual, tidak hanya dari jumlah kata.

## 8. Notifikasi — Arsitektur Decoupled (Implementasi Out of Scope)
- Core app hanya expose **data**: field `dueAt` pada `checkin_items`, plus nilai `urgency` (`normal` / `upcoming` / `overdue`) yang dihitung on-the-fly berdasarkan `dueAt` vs waktu sekarang, ditampilkan sebagai badge di UI.
- Untuk fase mendatang (di luar scope revamp ini), sediakan endpoint tambahan seperti `GET /api/checkin/upcoming?withinHours=24` yang bisa dipanggil oleh cron eksternal (Vercel Cron, n8n, GitHub Actions schedule, dll) untuk mengirim notifikasi lewat channel pilihan (email/WhatsApp/Telegram) **di luar** aplikasi inti ini. **Tidak dibangun sekarang.**

## 9. Verifikasi Minimum Sebelum Dianggap Selesai
- `npm run lint` harus tetap bersih.
- `npm run build` harus sukses — perhatikan Next.js 16 App Router type-check ketat pada `params` berbasis Promise, ikuti pola yang sudah dipakai di route existing, contoh:
  ```ts
  { params }: { params: Promise<{ date: string }> }
  ```
