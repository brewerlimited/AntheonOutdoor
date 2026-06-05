"use client";

import { useState } from "react";

type BeforeAfterSliderProps = {
  title: string;
  brief: string;
  beforeLabel: string;
  afterLabel: string;
  tone: "courtyard" | "family" | "dark";
};

export function BeforeAfterSlider({
  title,
  brief,
  beforeLabel,
  afterLabel,
  tone,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(52);

  return (
    <article className="transformation-card">
      <div className={`before-after-frame before-after-${tone}`}>
        <div className="before-panel">
          <span>{beforeLabel}</span>
        </div>
        <div className="after-panel" style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
          <span>{afterLabel}</span>
        </div>
        <div className="comparison-line" style={{ left: `${position}%` }}>
          <span />
        </div>
        <input
          aria-label={`Reveal before or after for ${title}`}
          max="100"
          min="0"
          type="range"
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
        />
      </div>
      <div className="transformation-copy">
        <p className="eyebrow">Before / after concept</p>
        <h3>{title}</h3>
        <p>{brief}</p>
      </div>
    </article>
  );
}
