import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { THEME_SCRIPT } from "@/components/theme-toggle";
import { HalftoneBackground } from "@/components/halftone-background";

export const metadata: Metadata = {
  title: "Vellum, CV and resume builder",
  description:
    "Write, format and export an A4 CV with live preview, five templates, an ATS check and PDF export.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full font-sans text-ink antialiased">
        <HalftoneBackground />
        <div className="site-content">
          <ToastProvider>{children}</ToastProvider>
        </div>
      </body>
    </html>
  );
}
