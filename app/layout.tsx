import type { Metadata } from "next";
import { headers } from 'next/headers';
import './theme.css';
import './globals.css';
import './play.css';
import './learning-theme.css';
import {ExperienceProvider} from '../components/experience-provider';
import {SessionGuard} from '../components/session-guard';

export const metadata: Metadata = {
  title: "Mendje të Zgjuara",
  description: "Logjikë dhe arsyetim në shqip për klasat 1–4.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get('x-nonce') || undefined;
  return (
    <html lang="sq" suppressHydrationWarning>
      <body className="antialiased"><ExperienceProvider nonce={nonce}><SessionGuard/>{children}</ExperienceProvider></body>
    </html>
  );
}
