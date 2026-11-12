"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { NAV_LINKS } from "@/lib/config";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { usePizza } from "@/components/pizza/PizzaProvider";

export function Navbar() {
  const { scrollY, scrollYProgress } = useScroll();
  const { cart } = usePizza();
  const cat = useCatalog();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(latest > prev && latest > 200 && !open);
    setScrolled(latest > 24);
  });

  return (
    <motion.header
      animate={{ y: hidden ? "-120%" : "0%" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4"
    >
      <nav
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 sm:px-5",
          scrolled ? "glass shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)]" : "border border-transparent"
        )}
      >
        <a href="#top" aria-label="Inicio" className="flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-lg font-semibold tracking-tight">{cat.shop.name}</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="group relative rounded-full px-4 py-2 text-sm text-white/60 transition-colors hover:text-white">
                <span className="absolute inset-0 scale-75 rounded-full bg-white/[0.06] opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
                <span className="relative">{l.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href="#ticket"
            aria-label={`Mi ticket (${cart.length})`}
            className="relative grid h-10 w-10 place-items-center rounded-full bg-white text-ink-950 transition hover:bg-white/85"
          >
            <ShoppingBag size={17} />
            <AnimatePresence>
              {cart.length > 0 && (
                <motion.span
                  key={cart.length}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-orange-500 font-mono text-[10px] font-bold text-white"
                >
                  {cart.length}
                </motion.span>
              )}
            </AnimatePresence>
          </a>
          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
            transition={{ duration: 0.3 }}
            className="glass mx-auto mt-2 max-w-7xl rounded-3xl bg-ink-900/90 p-3 md:hidden"
          >
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-3 font-display text-2xl text-white/80 hover:bg-white/5 hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="fixed inset-x-0 top-0 h-[2px] origin-left bg-gradient-to-r from-orange-500 via-amber-400 to-red-500"
      />
    </motion.header>
  );
}
