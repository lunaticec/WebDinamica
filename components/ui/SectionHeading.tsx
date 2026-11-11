import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { SplitText } from "./SplitText";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({ eyebrow, title, description, align = "left", className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <Reveal y={16}>
        <span className="eyebrow">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_10px_2px_rgba(255,140,40,0.7)]" />
          {eyebrow}
        </span>
      </Reveal>
      <h2 className="mt-6 font-display text-display-md font-semibold text-white">
        <SplitText text={title} />
      </h2>
      {description && (
        <Reveal delay={0.15}>
          <p className="mt-5 text-lg leading-relaxed text-white/55">{description}</p>
        </Reveal>
      )}
    </div>
  );
}
