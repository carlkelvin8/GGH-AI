import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/shared/lib/query-provider';
import { AuthHeader } from '@/shared/components/auth-header';
import { ThemeToggle } from '@/shared/components/theme-toggle';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GGH AI Platform',
  description: 'Enterprise-grade AI-powered development tools by GGH Software Development Services',
};

/**
 * Root Layout for the GGH AI application.
 * Wraps the app with necessary providers and sets global styles.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="container mx-auto px-6 h-14 flex items-center justify-end gap-2">
            <ThemeToggle />
            <AuthHeader />
          </div>
        </header>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
