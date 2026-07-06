import type { Metadata } from "next";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
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
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-950">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
