import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeInit } from "@/components/ThemeInit";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Планувальник стратегії багатства",
  description: "Розрахуйте прогноз капіталу та консервативний річний дохід для різних варіантів інвестицій та бізнесу",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeInit />
        {children}
      </body>
    </html>
  );
}
