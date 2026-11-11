import { ArrowUp, AtSign, Github, Linkedin } from "lucide-react";
import { NAV_LINKS } from "@/lib/content";
import { Logo } from "@/components/ui/Logo";

const SOCIALS = [
  { label: "GitHub", href: "#", icon: Github },
  { label: "LinkedIn", href: "#", icon: Linkedin },
  { label: "Email", href: "#cta", icon: AtSign },
];

export function Footer() {
  return (
    <footer className="section relative pb-10 pt-16">
      <div className="flex flex-col gap-10 border-t border-white/[0.06] pt-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Logo size={24} />
          <span className="font-display font-semibold">Aether</span>
          <span className="text-sm text-white/30">© {new Date().getFullYear()}</span>
        </div>

        <nav className="flex flex-wrap gap-6 text-sm text-white/50">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {SOCIALS.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/60 transition-all hover:-translate-y-0.5 hover:border-white/30 hover:text-white"
            >
              <Icon size={16} />
            </a>
          ))}
          <a
            href="#top"
            aria-label="Volver arriba"
            className="ml-2 grid h-10 w-10 place-items-center rounded-full bg-white text-ink-950 transition-transform hover:-translate-y-1"
          >
            <ArrowUp size={16} />
          </a>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none mt-16 select-none text-center font-display text-[22vw] font-semibold leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.08)]"
      >
        AETHER
      </div>
    </footer>
  );
}
