import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TextSizeSync } from "@/features/text-size/components/text-size-sync";
import { TEXT_SIZE_SCRIPT } from "@/features/text-size/text-size";
import { t } from "@/locales";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Pages set their own title, e.g. "ワークフロー | LocalChat".
  title: { default: t.app.name, template: `%s | ${t.app.name}` },
  description: t.app.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The <head> script sets the saved text size on <html> before React
    // hydrates, so React must accept the difference.
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: TEXT_SIZE_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <TextSizeSync />
        {/* A short pause before the first tooltip so sweeping the mouse
            across the sidebar doesn't flash every label; later ones open
            instantly (Radix skipDelayDuration). */}
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
