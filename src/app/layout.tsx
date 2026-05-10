import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SereneDiary",
  description:
    "Checklist harian yang tenang, terstruktur, dan siap dikembangkan dengan report mingguan, bulanan, serta SSO.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${manrope.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
