import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import AppToaster from "@/components/AppToaster";

import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import SessionProvider from "../components/SessionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Failio",
  description: "Failio is an AI-powered reflection app that helps you analyze failures and transform them into actionable growth.",
  icons: {
    icon: "/logo.png",
  },
};

import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  // ดึง locale และ messages จาก next-intl ที่ได้จาก request.ts
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* NextIntlClientProvider คือ component ของ next-intl ที่ใช้ส่ง messages ไปยัง client component */}
        {/* ทำให้เรียกใช้ hook useTranslations() ใน client component ได้ */}
        <NextIntlClientProvider messages={messages}>
          <SessionProvider session={session}>
            <ThemeProvider>
              <NavBar />
              {children}
              <AppToaster />
            </ThemeProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
