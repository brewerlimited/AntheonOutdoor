"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { mockLeads } from "@/data/content";
import { loadLeads } from "@/data/storage";
import type { GardenBriefLead, ProposalImageAsset } from "@/data/types";
import { buildProposalPack, type ProposalVersion } from "@/lib/proposalBuilder";
import { Button } from "./Button";

export function ProposalPreview({ leadId }: { leadId: string }) {
  const [lead, setLead] = useState<GardenBriefLead | null>(null);

  useEffect(() => {
    let active = true;

    loadLeads().then((storedLeads) => {
      if (active) {
        setLead([...storedLeads, ...mockLeads].find((item) => item.id === leadId) ?? null);
      }
    });

    return () => {
      active = false;
    };
  }, [leadId]);

  const proposalPack = useMemo(() => (lead ? buildProposalPack(lead) : null), [lead]);

  if (!proposalPack) {
    return (
      <main>
        <section className="page-hero compact">
          <p className="eyebrow">Proposal preview</p>
          <h1>Proposal not found.</h1>
          <p>This preview becomes available once a garden brief has been prepared.</p>
          <Button href="/brief">Start a Garden Brief</Button>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="proposal-preview-hero">
        <Link className="brand" href="/">
          <Image
            alt=""
            aria-hidden="true"
            className="brand-mark"
            height={44}
            src="/images/brand/antheon-monogram.png"
            width={44}
          />
          <span>
            <strong>Anthēon</strong>
            <small>Outdoor</small>
          </span>
        </Link>
        <p className="eyebrow">Early concept proposal</p>
        <h1>{proposalPack.customerName}, your garden design direction.</h1>
        <p>{proposalPack.projectSummary}</p>
      </section>

      <section className="section">
        <div className="memory-layout">
          <article className="memory-panel">
            <p className="eyebrow">Visual direction</p>
            <h2>{proposalPack.designStyleSummary}</h2>
          </article>
          <article className="memory-panel">
            <p className="eyebrow">Investment level</p>
            <p>{proposalPack.budgetSummary}</p>
          </article>
        </div>

        <div className="proposal-version-grid customer">
          <CustomerProposalCard
            image={lead?.proposalImages?.withinBudget}
            version={proposalPack.withinBudget}
          />
          <CustomerProposalCard
            image={lead?.proposalImages?.enhancedDesign}
            version={proposalPack.enhancedDesign}
          />
          <CustomerProposalCard
            image={lead?.proposalImages?.dreamVersion}
            version={proposalPack.dreamVersion}
          />
        </div>

        <article className="final-cta proposal-disclaimer">
          <p className="eyebrow">Next steps</p>
          <h2>Review, refine, then move toward a clearer scope.</h2>
          <ul className="feature-list">
            {proposalPack.nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
          <p>
            This is an early design direction only. Final scope, specification
            and pricing are subject to consultation, survey and formal quotation.
          </p>
        </article>
      </section>
    </main>
  );
}

function CustomerProposalCard({
  version,
  image,
}: {
  version: ProposalVersion;
  image?: ProposalImageAsset;
}) {
  const gallery = getImageGallery(image);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = gallery[activeIndex] ?? gallery[0];
  const activeImageUrl = activeImage?.previewUrl ?? activeImage?.imageUrl;

  return (
    <article className="proposal-version-card customer">
      <p className="eyebrow">{version.investmentLevel}</p>
      <h3>{version.title}</h3>
      {activeImageUrl ? (
        <div className="proposal-gallery">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="proposal-customer-image" src={activeImageUrl} alt="" />
          {gallery.length > 1 ? (
            <div className="proposal-gallery-controls">
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((current) =>
                    current === 0 ? gallery.length - 1 : current - 1,
                  )
                }
              >
                Previous
              </button>
              <span>
                {activeIndex + 1} / {gallery.length}
              </span>
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((current) =>
                    current === gallery.length - 1 ? 0 : current + 1,
                  )
                }
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="proposal-image-placeholder customer">
          Visual direction to be added after review.
        </div>
      )}
      <p>{version.customerFriendlyDescription}</p>
      <dl>
        <div>
          <dt>Included in this direction</dt>
          <dd>{formatList(version.includedFeatures)}</dd>
        </div>
        <div>
          <dt>Reserved for later refinement</dt>
          <dd>{formatList(version.reservedFeatures)}</dd>
        </div>
        <div>
          <dt>Budget note</dt>
          <dd>{version.budgetNotes}</dd>
        </div>
      </dl>
    </article>
  );
}

function formatList(items: string[]) {
  return items.length ? items.join(", ") : "None specified";
}

function getImageGallery(image?: ProposalImageAsset) {
  if (!image) {
    return [];
  }

  if (image.images?.length) {
    return image.images;
  }

  if (image.imageUrl || image.previewUrl) {
    return [image];
  }

  return [];
}
