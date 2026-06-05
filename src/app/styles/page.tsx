import { Button } from "@/components/Button";
import { Section } from "@/components/Section";
import { StyleCard } from "@/components/StyleCard";
import { styleConcepts } from "@/data/content";

export default function StylesPage() {
  return (
    <main>
      <section className="page-hero compact">
        <p className="eyebrow">Styles and concepts</p>
        <h1>Outdoor styles with atmosphere, restraint and purpose.</h1>
        <p>
          Explore early visual directions that can guide materials, planting,
          features and the overall mood of your garden.
        </p>
      </section>
      <Section title="Design directions">
        <div className="style-grid">
          {styleConcepts.map((style) => (
            <StyleCard key={style.title} {...style} expandable />
          ))}
        </div>
        <div className="centered-action">
          <Button href="/style-quiz" variant="secondary">
            Find Your Garden Style
          </Button>
        </div>
      </Section>
    </main>
  );
}
