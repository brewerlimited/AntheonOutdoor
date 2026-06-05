import type { ReactNode } from "react";

type FeatureCardProps = {
  title: string;
  children: ReactNode;
};

export function FeatureCard({ title, children }: FeatureCardProps) {
  return (
    <article className="feature-card">
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}
