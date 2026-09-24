import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AppModals } from "@/components/AppModals";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VERITAS AI // Disinformation Intelligence & Truth Console",
  description: "Enterprise-grade real-time NLP disinformation detection platform powered by PassiveAggressive Machine Learning and PostgreSQL Raw SQL telemetry.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('truth-console-theme') === 'dark' || (!('truth-console-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else if (localStorage.getItem('truth-console-theme') === 'white') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark'); // Default to dark for this app
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:bg-indigo-500/30 dark:selection:text-indigo-200 transition-colors duration-200 font-sans`}>
        <AppProvider>
          {children}
          <AppModals />
        </AppProvider>
      </body>
    </html>
  );
}
