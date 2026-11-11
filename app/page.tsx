import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { Features } from "@/components/sections/Features";
import { Showcase } from "@/components/sections/Showcase";
import { Process } from "@/components/sections/Process";
import { Stats } from "@/components/sections/Stats";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <div className="overflow-hidden py-10">
          <Marquee />
        </div>
        <Features />
        <Showcase />
        <Process />
        <Stats />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
