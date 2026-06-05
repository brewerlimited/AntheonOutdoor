"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/Button";
import { investmentBands } from "@/lib/investmentBands";

type InvestmentGuideProps = {
  variant?: "homepage" | "brief" | "quizResult";
  selectedBand?: string;
  onSelectBand?: (value: string) => void;
  compact?: boolean;
  suggestedBands?: string[];
};

export function InvestmentGuide({
  variant = "homepage",
  selectedBand = "",
  onSelectBand,
  compact = false,
  suggestedBands = [],
}: InvestmentGuideProps) {
  const selectable = variant === "brief" && Boolean(onSelectBand);
  const [expandedBand, setExpandedBand] = useState<(typeof investmentBands)[number] | null>(null);

  return (
    <>
      <div className={`investment-guide investment-${variant} ${compact ? "compact" : ""}`}>
        <div className="investment-grid">
          {investmentBands.map((band, index) => {
            const value = `${band.title}: ${band.range}`;
            const selected = selectedBand === value || selectedBand.startsWith(band.title);
            const suggested = suggestedBands.includes(band.title);
            const homepageContent = (
              <>
                <div className="investment-card-heading">
                  <span>{band.title}</span>
                  <strong>{band.range}</strong>
                </div>
                <div
                  aria-label={`${band.title} investment guide example`}
                  className={`investment-image investment-image-${index + 1}`}
                  role="img"
                  style={{ backgroundImage: `url(${band.imageSrc})` }}
                >
                  <button
                    aria-label={`Expand ${band.title} image`}
                    className="image-expand-button"
                    type="button"
                    onClick={() => setExpandedBand(band)}
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                      <path d="M8 3H3v5" />
                      <path d="M3 3l7 7" />
                      <path d="M16 21h5v-5" />
                      <path d="M21 21l-7-7" />
                    </svg>
                  </button>
                  <div className="investment-image-reveal">
                    <p>{band.description}</p>
                    <ul>
                      {band.typicalFeatures.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                    <Button href="/brief" variant="ghost">
                      Start with this level
                    </Button>
                  </div>
                </div>
              </>
            );
            const compactContent = (
              <>
                <div className="investment-card-body">
                  <span>{band.title}</span>
                  <strong>{band.range}</strong>
                  <p>{band.description}</p>
                  <ul>
                    {band.typicalFeatures.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  {suggested ? <em>Commonly suited to your result</em> : null}
                </div>
              </>
            );
            const content = variant === "homepage" ? homepageContent : compactContent;

            if (selectable) {
              return (
                <button
                  className={`investment-card ${selected ? "selected" : ""}`}
                  key={band.title}
                  type="button"
                  onClick={() => onSelectBand?.(value)}
                >
                  {content}
                </button>
              );
            }

            return (
              <article
                className={`investment-card ${selected ? "selected" : ""} ${suggested ? "suggested" : ""}`}
                key={band.title}
              >
                {content}
              </article>
            );
          })}
        </div>
      </div>

      {expandedBand ? (
        <div
          aria-modal="true"
          className="image-lightbox"
          role="dialog"
          onClick={() => setExpandedBand(null)}
        >
          <button
            aria-label="Close expanded image"
            className="image-lightbox-close"
            type="button"
            onClick={() => setExpandedBand(null)}
          >
            Close
          </button>
          <figure onClick={(event) => event.stopPropagation()}>
            <Image
              alt={`${expandedBand.title} investment guide expanded`}
              height={900}
              sizes="94vw"
              src={expandedBand.imageSrc}
              width={1600}
            />
            <figcaption>
              {expandedBand.title} - {expandedBand.range}
            </figcaption>
          </figure>
        </div>
      ) : null}
    </>
  );
}
