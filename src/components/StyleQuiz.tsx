"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { InvestmentGuide } from "@/components/InvestmentGuide";
import {
  calculateStyleQuizResult,
  getQuizResultDetails,
  quizQuestions,
  saveStyleQuizResult,
} from "@/lib/styleQuiz";
import type { StyleQuizStoredResult } from "@/data/types";

export function StyleQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<StyleQuizStoredResult | null>(null);
  const question = quizQuestions[step];
  const progress = Math.round(((step + 1) / quizQuestions.length) * 100);
  const resultDetails = useMemo(
    () => (result ? getQuizResultDetails(result.styleName) : null),
    [result],
  );

  function selectAnswer(answer: string) {
    const nextAnswers = { ...answers, [question.id]: answer };

    setAnswers(nextAnswers);

    if (step === quizQuestions.length - 1) {
      const nextResult = calculateStyleQuizResult(nextAnswers);
      saveStyleQuizResult(nextResult);
      setResult(nextResult);
      return;
    }

    window.setTimeout(() => setStep((current) => current + 1), 120);
  }

  function retakeQuiz() {
    setAnswers({});
    setResult(null);
    setStep(0);
  }

  const suggestedBands = result ? getSuggestedInvestmentBands(result.styleName) : [];

  if (result && resultDetails) {
    return (
      <div className="quiz-result-panel">
        <p className="eyebrow">Your result</p>
        <h2>Your Anthēon style is: {result.styleName}</h2>
        <p>{resultDetails.description}</p>
        <div className="quiz-result-grid">
          <div>
            <h3>Recommended features</h3>
            <ul className="feature-list">
              {result.recommendedFeatures.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Likely best budget band</h3>
            <p>{resultDetails.likelyBudgetBand}</p>
          </div>
          <div>
            <h3>Why this suits you</h3>
            <ul className="feature-list">
              {result.whyThisSuitsYou.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="quiz-disclaimer">
          This is a style direction only. Final recommendations depend on your
          garden layout, photos, budget and consultation.
        </p>
        <div className="quiz-investment-guide">
          <h3>Investment levels that may suit this direction</h3>
          <p>
            Your final design direction will be shaped around your actual
            garden, photos, selected features and preferred investment level.
          </p>
          <InvestmentGuide
            compact
            selectedBand={result.budgetBand}
            suggestedBands={suggestedBands}
            variant="quizResult"
          />
        </div>
        <div className="button-row">
          <Button href="/brief">Start Your Garden Brief</Button>
          <Button href="/styles" variant="secondary">
            Explore Other Styles
          </Button>
          <Button type="button" variant="ghost" onClick={retakeQuiz}>
            Retake quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="style-quiz-card">
      <div className="quiz-progress">
        <span>
          {step + 1} / {quizQuestions.length}
        </span>
        <div>
          <i style={{ width: `${progress}%` }} />
        </div>
      </div>
      <p className="eyebrow">Style quiz</p>
      <h2>{question.question}</h2>
      <div className="quiz-option-grid">
        {question.options.map((option) => (
          <button
            className={answers[question.id] === option ? "selected" : ""}
            key={option}
            type="button"
            onClick={() => selectAnswer(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="form-actions">
        <Button
          disabled={step === 0}
          type="button"
          variant="secondary"
          onClick={() => setStep((current) => Math.max(0, current - 1))}
        >
          Back
        </Button>
      </div>
    </div>
  );
}

function getSuggestedInvestmentBands(styleName: string) {
  if (styleName === "Resort Outdoor Living") {
    return ["Outdoor Living", "Luxury Outdoor Space"];
  }

  if (
    styleName === "Scandinavian Outdoor Living" ||
    styleName === "Dark Contemporary" ||
    styleName === "Natural Modern Garden"
  ) {
    return ["Garden Refresh", "Signature Transformation"];
  }

  if (styleName === "Mediterranean Escape") {
    return ["Signature Transformation", "Outdoor Living"];
  }

  return ["Garden Refresh", "Signature Transformation", "Outdoor Living"];
}
