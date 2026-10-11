import type { Metadata } from "next";
import './theme.css';
import './globals.css';
import './play.css';
import './learning-theme.css';
import {ExperienceProvider} from '../components/experience-provider';

export const metadata: Metadata = {
  title: "Mendje të Zgjuara",
  description: "Logjikë dhe arsyetim në shqip për klasat 1–4.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sq" suppressHydrationWarning>
      <body className="antialiased"><ExperienceProvider>{children}</ExperienceProvider></body>
    </html>
  );
}
