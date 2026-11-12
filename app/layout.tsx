import type { Metadata, Viewport } from "next";
import { CatalogProvider } from "@/components/providers/CatalogProvider";
import { getCatalog } from "@/lib/server/catalog";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { CustomCursor } from "@/components/cursor/CustomCursor";
import { InteractiveBackground } from "@/components/background/InteractiveBackground";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

// El catálogo lo edita el dueño en /admin: nunca se pre-renderiza de forma estática.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { shop } = await getCatalog();
  return {
    title: `${shop.name} — Arma tu pizza`,
    description: `${shop.tagline}. Arma tu pizza ingrediente por ingrediente y mira el precio cambiar en tiempo real.`,
  };
}

export const viewport: Viewport = {
  themeColor: "#05060a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const catalog = await getCatalog();
  return (
    <html lang="es" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="noise">
        <CatalogProvider catalog={catalog}>
          <SmoothScroll>
            <InteractiveBackground />
            <div className="relative z-10">{children}</div>
            <CustomCursor />
          </SmoothScroll>
        </CatalogProvider>
      </body>
    </html>
  );
}
