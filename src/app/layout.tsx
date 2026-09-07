import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "NIRMITI - Online Objective Type Examination Portal",
  description:
    "A standardized online objective examination platform with live timer, question palette, negative marking, instant auto-grading, and anti-cheating monitoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+Chettan+2:wght@400;500;600;700;800&family=Manjari:wght@400;700&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© 2026 NIRMITI Online Examination System. All rights reserved.</p>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Secure Testing Environment</span>
              <span>•</span>
              <span>Instant Objective Evaluation</span>
              <span>•</span>
              <span>Proctored Telemetry</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
