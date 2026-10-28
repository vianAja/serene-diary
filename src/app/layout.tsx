import type { Metadata } from "next";
import Script from "next/script";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SereneDiary",
  description:
    "A calm, structured daily checklist workspace with reusable templates, weekly and monthly reporting, and secure SSO access.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full">
        <Script id="serene-theme-init" strategy="beforeInteractive">
          {`try { const theme = localStorage.getItem("serene-diary-theme"); if (theme === "dark" || theme === "light") document.documentElement.dataset.theme = theme; } catch {}`}
        </Script>
        {children}
      </body>
    </html>
  );
}
