import { PizzaProvider } from "@/components/pizza/PizzaProvider";
import { PizzaBuilder } from "@/components/pizza/PizzaBuilder";
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Menu } from "@/components/sections/Menu";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <PizzaProvider>
      <Navbar />
      <main>
        <Hero />
        <PizzaBuilder />
        <Menu />
      </main>
      <Footer />
    </PizzaProvider>
  );
}
