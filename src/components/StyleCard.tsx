"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "./Button";

type StyleCardProps = {
  title: string;
  description: string;
  features: string;
  budget: string;
  tone: string;
  imageSrc?: string;
  expandable?: boolean;
};

export function StyleCard({
  title,
  description,
  features,
  budget,
  tone,
  imageSrc,
  expandable = false,
}: StyleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <article className="style-card">
        <div className={`style-visual style-${tone}`}>
          {imageSrc ? (
            <Image
              alt={`${title} garden concept`}
              fill
              sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
              src={imageSrc}
            />
          ) : null}
          {imageSrc && expandable ? (
            <button
              aria-label={`Expand ${title} image`}
              className="image-expand-button"
              type="button"
              onClick={() => setIsExpanded(true)}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M8 3H3v5" />
                <path d="M3 3l7 7" />
                <path d="M16 21h5v-5" />
                <path d="M21 21l-7-7" />
              </svg>
            </button>
          ) : null}
        </div>
        <div className="style-body">
          <h3>{title}</h3>
          <p>{description}</p>
          <dl>
            <div>
              <dt>Ideal features</dt>
              <dd>{features}</dd>
            </div>
            <div>
              <dt>Typical budget level</dt>
              <dd>{budget}</dd>
            </div>
          </dl>
          <Button href="/brief" variant="ghost">
            Start brief
          </Button>
        </div>
      </article>

      {imageSrc && isExpanded ? (
        <div
          aria-modal="true"
          className="image-lightbox"
          role="dialog"
          onClick={() => setIsExpanded(false)}
        >
          <button
            aria-label="Close expanded image"
            className="image-lightbox-close"
            type="button"
            onClick={() => setIsExpanded(false)}
          >
            Close
          </button>
          <figure onClick={(event) => event.stopPropagation()}>
            <Image
              alt={`${title} garden concept expanded`}
              height={900}
              sizes="94vw"
              src={imageSrc}
              width={1600}
            />
            <figcaption>{title}</figcaption>
          </figure>
        </div>
      ) : null}
    </>
  );
}
