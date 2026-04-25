import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted JetBrains Mono includes the full Unicode range — notably
// box-drawing (U+2500–257F) and block elements (U+2580–259F) used by the
// SIPESDEV ASCII banner. The Google Fonts subset ships only Latin glyphs,
// causing those box chars to fall back to a different font with mismatched
// widths and breaking the banner alignment.
const jetbrainsMono = localFont({
  src: "./fonts/JetBrainsMono-Regular.woff2",
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Michael Sipes | Software Engineer",
  description: "I create things.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body className="font-mono antialiased">{children}</body>
    </html>
  );
}
