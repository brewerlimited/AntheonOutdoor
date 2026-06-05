import { Section } from "@/components/Section";
import { StyleQuiz } from "@/components/StyleQuiz";

export default function StyleQuizPage() {
  return (
    <main>
      <section className="page-hero compact">
        <p className="eyebrow">Garden style quiz</p>
        <h1>Find the garden style that best fits how you want to live outside.</h1>
        <p>
          Answer a few quick questions and we’ll suggest the Anthēon design
          direction that best suits your lifestyle, taste and investment level.
        </p>
      </section>

      <Section title="Discover your Anthēon direction">
        <StyleQuiz />
      </Section>
    </main>
  );
}
