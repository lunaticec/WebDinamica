import { ArrowUp, Clock, MapPin, Phone } from "lucide-react";
import { SHOP } from "@/lib/config";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="section relative pb-28 pt-12 lg:pb-10">
      <div className="flex flex-col gap-8 border-t border-white/[0.06] pt-10 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-3">
          <Logo size={26} />
          <div>
            <p className="font-display font-semibold">{SHOP.name}</p>
            <p className="text-sm text-white/35">© {new Date().getFullYear()} · {SHOP.tagline}</p>
          </div>
        </div>

        <ul className="space-y-2 text-sm text-white/55">
          <li className="flex items-center gap-2"><Clock size={15} className="text-orange-400" /> {SHOP.hours}</li>
          <li className="flex items-center gap-2"><MapPin size={15} className="text-orange-400" /> {SHOP.address}</li>
          <li className="flex items-center gap-2"><Phone size={15} className="text-orange-400" /> {SHOP.phone}</li>
        </ul>

        <a
          href="#top"
          aria-label="Volver arriba"
          className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink-950 transition-transform hover:-translate-y-1"
        >
          <ArrowUp size={16} />
        </a>
      </div>
    </footer>
  );
}
