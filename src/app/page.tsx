import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/Button";
import { FeatureCard } from "@/components/FeatureCard";
import { InvestmentGuide } from "@/components/InvestmentGuide";
import { Section } from "@/components/Section";
import { StyleCard } from "@/components/StyleCard";
import { styleConcepts } from "@/data/content";

const steps = [
  "Share your garden brief",
  "Upload your current space",
  "Receive a design-led consultation",
  "Build your outdoor transformation",
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Affordable luxury outdoor living</p>
          <h1>Outdoor spaces designed to feel considered, calm and quietly luxurious.</h1>
          <p>
            Anthēon Outdoor shapes modern garden transformations through a
            design-led brief, budget-aware concepts and carefully considered
            outdoor living ideas.
          </p>
          <div className="button-row">
            <Button href="/brief">Start Your Garden Brief</Button>
            <Button href="/styles" variant="secondary">
              Explore Design Styles
            </Button>
          </div>
        </div>
        <div className="hero-visual" aria-label="Architectural garden concept">
          <Image
            alt="Modern outdoor living concept with patio, planting and seating"
            height={1000}
            priority
            sizes="(max-width: 900px) 100vw, 48vw"
            src="/images/styles/resort-outdoor-living.png"
            width={1600}
          />
          <div className="hero-visual-caption">
            <span>Concept direction</span>
            <strong>Patio, planting, pergola, seating area and fire pit</strong>
          </div>
          <div className="hero-brand-seal" aria-hidden="true">
            <Image
              alt=""
              height={72}
              src="/images/brand/antheon-monogram.png"
              width={72}
            />
          </div>
          <div className="material-strip">
            <span className="swatch stone" />
            <span className="swatch green" />
            <span className="swatch bronze" />
          </div>
        </div>
      </section>

      <Section
        eyebrow="Design-led studio"
        title="A calmer route to a more considered garden."
        intro="A boutique outdoor transformation studio for homeowners who want the garden to feel as considered as the home."
      >
        <div className="feature-grid three">
          <FeatureCard title="Architectural thinking">
            We approach gardens as outdoor rooms, balancing proportion, material,
            planting, lighting and the way the space will be lived in.
          </FeatureCard>
          <FeatureCard title="Practical luxury">
            The aim is not excess. It is a garden that feels refined, durable and
            right for everyday use.
          </FeatureCard>
          <FeatureCard title="Clearer brief">
            Your priorities, photos, layout and budget are brought together
            before any design direction is shaped.
          </FeatureCard>
        </div>
        <div className="studio-note">
          <span>Studio principle</span>
          <p>
            Start with atmosphere and use, then refine the materials. A garden
            should feel resolved before it feels expensive.
          </p>
        </div>
      </Section>

      <Section eyebrow="How it works" title="From first idea to finished garden.">
        <div className="step-grid">
          {steps.map((step, index) => (
            <div className="step-card" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{step}</h3>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Affordable luxury"
        title="A refined garden should still feel grounded in reality."
        intro="The process starts with the investment level you are comfortable with. Materials, features and visual direction are then shaped around the strongest version of the space for that range."
        tone="stone"
      >
        <div className="split">
          <div>
            <h3>Considered choices. Stronger outcomes.</h3>
            <p>
              A polished garden is often about restraint: fewer materials, better
              details, useful lighting, generous seating and planting that softens
              the architecture.
            </p>
          </div>
          <Button href="/brief">Start Your Garden Brief</Button>
        </div>
      </Section>

      <Section
        eyebrow="Launch projects"
        title="Early client opportunities are now open."
        intro="Anthēon Outdoor is accepting a limited number of launch projects. Selected clients may receive preferential pricing where photography, video, before/after content and a written testimonial are agreed in advance."
      >
        <div className="launch-panel">
          <p>
            Early projects are selected for fit, visual potential and homeowner
            comfort with content permissions. The approach is transparent:
            concept-led design, clear expectations and no borrowed portfolio.
          </p>
          <Link className="text-link" href="/launch-projects">
            Read about launch project opportunities
          </Link>
        </div>
      </Section>

      <Section eyebrow="Visual direction examples" title="Explore style concepts.">
        <div className="style-grid">
          {styleConcepts.slice(0, 3).map((style) => (
            <StyleCard key={style.title} {...style} />
          ))}
        </div>
        <div className="centered-action">
          <Button href="/style-quiz" variant="secondary">
            Find Your Garden Style
          </Button>
        </div>
      </Section>

      <Section
        eyebrow="Investment guide"
        title="What level of investment are you considering?"
        intro="Every garden is different, but these guide levels help you understand what kind of transformation may suit your space, priorities and preferred investment."
        tone="stone"
      >
        <InvestmentGuide variant="homepage" />
        <div className="split investment-guide-cta">
          <div>
            <h3>Not sure which level suits your space?</h3>
            <p>
              The style quiz and garden brief help shape the right direction
              before any scope is refined.
            </p>
          </div>
          <div className="button-row">
            <Button href="/style-quiz">Take the Style Quiz</Button>
            <Button href="/brief" variant="secondary">
              Start Your Garden Brief
            </Button>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Why start with a brief"
        title="A stronger garden starts with clearer decisions."
        intro="The brief gives Anthēon a shared view of your space, budget, style preferences and priorities before a visual direction is prepared."
      >
        <div className="feature-grid three">
          <FeatureCard title="Budget-aligned thinking">
            Your selected investment level shapes what belongs in the focused,
            enhanced and dream versions.
          </FeatureCard>
          <FeatureCard title="Prepared with care">
            Labelled photos, address context and your priorities help us prepare
            a clearer consultation direction before visuals are refined.
          </FeatureCard>
          <FeatureCard title="Review before refinement">
            Early concepts stay honest: visual direction first, with final scope
            subject to consultation and survey.
          </FeatureCard>
        </div>
      </Section>

      <section className="final-cta">
        <p className="eyebrow">Begin with a brief</p>
        <h2>Shape an outdoor space that feels designed, practical and beautifully yours.</h2>
        <Button href="/brief">Start Your Garden Brief</Button>
      </section>
    </main>
  );
}
