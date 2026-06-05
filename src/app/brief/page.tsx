import { MultiStepForm } from "@/components/MultiStepForm";
import { Section } from "@/components/Section";

export default function BriefPage() {
  return (
    <main>
      <section className="page-hero compact">
        <p className="eyebrow">Garden brief</p>
        <h1>Begin with a clear view of your garden.</h1>
        <p>
          Share the essentials of your space, style, budget and priorities so we
          can shape an early design direction with more care.
        </p>
        <p className="prep-note">
          Please have images ready to upload of your garden, including wide views
          from the house, boundaries and any existing features or problem areas.
        </p>
      </section>
      <Section title="Start your garden brief">
        <MultiStepForm />
      </Section>
    </main>
  );
}
