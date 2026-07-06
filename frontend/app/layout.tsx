import type { Metadata } from "next";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ERP Lite",
  description: "A focused ERP workspace for daily operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
        <ThemeProvider>
          <LocaleProvider>{children}</LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
