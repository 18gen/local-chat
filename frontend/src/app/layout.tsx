import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TextSizeSync } from "@/features/text-size/components/text-size-sync";
import { TEXT_SIZE_SCRIPT } from "@/features/text-size/text-size";
import { t } from "@/locales";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: t.app.name, template: `%s | ${t.app.name}` },
  description: t.app.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The <head> script sets the text size on <html> before hydration.
    <html
      lang="ja"
      className={`${geistSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: TEXT_SIZE_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <TextSizeSync />
        {/* A pause before the first tooltip, so sweeping the sidebar doesn't flash every label. */}
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
