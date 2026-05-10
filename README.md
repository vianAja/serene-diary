# SereneDiary

Website checklist harian berbasis Next.js + React dengan:

- dashboard utama untuk checklist harian
- template checklist yang bisa dipakai ulang
- report mingguan
- report bulanan
- login page yang sudah SSO-ready
- fondasi PostgreSQL/Neon lewat Drizzle ORM

## Menjalankan project

```bash
npm install
npm run dev
```

Project akan berjalan di `http://localhost:3000`.

## Struktur route

- `/dashboard` untuk checklist harian
- `/templates` untuk manajemen template
- `/reports/weekly` untuk report mingguan
- `/reports/monthly` untuk report bulanan
- `/sign-in` untuk login page dan SSO setup

## Setup database Neon

Saya tidak menulis credential database langsung ke repo supaya tetap aman. Isi env lokal Anda di `.env.local`:

```env
DATABASE_URL=postgresql://...
```

Lalu gunakan command berikut:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

File penting:

- [drizzle.config.ts](/home/vian/workspace/serene-diary/drizzle.config.ts)
- [src/lib/db/schema.ts](/home/vian/workspace/serene-diary/src/lib/db/schema.ts)
- [src/lib/db/seed.ts](/home/vian/workspace/serene-diary/src/lib/db/seed.ts)

## Setup SSO

Implementasi login saya siapkan dengan Clerk karena alur Google dan Microsoft SSO paling cepat untuk diproduksikan.

Isi `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
```

Lalu aktifkan provider yang Anda mau di Clerk Dashboard:

- Google
- Microsoft
- Email / password fallback bila perlu

Begitu env Clerk aktif:

- halaman `/sign-in` otomatis menampilkan UI login live
- route `/dashboard`, `/templates`, dan `/reports/*` siap diproteksi melalui [src/proxy.ts](/home/vian/workspace/serene-diary/src/proxy.ts)

File auth yang relevan:

- [src/app/layout.tsx](/home/vian/workspace/serene-diary/src/app/layout.tsx)
- [src/app/(auth)/sign-in/[[...sign-in]]/page.tsx](/home/vian/workspace/serene-diary/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx)
- [src/lib/clerk.ts](/home/vian/workspace/serene-diary/src/lib/clerk.ts)

## Catatan implementasi

- UI mengikuti arah visual dari folder `stitch_daily_task_checklist_dashboard`
- Data halaman sekarang menggunakan snapshot demo yang terstruktur agar UI bisa langsung direview
- Fondasi schema dan seed untuk PostgreSQL sudah disiapkan agar tahap integrasi backend berikutnya lebih cepat
