import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { CustomCursor } from "@/components/cursor/CustomCursor";
import { InteractiveBackground } from "@/components/background/InteractiveBackground";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Aether — Interfaces que se sienten vivas",
  description:
    "Landing page futurista e interactiva: fondo reactivo, scroll suave, parallax y microinteracciones avanzadas.",
};

export const viewport: Viewport = {
  themeColor: "#05060a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="noise">
        <SmoothScroll>
          <InteractiveBackground />
          <div className="relative z-10">{children}</div>
          <CustomCursor />
        </SmoothScroll>
      </body>
    </html>
  );
}
