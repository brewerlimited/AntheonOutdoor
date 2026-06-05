import { Button } from "@/components/Button";
import { Section } from "@/components/Section";
import { services } from "@/data/content";

export default function ServicesPage() {
  return (
    <main>
      <section className="page-hero compact">
        <p className="eyebrow">Services</p>
        <h1>Design-led outdoor living, shaped from the first decision.</h1>
        <p>
          From patios and pergolas to full garden transformations, each service
          starts with proportion, use, materials and atmosphere.
        </p>
      </section>
      <Section title="What Anthēon can shape">
        <div className="service-list">
          {services.map((service) => (
            <article className="service-row" key={service.title}>
              <h2>{service.title}</h2>
              <p>{service.text}</p>
            </article>
          ))}
        </div>
        <div className="centered-action">
          <Button href="/brief">Start Your Garden Brief</Button>
        </div>
      </Section>
    </main>
  );
}
