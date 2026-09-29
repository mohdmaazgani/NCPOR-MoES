import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NCPOR Polar Science Portal | Knowledge Repository, Outreach and Media Hub",
  description:
    "Archive of Indian polar expedition reports, scientific datasets, publications, photographs and video, with tools to turn research into public outreach. SIH 2026, PS 26063, MoES / NCPOR.",
};

export const viewport: Viewport = {
  themeColor: "#030712",
  width: "device-width",
  initialScale: 1,
};

const bootScript = `
try {
  var d = document.documentElement;
  var t = localStorage.getItem('ncpor-theme'); if (t) d.dataset.theme = t;
  var c = localStorage.getItem('ncpor-contrast'); if (c) d.dataset.contrast = c;
  var m = localStorage.getItem('ncpor-motion'); if (m) d.dataset.motion = m;
  var s = localStorage.getItem('ncpor-fontscale'); if (s) d.style.fontSize = s + '%';
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
