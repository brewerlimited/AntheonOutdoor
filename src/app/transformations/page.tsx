import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { Button } from "@/components/Button";
import { Section } from "@/components/Section";

const transformations = [
  {
    title: "Narrow new-build garden",
    brief:
      "A blank lawn and exposed boundaries reimagined as a calm outdoor room with a compact seating zone, softened planting and warmer evening atmosphere.",
    beforeLabel: "Plain lawn, exposed fencing",
    afterLabel: "Defined seating, planting and lighting",
    tone: "courtyard" as const,
  },
  {
    title: "Family garden refresh",
    brief:
      "A practical family space shaped into clearer zones for relaxing, dining and play, using durable surfaces and planting that keeps the garden feeling grown-up.",
    beforeLabel: "Unstructured family garden",
    afterLabel: "Zoned family outdoor living",
    tone: "family" as const,
  },
  {
    title: "Dark contemporary update",
    brief:
      "A tired patio concept shifted toward a darker, more architectural mood with charcoal boundaries, restrained planting and a focused seating moment.",
    beforeLabel: "Tired patio and mixed finishes",
    afterLabel: "Dark, focused visual direction",
    tone: "dark" as const,
  },
];

export default function TransformationsPage() {
  return (
    <main>
      <section className="page-hero compact">
        <p className="eyebrow">Transformations</p>
        <h1>Before and after directions for considered outdoor change.</h1>
        <p>
          These placeholder comparisons show how a brief can move from an
          underused garden into a clearer design direction. Real launch project
          photography will be added as the studio develops.
        </p>
      </section>

      <Section
        title="Visual transformation examples"
        intro="Use the vertical slider on each image to compare the current-space direction with the proposed atmosphere."
      >
        <div className="transformation-grid">
          {transformations.map((transformation) => (
            <BeforeAfterSlider key={transformation.title} {...transformation} />
          ))}
        </div>
        <div className="centered-action">
          <Button href="/brief">Start Your Garden Brief</Button>
        </div>
      </Section>
    </main>
  );
}
