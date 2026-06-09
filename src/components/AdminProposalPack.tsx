"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { mockLeads } from "@/data/content";
import { loadLeads, updateLead, uploadProposalImageFiles } from "@/data/storage";
import type {
  GardenBriefLead,
  ProposalImageAsset,
  ProposalImageStatus,
  ProposalStatus,
  ProposalVersionKey,
  VisualAnchorMemory,
} from "@/data/types";
import { calculateBudgetFit } from "@/lib/budgetRules";
import {
  formatCurrency,
  validateConceptAgainstBudget,
  type BudgetRealityResult,
} from "@/lib/costRules";
import { createVersionDesignMemories } from "@/lib/designMemory";
import {
  buildCustomerSummary,
  buildProposalPack,
  proposalChecklistItems,
  type ProposalVersion,
} from "@/lib/proposalBuilder";

const checklistStorageKey = "antheon-proposal-checklists";
const imageStatuses: ProposalImageStatus[] = [
  "Not Started",
  "Generated Manually",
  "Needs Regeneration",
  "Approved",
];

export function AdminProposalPack({ leadId }: { leadId: string }) {
  const [lead, setLead] = useState<GardenBriefLead | null>(null);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let active = true;

    loadLeads().then((storedLeads) => {
      if (!active) {
        return;
      }

      const foundLead = [...storedLeads, ...mockLeads].find((item) => item.id === leadId);
      const hydratedLead = foundLead
        ? withProposalFallback({
            ...foundLead,
            proposalStatus: foundLead.proposalStatus ?? "Draft",
          })
        : null;

      setLead(hydratedLead);
      setNotes(hydratedLead?.proposalReviewNotes ?? "");
      setCheckedItems(loadChecklist(leadId));
    });

    return () => {
      active = false;
    };
  }, [leadId]);

  const proposalPack = useMemo(() => (lead ? buildProposalPack(lead) : null), [lead]);
  const customerSummary = useMemo(
    () => (proposalPack ? buildCustomerSummary(proposalPack) : ""),
    [proposalPack],
  );
  const customerEmail = useMemo(() => (lead ? buildCustomerEmail(lead) : ""), [lead]);

  function toggleChecklist(item: string) {
    const next = checkedItems.includes(item)
      ? checkedItems.filter((checked) => checked !== item)
      : [...checkedItems, item];

    setCheckedItems(next);
    saveChecklist(leadId, next);
  }

  function updateStatus(proposalStatus: ProposalStatus) {
    if (!lead) {
      return;
    }

    const updatedLead = { ...lead, proposalStatus, proposalReviewNotes: notes };
    setLead(updatedLead);
    void updateLead(updatedLead);
  }

  function updateNotes(value: string) {
    setNotes(value);

    if (lead) {
      void updateLead({ ...lead, proposalReviewNotes: value });
    }
  }

  async function copyCustomerSummary() {
    await navigator.clipboard.writeText(customerSummary);
  }

  async function copyCustomerEmail() {
    await navigator.clipboard.writeText(customerEmail);
  }

  function markSent() {
    if (!lead) {
      return;
    }

    const updatedLead: GardenBriefLead = {
      ...lead,
      proposalStatus: "Sent",
      proposalReviewNotes: notes,
      proposalSentAt: new Date().toISOString(),
    };
    setLead(updatedLead);
    void updateLead(updatedLead);
  }

  function updateProposalImage(versionKey: ProposalVersionKey, image: ProposalImageAsset) {
    if (!lead) {
      return;
    }

    const updatedLead: GardenBriefLead = {
      ...lead,
      proposalStatus:
        image.imageStatus === "Approved" || image.approved ? "Images Added" : lead.proposalStatus,
      proposalImages: {
        ...lead.proposalImages,
        [versionKey]: image,
      },
    };
    setLead(updatedLead);
    void updateLead(updatedLead);
  }

  function updateVisualAnchor(versionKey: ProposalVersionKey, anchor: VisualAnchorMemory) {
    if (!lead) {
      return;
    }

    const updatedLead: GardenBriefLead = {
      ...lead,
      proposalStatus: "Images Added",
      visualAnchorMemory: {
        ...lead.visualAnchorMemory,
        [versionKey]: anchor,
      },
    };

    setLead(updatedLead);
    void updateLead(updatedLead);
  }

  if (!lead || !proposalPack) {
    return (
      <section className="section">
        <div className="memory-panel">
          <h2>Proposal not found</h2>
          <p>Submit a garden brief first, or return to the leads overview.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section proposal-admin">
      <div className="proposal-actions">
        <Link className="button button-secondary" href={`/admin/leads/${lead.id}`}>
          Back to Lead
        </Link>
        <button className="button button-secondary" type="button" onClick={() => updateStatus("Reviewed")}>
          Mark Reviewed
        </button>
        <button className="button button-primary" type="button" onClick={() => updateStatus("Approved")}>
          Approve Proposal
        </button>
        <button className="button button-secondary" type="button" onClick={copyCustomerSummary}>
          Copy Customer Summary
        </button>
        <button className="button button-secondary" type="button" onClick={copyCustomerEmail}>
          Copy Customer Email
        </button>
        <button className="button button-secondary" type="button" onClick={markSent}>
          Mark As Sent
        </button>
        <Link className="button button-secondary" href={`/proposal-preview/${lead.id}`}>
          Open Customer Preview
        </Link>
      </div>

      <div className="memory-layout">
        <article className="memory-panel">
          <p className="eyebrow">Brief summary</p>
          <h2>{proposalPack.customerName}</h2>
          <dl>
            <div>
              <dt>Project summary</dt>
              <dd>{proposalPack.projectSummary}</dd>
            </div>
            <div>
              <dt>Style direction</dt>
              <dd>{proposalPack.designStyleSummary}</dd>
            </div>
            <div>
              <dt>Budget fit</dt>
              <dd>{proposalPack.budgetSummary}</dd>
            </div>
            <div>
              <dt>Layout review</dt>
              <dd>{proposalPack.layoutReviewSummary}</dd>
            </div>
            <div>
              <dt>Feature placement notes</dt>
              <dd>{proposalPack.featurePlacementSummary}</dd>
            </div>
            <div>
              <dt>Existing plan</dt>
              <dd>{proposalPack.existingPlanSummary}</dd>
            </div>
            <div>
              <dt>Scale</dt>
              <dd>{proposalPack.scaleSummary}</dd>
            </div>
            <div>
              <dt>Layout concepts</dt>
              <dd>{proposalPack.layoutConceptSummary}</dd>
            </div>
            <div>
              <dt>Final layout</dt>
              <dd>{proposalPack.finalLayoutSummary}</dd>
            </div>
            <div>
              <dt>Masterplan</dt>
              <dd>{proposalPack.masterplanSummary}</dd>
            </div>
            <div>
              <dt>Hero render</dt>
              <dd>{proposalPack.heroRenderSummary}</dd>
            </div>
            <div>
              <dt>Proposal status</dt>
              <dd>{lead.proposalStatus ?? "Proposal Drafted"}</dd>
            </div>
            <div>
              <dt>Sent</dt>
              <dd>{lead.proposalSentAt ? formatDate(lead.proposalSentAt) : "Not sent yet"}</dd>
            </div>
          </dl>
        </article>

        <article className="memory-panel">
          <p className="eyebrow">Photos and memory</p>
          <h3>Design context</h3>
          <dl>
            <div>
              <dt>Photo labels</dt>
              <dd>
                {lead.photos?.length
                  ? lead.photos.map((photo) => photo.label || photo.fileName).join(", ")
                  : "No labelled photos yet"}
              </dd>
            </div>
            <div>
              <dt>Garden layout</dt>
              <dd>
                {lead.gardenSize || "Size unknown"}, {lead.gardenShape || "shape unknown"},{" "}
                {lead.housePosition || "house position unknown"}
              </dd>
            </div>
            <div>
              <dt>Planting colour scheme</dt>
              <dd>{lead.plantingColourScheme || "Not set"}</dd>
            </div>
            <div>
              <dt>Design memory</dt>
              <dd>
                {lead.withinBudgetDesignMemory?.prohibitedDuplicates.length ?? 0} duplicate
                prevention rules prepared
              </dd>
            </div>
          </dl>
        </article>
      </div>

      <div className="proposal-version-grid">
        <ProposalVersionCard
          budgetBand={lead.budgetBand}
          image={lead.proposalImages?.withinBudget}
          leadId={lead.id}
          onImageChange={updateProposalImage}
          onVisualAnchorChange={updateVisualAnchor}
          style={lead.preferredStyle}
          visualAnchor={lead.visualAnchorMemory?.withinBudget}
          version={proposalPack.withinBudget}
          versionKey="withinBudget"
        />
        <ProposalVersionCard
          budgetBand={lead.budgetBand}
          image={lead.proposalImages?.enhancedDesign}
          leadId={lead.id}
          onImageChange={updateProposalImage}
          onVisualAnchorChange={updateVisualAnchor}
          style={lead.preferredStyle}
          visualAnchor={lead.visualAnchorMemory?.enhancedDesign}
          version={proposalPack.enhancedDesign}
          versionKey="enhancedDesign"
        />
        <ProposalVersionCard
          budgetBand={lead.budgetBand}
          image={lead.proposalImages?.dreamVersion}
          leadId={lead.id}
          onImageChange={updateProposalImage}
          onVisualAnchorChange={updateVisualAnchor}
          style={lead.preferredStyle}
          visualAnchor={lead.visualAnchorMemory?.dreamVersion}
          version={proposalPack.dreamVersion}
          versionKey="dreamVersion"
        />
      </div>

      <div className="memory-layout">
        <article className="memory-panel">
          <h3>Internal checklist</h3>
          <div className="review-checklist">
            {proposalChecklistItems.map((item) => (
              <label className="review-check" key={item}>
                <input
                  checked={checkedItems.includes(item)}
                  type="checkbox"
                  onChange={() => toggleChecklist(item)}
                />
                {item}
              </label>
            ))}
          </div>
        </article>

        <article className="memory-panel">
          <h3>Review notes</h3>
          <textarea
            rows={8}
            value={notes}
            onChange={(event) => updateNotes(event.target.value)}
            placeholder="Add internal notes before sending the customer preview."
          />
        </article>
      </div>

      <article className="memory-panel">
        <h3>Copyable customer summary</h3>
        <pre className="customer-summary">{customerSummary}</pre>
      </article>

      <article className="memory-panel">
        <h3>Copyable customer email</h3>
        <pre className="customer-summary">{customerEmail}</pre>
      </article>
    </section>
  );
}

function withProposalFallback(lead: GardenBriefLead): GardenBriefLead {
  const fit = calculateBudgetFit({
    budgetBand: lead.budgetBand,
    gardenSize: lead.gardenSize,
    mustHaves: lead.mustHaves,
    niceToHaves: lead.niceToHaves,
  });
  const withBudget: GardenBriefLead = {
    ...lead,
    approvedMustHaves: lead.approvedMustHaves ?? fit.approvedMustHaves,
    cautionMustHaves: lead.cautionMustHaves ?? fit.cautionMustHaves,
    excludedMustHaves: lead.excludedMustHaves ?? fit.excludedMustHaves,
    approvedNiceToHaves: lead.approvedNiceToHaves ?? fit.approvedNiceToHaves,
    excludedNiceToHaves: lead.excludedNiceToHaves ?? fit.excludedNiceToHaves,
    withinBudgetFeatures: lead.withinBudgetFeatures ?? fit.withinBudgetFeatures,
    enhancedDesignFeatures: lead.enhancedDesignFeatures ?? fit.enhancedDesignFeatures,
    dreamVersionFeatures: lead.dreamVersionFeatures ?? fit.dreamVersionFeatures,
    budgetGuidance: lead.budgetGuidance ?? fit.budgetGuidance,
    budgetPressure: lead.budgetPressure ?? fit.estimatedBudgetPressure,
  };
  const memories = createVersionDesignMemories(withBudget);

  return {
    ...withBudget,
    withinBudgetDesignMemory: withBudget.withinBudgetDesignMemory?.plantingPalette
      ? withBudget.withinBudgetDesignMemory
      : memories.withinBudgetDesignMemory,
    enhancedDesignMemory: withBudget.enhancedDesignMemory?.plantingPalette
      ? withBudget.enhancedDesignMemory
      : memories.enhancedDesignMemory,
    dreamDesignMemory: withBudget.dreamDesignMemory?.plantingPalette
      ? withBudget.dreamDesignMemory
      : memories.dreamDesignMemory,
    designMemory: withBudget.designMemory?.plantingPalette
      ? withBudget.designMemory
      : memories.withinBudgetDesignMemory,
  };
}

function ProposalVersionCard({
  version,
  versionKey,
  budgetBand,
  style,
  image,
  leadId,
  onImageChange,
  onVisualAnchorChange,
  visualAnchor,
}: {
  version: ProposalVersion;
  versionKey: ProposalVersionKey;
  budgetBand: string;
  style: string;
  image?: ProposalImageAsset;
  leadId: string;
  onImageChange: (versionKey: ProposalVersionKey, image: ProposalImageAsset) => void;
  onVisualAnchorChange: (versionKey: ProposalVersionKey, anchor: VisualAnchorMemory) => void;
  visualAnchor?: VisualAnchorMemory;
}) {
  const currentImage = image ?? {
    imageNotes: "",
    imageStatus: "Not Started" as ProposalImageStatus,
    approved: false,
  };
  const budgetReality = validateConceptAgainstBudget(
    { features: version.includedFeatures, style },
    budgetBand,
  );

  async function uploadImages(files: FileList | null | undefined) {
    const fileList = Array.from(files ?? []);

    if (!fileList.length) {
      return;
    }

    const nextImage = await uploadProposalImageFiles({
      leadId,
      versionKey,
      files: fileList,
      currentImage,
    });

    onImageChange(versionKey, nextImage);
  }

  return (
    <article className="proposal-version-card">
      <p className="eyebrow">{version.investmentLevel}</p>
      <h3>{version.title}</h3>
      <ImageUploadBox
        image={currentImage}
        onApprovedChange={(approved) =>
          onImageChange(versionKey, {
            ...currentImage,
            approved,
            imageStatus: approved ? "Approved" : currentImage.imageStatus,
          })
        }
        onNotesChange={(imageNotes) =>
          onImageChange(versionKey, { ...currentImage, imageNotes })
        }
        onStatusChange={(imageStatus) =>
          onImageChange(versionKey, {
            ...currentImage,
            imageStatus,
            approved: imageStatus === "Approved" ? true : currentImage.approved,
          })
        }
        onSelectImage={(selectedImage) =>
          onImageChange(versionKey, {
            ...currentImage,
            fileName: selectedImage.fileName,
            imageUrl: selectedImage.imageUrl,
            previewUrl: selectedImage.previewUrl,
          })
        }
        onUpload={uploadImages}
      />
      <VisualAnchorPanel
        anchor={visualAnchor}
        image={currentImage}
        onAnchorChange={(anchor) => onVisualAnchorChange(versionKey, anchor)}
        version={version}
        versionKey={versionKey}
      />
      <BudgetRealityPanel budgetBand={budgetBand} result={budgetReality} />
      <p>{version.customerFriendlyDescription}</p>
      <dl>
        <div>
          <dt>Design intent</dt>
          <dd>{version.designIntent}</dd>
        </div>
        <div>
          <dt>Included features</dt>
          <dd>{formatList(version.includedFeatures)}</dd>
        </div>
        <div>
          <dt>Reserved features</dt>
          <dd>{formatList(version.reservedFeatures)}</dd>
        </div>
        <div>
          <dt>Budget notes</dt>
          <dd>{version.budgetNotes}</dd>
        </div>
        <div>
          <dt>Prompt-ready summary</dt>
          <dd>{version.promptReadySummary}</dd>
        </div>
      </dl>
    </article>
  );
}

function VisualAnchorPanel({
  anchor,
  image,
  onAnchorChange,
  version,
  versionKey,
}: {
  anchor?: VisualAnchorMemory;
  image: ProposalImageAsset;
  onAnchorChange: (anchor: VisualAnchorMemory) => void;
  version: ProposalVersion;
  versionKey: ProposalVersionKey;
}) {
  const selectedImageUrl = image.previewUrl ?? image.imageUrl;
  const defaultNotes = buildDefaultAnchorNotes(version);
  const placementNotes = anchor?.placementNotes ?? defaultNotes;

  function saveAnchor(nextNotes = placementNotes) {
    onAnchorChange({
      versionKey,
      versionTitle: version.title,
      imageId: image.id,
      imageFileName: image.fileName,
      imageUrl: image.imageUrl,
      previewUrl: image.previewUrl,
      placementNotes: nextNotes,
      approvedAt: anchor?.approvedAt ?? new Date().toISOString(),
    });
  }

  return (
    <aside className={`visual-anchor-panel ${anchor ? "is-locked" : ""}`}>
      <div>
        <p className="eyebrow">Visual anchor</p>
        <h4>{anchor ? "Approved placement lock" : "Lock the first good image"}</h4>
        <p>
          Use one approved concept image as the placement reference for every
          later Gemini view in this proposal version.
        </p>
      </div>
      {anchor ? (
        <p className="anchor-status">
          Locked from {anchor.imageFileName || "selected concept image"} on{" "}
          {formatDate(anchor.approvedAt)}.
        </p>
      ) : null}
      <label>
        Anchor placement notes
        <textarea
          disabled={!selectedImageUrl}
          rows={5}
          value={placementNotes}
          onChange={(event) => saveAnchor(event.target.value)}
          placeholder="Describe exactly where the pergola, seating, lawn, planters and key features are locked."
        />
      </label>
      <button
        className="button button-secondary"
        disabled={!selectedImageUrl}
        type="button"
        onClick={() => saveAnchor()}
      >
        {anchor ? "Update visual anchor" : "Use selected image as anchor"}
      </button>
    </aside>
  );
}

function buildDefaultAnchorNotes(version: ProposalVersion) {
  const placements = Object.entries(version.featurePlacements ?? {});

  if (!placements.length) {
    return "Use the approved concept image as the visual source of truth. Keep major features in the same positions across all later views. If a feature is outside a camera angle, omit it from that view rather than moving or duplicating it.";
  }

  return [
    "Use the approved concept image as the visual source of truth for this proposal version.",
    ...placements.map(([feature, placement]) => `${feature}: locked to ${placement}.`),
    "Do not move or duplicate these features in later generated views.",
    "If a locked feature is outside a camera angle, omit it from that view rather than relocating it.",
  ].join("\n");
}

function BudgetRealityPanel({
  budgetBand,
  result,
}: {
  budgetBand: string;
  result: BudgetRealityResult;
}) {
  const hasFail =
    result.budgetStatus === "Impossible For Budget" ||
    result.budgetStatus === "Likely Over Budget" ||
    result.blockedFeatures.length > 0;

  return (
    <aside className="budget-reality-panel">
      <div className="budget-reality-header">
        <div>
          <p className="eyebrow">Budget reality</p>
          <h4>{budgetBand || "Investment level to be confirmed"}</h4>
        </div>
        <span className={`status-badge reality-${slugStatus(result.budgetStatus)}`}>
          {result.budgetStatus}
        </span>
      </div>
      <dl>
        <div>
          <dt>Estimated typical cost</dt>
          <dd>{formatCurrency(result.estimatedTypical)}</dd>
        </div>
        <div>
          <dt>Blocked features</dt>
          <dd>{formatList(result.blockedFeatures)}</dd>
        </div>
        <div>
          <dt>Caution features</dt>
          <dd>{formatList(result.cautionFeatures)}</dd>
        </div>
        <div>
          <dt>Suggested correction</dt>
          <dd>{result.suggestedCorrection}</dd>
        </div>
      </dl>
      {hasFail ? (
        <p className="concept-fail-warning">
          Concept likely exceeds selected budget — regenerate or move to Dream Version.
        </p>
      ) : null}
      <ul className="feature-list">
        {result.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </aside>
  );
}

function ImageUploadBox({
  image,
  onApprovedChange,
  onNotesChange,
  onSelectImage,
  onStatusChange,
  onUpload,
}: {
  image: ProposalImageAsset;
  onApprovedChange: (approved: boolean) => void;
  onNotesChange: (notes: string) => void;
  onSelectImage: (image: ProposalImageAsset) => void;
  onStatusChange: (status: ProposalImageStatus) => void;
  onUpload: (files: FileList | null | undefined) => void;
}) {
  const gallery = getImageGallery(image);
  const selectedUrl = image.previewUrl ?? image.imageUrl;
  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);
  const selectedIndex = Math.max(
    0,
    gallery.findIndex((galleryImage) => {
      const imageUrl = galleryImage.previewUrl ?? galleryImage.imageUrl;
      return imageUrl === selectedUrl;
    }),
  );

  function selectGalleryImage(index: number) {
    const nextImage = gallery[index];

    if (nextImage) {
      onSelectImage(nextImage);
    }
  }

  return (
    <>
      <div className="image-upload-box">
        <p>
          Generate concept visuals manually using the prepared prompt, then upload
          the selected image here for review.
        </p>
        {selectedUrl ? (
          <div className="admin-image-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedUrl} alt="" />
            <button
              aria-label="Expand concept image"
              className="image-expand-button"
              type="button"
              onClick={() => setExpandedImageUrl(selectedUrl)}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M8 3H3v5" />
                <path d="M3 3l7 7" />
                <path d="M16 21h5v-5" />
                <path d="M21 21l-7-7" />
              </svg>
            </button>
            {gallery.length > 1 ? (
              <div className="proposal-gallery-controls admin">
                <button
                  type="button"
                  onClick={() =>
                    selectGalleryImage(selectedIndex === 0 ? gallery.length - 1 : selectedIndex - 1)
                  }
                >
                  Previous
                </button>
                <span>
                  {selectedIndex + 1} / {gallery.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    selectGalleryImage(selectedIndex === gallery.length - 1 ? 0 : selectedIndex + 1)
                  }
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="proposal-image-placeholder">Visual direction to be added after review.</div>
        )}
        <label>
          Add concept images
          <input
            accept="image/*"
            multiple
            type="file"
            onChange={(event) => {
              onUpload(event.currentTarget.files);
              event.currentTarget.value = "";
            }}
          />
        </label>
        <label>
          Image status
          <select
            value={image.imageStatus}
            onChange={(event) => onStatusChange(event.target.value as ProposalImageStatus)}
          >
            {imageStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
        <label>
          Image notes
          <textarea
            rows={3}
            value={image.imageNotes}
            onChange={(event) => onNotesChange(event.target.value)}
            placeholder="Add notes for manual regeneration or approval."
          />
        </label>
        <label className="review-check">
          <input
            checked={image.approved}
            type="checkbox"
            onChange={(event) => onApprovedChange(event.target.checked)}
          />
          Approved concept visual
        </label>
      </div>

      {expandedImageUrl ? (
        <div
          aria-modal="true"
          className="image-lightbox"
          role="dialog"
          onClick={() => setExpandedImageUrl(null)}
        >
          <button
            aria-label="Close expanded image"
            className="image-lightbox-close"
            type="button"
            onClick={() => setExpandedImageUrl(null)}
          >
            Close
          </button>
          <figure onClick={(event) => event.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={expandedImageUrl} alt="Expanded proposal concept" />
            <figcaption>Proposal concept image</figcaption>
          </figure>
        </div>
      ) : null}
    </>
  );
}

function getImageGallery(image?: ProposalImageAsset) {
  if (!image) {
    return [];
  }

  if (image.images?.length) {
    return image.images;
  }

  if (image.imageUrl || image.previewUrl) {
    return [
      {
        id: image.id ?? "primary-image",
        fileName: image.fileName,
        imageUrl: image.imageUrl,
        previewUrl: image.previewUrl,
        caption: image.caption,
        imageNotes: image.imageNotes,
        imageStatus: image.imageStatus,
        approved: image.approved,
      },
    ];
  }

  return [];
}

function loadChecklist(leadId: string) {
  try {
    const stored = window.localStorage.getItem(checklistStorageKey);
    const allChecklists = stored ? (JSON.parse(stored) as Record<string, string[]>) : {};

    return allChecklists[leadId] ?? [];
  } catch {
    return [];
  }
}

function saveChecklist(leadId: string, checkedItems: string[]) {
  const stored = window.localStorage.getItem(checklistStorageKey);
  const allChecklists = stored ? (JSON.parse(stored) as Record<string, string[]>) : {};

  window.localStorage.setItem(
    checklistStorageKey,
    JSON.stringify({ ...allChecklists, [leadId]: checkedItems }),
  );
}

function formatList(items: string[]) {
  return items.length ? items.join(", ") : "None specified";
}

function slugStatus(status: string) {
  return status.toLowerCase().replaceAll(" ", "-");
}

function buildCustomerEmail(lead: GardenBriefLead) {
  const previewLink =
    typeof window === "undefined"
      ? `/proposal-preview/${lead.id}`
      : `${window.location.origin}/proposal-preview/${lead.id}`;

  return `Subject: Your Anthēon Outdoor Garden Design Direction

Hi ${lead.fullName || "there"},

Thank you for completing your Anthēon Outdoor garden brief.

We’ve reviewed your space, photos, ideas and preferred investment level.

Based on what you shared, we’ve prepared three early design directions:

1. Within Budget — a focused version built around your key must-haves.
2. Enhanced Design — a more complete outdoor living scheme with selected upgrades.
3. Dream Version — the full aspirational version, which may exceed your selected investment level.

You can review the proposal direction here:

${previewLink}

This is an early design direction only. Final scope, specification and pricing are subject to consultation, survey and formal quotation.

We’ll talk through the direction with you and refine the proposal before anything moves forward.

Kind regards,
Anthēon Outdoor`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
