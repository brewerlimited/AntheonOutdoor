import type { ReactNode } from "react";

type SectionProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
  tone?: "default" | "stone" | "dark";
};

export function Section({
  eyebrow,
  title,
  intro,
  children,
  tone = "default",
}: SectionProps) {
  return (
    <section className={`section section-${tone}`}>
      <div className="section-heading">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {intro ? <p>{intro}</p> : null}
      </div>
      {children}
    </section>
  );
}
