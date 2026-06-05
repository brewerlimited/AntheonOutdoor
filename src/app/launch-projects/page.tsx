import { Button } from "@/components/Button";
import { FeatureCard } from "@/components/FeatureCard";
import { Section } from "@/components/Section";

export default function LaunchProjectsPage() {
  return (
    <main>
      <section className="page-hero compact">
        <p className="eyebrow">Launch projects</p>
        <h1>Early client opportunities for considered outdoor transformations.</h1>
        <p>
          Anthēon Outdoor is accepting a limited number of early launch projects
          as the studio develops its first client stories and visual content.
        </p>
      </section>
      <Section
        title="Preferential pricing may be available for selected projects."
        intro="Where appropriate, selected launch projects may receive preferential pricing in exchange for permission to capture photography, video, before/after content and a written testimonial."
      >
        <div className="feature-grid three">
          <FeatureCard title="Honest stage">
            Anthēon Outdoor is in its early launch stage. Current examples are
            concept-led visual directions rather than a completed project
            portfolio.
          </FeatureCard>
          <FeatureCard title="Mutual fit">
            Launch opportunities are intended for homeowners who are comfortable
            helping shape early brand content around a real transformation.
          </FeatureCard>
          <FeatureCard title="Clear permission">
            Photography, video and written testimonial use would be agreed before
            any launch project proceeds.
          </FeatureCard>
        </div>
        <div className="centered-action">
          <Button href="/brief">Start Your Garden Brief</Button>
        </div>
      </Section>
    </main>
  );
}
