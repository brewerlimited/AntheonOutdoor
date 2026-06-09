"use client";

import { useEffect, useMemo, useState } from "react";
import { mockLeads } from "@/data/content";
import { loadLeads, updateLead } from "@/data/storage";
import type { GardenBriefLead, ProposalVersionKey, VisualAnchorMemory } from "@/data/types";
import { calculateBudgetFit } from "@/lib/budgetRules";
import { formatCurrency, validateConceptAgainstBudget } from "@/lib/costRules";
import {
  createVersionDesignMemories,
  type DesignMemory,
  type DesignVersion,
  placementOptions,
} from "@/lib/designMemory";
import { buildGardenImagePrompt } from "@/lib/prompts/gardenImagePrompt";

const designVersions: DesignVersion[] = ["Within Budget", "Enhanced Design", "Dream Version"];

export function AdminLeadDetail({ leadId }: { leadId: string }) {
  const [lead, setLead] = useState<GardenBriefLead | null>(null);
  const [designVersion, setDesignVersion] = useState<DesignVersion>("Within Budget");
  const [selectedPhotoId, setSelectedPhotoId] = useState("");

  useEffect(() => {
    let active = true;

    loadLeads().then((storedLeads) => {
      if (!active) {
        return;
      }

      const foundLead = [...storedLeads, ...mockLeads].find((item) => item.id === leadId);
      setLead(foundLead ? withDesignFallback(foundLead) : null);
    });

    return () => {
      active = false;
    };
  }, [leadId]);

  const selectedMemory = useMemo(() => {
    if (!lead) {
      return null;
    }

    return getMemoryForVersion(lead, designVersion);
  }, [lead, designVersion]);

  const selectedPhoto = useMemo(() => {
    if (!lead?.photos?.length || !selectedPhotoId) {
      return null;
    }

    return lead.photos.find((photo) => photo.id === selectedPhotoId) ?? null;
  }, [lead, selectedPhotoId]);

  const prompt = useMemo(() => {
    if (!lead || !selectedMemory) {
      return "";
    }

    const selectedPhotoLabel = selectedPhoto?.label || selectedPhoto?.fileName || selectedPhotoId;

    return buildGardenImagePrompt({
      designVersion,
      budgetBand: lead.budgetBand,
      approvedFeatures: selectedMemory.versionFeatures,
      cautionFeatures: (lead.cautionMustHaves ?? []).filter((feature) =>
        selectedMemory.versionFeatures.includes(feature),
      ),
      excludedFeatures: getExcludedForVersion(lead, selectedMemory.versionFeatures),
      style: lead.preferredStyle,
      customerNotes: lead.notes,
      designMemory: selectedMemory,
      photoLabel: selectedPhotoLabel,
      currentPhoto: selectedPhoto,
      visualAnchor: lead.visualAnchorMemory?.[getVersionKey(designVersion)] ?? null,
      aiViewGuardrails: lead.aiViewGuardrails,
    });
  }, [designVersion, lead, selectedMemory, selectedPhoto, selectedPhotoId]);

  const gardenMappingPrompt = useMemo(() => {
    if (!lead || !selectedMemory) {
      return "";
    }

    return buildGardenMappingPrompt(
      lead,
      selectedMemory,
      designVersion,
      lead.visualAnchorMemory?.[getVersionKey(designVersion)] ?? null,
    );
  }, [designVersion, lead, selectedMemory]);

  const manualProductionBrief = useMemo(() => {
    if (!lead || !selectedMemory) {
      return "";
    }

    return buildManualProductionBrief({
      designVersion,
      lead,
      memory: selectedMemory,
      photo: selectedPhoto,
      visualAnchor: lead.visualAnchorMemory?.[getVersionKey(designVersion)] ?? null,
    });
  }, [designVersion, lead, selectedMemory, selectedPhoto]);

  function updateAiViewGuardrails(value: string) {
    if (!lead) {
      return;
    }

    const updatedLead: GardenBriefLead = {
      ...lead,
      aiViewGuardrails: value,
    };

    setLead(updatedLead);
    void updateLead(updatedLead);
  }

  function updatePlacement(feature: string, placement: string) {
    if (!lead || !selectedMemory) {
      return;
    }

    const updatedMemory: DesignMemory = {
      ...selectedMemory,
      lockedFeaturePlacements: {
        ...selectedMemory.lockedFeaturePlacements,
        [feature]: placement,
      },
    };
    const updatedLead = setMemoryForVersion(lead, designVersion, updatedMemory);

    setLead(updatedLead);
    void updateLead(updatedLead);
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
  }

  async function copyGardenMappingPrompt() {
    await navigator.clipboard.writeText(gardenMappingPrompt);
  }

  async function copyManualProductionBrief() {
    await navigator.clipboard.writeText(manualProductionBrief);
  }

  async function downloadPhoto(photo: NonNullable<GardenBriefLead["photos"]>[number]) {
    const url = getPhotoUrl(photo);

    if (!url) {
      return;
    }

    await downloadUrl(url, buildPhotoDownloadName(photo));
  }

  async function downloadAllPhotos() {
    const photos = lead?.photos ?? [];

    for (const photo of photos) {
      await downloadPhoto(photo);
    }
  }

  if (!lead || !selectedMemory) {
    return (
      <section className="section">
        <div className="brief-form">
          <h2>Lead not found</h2>
          <p>Submit a garden brief first, or return to the leads overview.</p>
        </div>
      </section>
    );
  }

  const photoOptions = lead.photos?.length
    ? lead.photos.map((photo) => photo.label || photo.fileName)
    : ["View from house looking into garden"];

  return (
    <section className="section admin-detail">
      <div className="admin-toolbar">
        <div>
          <p className="eyebrow">Lead detail</p>
          <h2>{lead.fullName}</h2>
        </div>
        <p>{lead.status}</p>
      </div>

      <article className="memory-panel gemini-prep-panel">
        <div className="photo-download-header">
          <div>
            <p className="eyebrow">Gemini prep workflow</p>
            <h3>Map the whole garden before generating views</h3>
            <p>
              Upload every labelled client photo into one Gemini conversation first,
              then paste this master mapping prompt. Use the per-view prompt below
              only after Gemini has understood the garden as one connected space.
              Once one concept is approved, lock it as the visual anchor in the
              proposal pack before generating the remaining views.
            </p>
          </div>
          <div className="gemini-prep-actions">
            {lead.photos?.length ? (
              <button className="button button-secondary" type="button" onClick={downloadAllPhotos}>
                Download labelled photos
              </button>
            ) : null}
            <button className="button button-secondary" type="button" onClick={copyGardenMappingPrompt}>
              Copy mapping prompt
            </button>
          </div>
        </div>
        <ol className="gemini-workflow-list">
          <li>Download the labelled garden photos from this lead.</li>
          <li>Upload all views to Gemini in the same conversation.</li>
          <li>Paste the mapping prompt so Gemini identifies boundaries, house position and camera angles.</li>
          <li>Approve one strong concept as the visual anchor, then generate each remaining view below.</li>
        </ol>
        <pre className="prompt-preview prompt-preview-compact">{gardenMappingPrompt}</pre>
      </article>

      <article className="memory-panel ai-guardrail-panel">
        <p className="eyebrow">AI view guardrails</p>
        <h3>Protect open sides and circulation routes</h3>
        <p>
          Add corrections Gemini must respect before generating more views. Use
          this for issues such as open sides being mistaken for boundaries.
        </p>
        <textarea
          rows={4}
          value={lead.aiViewGuardrails ?? ""}
          onChange={(event) => updateAiViewGuardrails(event.target.value)}
          placeholder="Example: In the view looking back to the house, the right side of the image is open house-side access/circulation, not a boundary. Do not close it with fencing, raised planters or screening."
        />
      </article>

      <article className="memory-panel manual-production-panel">
        <div className="photo-download-header">
          <div>
            <p className="eyebrow">Manual AI production brief</p>
            <h3>Use this for Firefly/manual edits</h3>
            <p>
              A shorter, practical checklist for manually editing one client
              image at a time. This keeps Jack in control instead of asking AI
              to solve the full garden design in one pass.
            </p>
          </div>
          <button className="button button-secondary" type="button" onClick={copyManualProductionBrief}>
            Copy production brief
          </button>
        </div>
        <div className="field-grid manual-production-controls">
          <label>
            Proposal version
            <select
              value={designVersion}
              onChange={(event) => setDesignVersion(event.target.value as DesignVersion)}
            >
              {designVersions.map((version) => (
                <option key={version}>{version}</option>
              ))}
            </select>
          </label>
          <label>
            Source photo
            <select value={selectedPhotoId} onChange={(event) => setSelectedPhotoId(event.target.value)}>
              <option value="">Select a photo view</option>
              {lead.photos?.length
                ? lead.photos.map((photo) => (
                    <option key={photo.id} value={photo.id}>
                      {photo.label || photo.fileName}
                    </option>
                  ))
                : photoOptions.map((label) => <option key={label}>{label}</option>)}
            </select>
          </label>
        </div>
        <pre className="customer-summary manual-production-brief">{manualProductionBrief}</pre>
      </article>

      <div className="memory-layout">
        <article className="memory-panel">
          <h3>Design Memory</h3>
          <p>
            Version-specific placement maps keep each visual concept consistent
            across multiple uploaded garden views.
          </p>
          <dl>
            <div>
              <dt>Garden size</dt>
              <dd>{selectedMemory.gardenSize}</dd>
            </div>
            <div>
              <dt>Garden shape</dt>
              <dd>{selectedMemory.gardenShape}</dd>
            </div>
            <div>
              <dt>House position</dt>
              <dd>{selectedMemory.housePosition}</dd>
            </div>
            <div>
              <dt>Existing features</dt>
              <dd>{formatList(selectedMemory.existingFeatures)}</dd>
            </div>
            <div>
              <dt>Planting maintenance</dt>
              <dd>{selectedMemory.plantingMaintenance}</dd>
            </div>
            <div>
              <dt>Planting colour scheme</dt>
              <dd>{selectedMemory.plantingColourScheme}</dd>
            </div>
            {lead.styleQuizResult ? (
              <div>
                <dt>Style quiz result</dt>
                <dd>{lead.styleQuizResult.styleName}</dd>
              </div>
            ) : null}
            <div>
              <dt>Planting palette</dt>
              <dd>{selectedMemory.plantingPalette.paletteSummary}</dd>
            </div>
            <div>
              <dt>Preferred plants</dt>
              <dd>{formatList(selectedMemory.plantingPalette.preferredPlants)}</dd>
            </div>
            <div>
              <dt>Photo labels</dt>
              <dd>{formatList(photoOptions)}</dd>
            </div>
            <div>
              <dt>Version-specific features</dt>
              <dd>{formatList(selectedMemory.versionFeatures)}</dd>
            </div>
            <div>
              <dt>Approved visual anchor</dt>
              <dd>
                {lead.visualAnchorMemory?.[getVersionKey(designVersion)]?.imageFileName ??
                  "No anchor locked for this proposal version yet"}
              </dd>
            </div>
          </dl>
        </article>

        <article className="memory-panel">
          <h3>Prompt Preview</h3>
          <div className="field-grid">
            <label>
              Design version
              <select
                value={designVersion}
                onChange={(event) => setDesignVersion(event.target.value as DesignVersion)}
              >
                {designVersions.map((version) => (
                  <option key={version}>{version}</option>
                ))}
              </select>
            </label>
            <label>
              Photo label / view
              <select value={selectedPhotoId} onChange={(event) => setSelectedPhotoId(event.target.value)}>
                <option value="">Select a photo view</option>
                {lead.photos?.length
                  ? lead.photos.map((photo) => (
                      <option key={photo.id} value={photo.id}>
                        {photo.label || photo.fileName}
                      </option>
                    ))
                  : photoOptions.map((label) => <option key={label}>{label}</option>)}
              </select>
            </label>
          </div>
          <div className="button-row">
            <button className="button button-secondary" type="button" onClick={copyPrompt}>
              Copy Gemini prompt
            </button>
          </div>
          <pre className="prompt-preview">{prompt}</pre>
        </article>
      </div>

      <article className="memory-panel">
        <div className="photo-download-header">
          <div>
            <h3>Client photos</h3>
            <p>
              Download labelled garden images for Gemini. Filenames use the
              photo label followed by the photo ID.
            </p>
          </div>
          {lead.photos?.length ? (
            <button className="button button-secondary" type="button" onClick={downloadAllPhotos}>
              Download all photos
            </button>
          ) : null}
        </div>
        {lead.photos?.length ? (
          <div className="admin-photo-grid">
            {lead.photos.map((photo) => {
              const photoUrl = getPhotoUrl(photo);

              return (
                <article className="admin-photo-card" key={photo.id}>
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoUrl} alt={photo.label || photo.fileName} />
                  ) : (
                    <div className="proposal-image-placeholder">No preview available.</div>
                  )}
                  <div>
                    <h4>{photo.label || "Unlabelled garden view"}</h4>
                    <dl>
                      <div>
                        <dt>Download name</dt>
                        <dd>{buildPhotoDownloadName(photo)}</dd>
                      </div>
                      <div>
                        <dt>Original file</dt>
                        <dd>{photo.fileName}</dd>
                      </div>
                      <div>
                        <dt>Notes</dt>
                        <dd>{photo.notes || "No notes added."}</dd>
                      </div>
                    </dl>
                    <button
                      className="button button-secondary"
                      disabled={!photoUrl}
                      type="button"
                      onClick={() => downloadPhoto(photo)}
                    >
                      Download photo
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p>No client photos have been uploaded for this lead yet.</p>
        )}
      </article>

      <article className="memory-panel">
        <h3>Locked feature placements</h3>
        <div className="placement-grid">
          {Object.entries(selectedMemory.lockedFeaturePlacements).map(([feature, placement]) => (
            <label key={feature}>
              <span>{feature}</span>
              <select value={placement} onChange={(event) => updatePlacement(feature, event.target.value)}>
                <option>{placement}</option>
                {placementOptions
                  .filter((option) => option !== placement)
                  .map((option) => (
                    <option key={option}>{option}</option>
                  ))}
              </select>
            </label>
          ))}
        </div>
      </article>

      <article className="memory-panel">
        <h3>Prohibited duplicate rules</h3>
        <ul className="feature-list">
          {selectedMemory.prohibitedDuplicates.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}

function withDesignFallback(lead: GardenBriefLead): GardenBriefLead {
  const fit = calculateBudgetFit({
    budgetBand: lead.budgetBand,
    gardenSize: lead.gardenSize,
    mustHaves: lead.mustHaves ?? [],
    niceToHaves: lead.niceToHaves ?? [],
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

function getMemoryForVersion(lead: GardenBriefLead, designVersion: DesignVersion) {
  if (designVersion === "Enhanced Design") {
    return lead.enhancedDesignMemory ?? null;
  }

  if (designVersion === "Dream Version") {
    return lead.dreamDesignMemory ?? null;
  }

  return lead.withinBudgetDesignMemory ?? null;
}

function setMemoryForVersion(
  lead: GardenBriefLead,
  designVersion: DesignVersion,
  designMemory: DesignMemory,
) {
  if (designVersion === "Enhanced Design") {
    return { ...lead, enhancedDesignMemory: designMemory };
  }

  if (designVersion === "Dream Version") {
    return { ...lead, dreamDesignMemory: designMemory };
  }

  return { ...lead, withinBudgetDesignMemory: designMemory, designMemory };
}

function getExcludedForVersion(lead: GardenBriefLead, versionFeatures: string[]) {
  const requestedFeatures = lead.dreamVersionFeatures ?? [...lead.mustHaves, ...lead.niceToHaves];

  return requestedFeatures.filter((feature) => !versionFeatures.includes(feature));
}

function buildManualProductionBrief({
  designVersion,
  lead,
  memory,
  photo,
  visualAnchor,
}: {
  designVersion: DesignVersion;
  lead: GardenBriefLead;
  memory: DesignMemory;
  photo: NonNullable<GardenBriefLead["photos"]>[number] | null;
  visualAnchor: VisualAnchorMemory | null;
}) {
  const budgetReality = validateConceptAgainstBudget(
    {
      features: memory.versionFeatures,
      gardenSize: memory.gardenSize,
      style: lead.preferredStyle || memory.customerStyle,
    },
    lead.budgetBand || memory.budgetBand,
  );
  const safeFeatures = getManualSafeFeatures(memory.versionFeatures, budgetReality);
  const reservedFeatures = unique([
    ...memory.versionFeatures.filter((feature) => !safeFeatures.includes(feature)),
    ...getExcludedForVersion(lead, memory.versionFeatures),
  ]);
  const sourceFileName = photo ? buildPhotoDownloadName(photo) : "Select/download the labelled client photo first.";
  const photoLabel = photo?.label || "Selected garden view";
  const guardrails = lead.aiViewGuardrails || "Preserve all open access routes, doors, patio circulation, shed access and true boundary positions.";

  return `Manual AI Production Brief

Use this as the working checklist for Firefly/manual image editing. Do not ask AI to redesign the full garden in one pass.

Proposal version:
- ${designVersion}

Source image:
- Use labelled admin export: ${sourceFileName}
- View label: ${photoLabel}
- Original filename reference only: ${photo?.fileName || "Not selected"}

Design direction:
- Style: ${lead.preferredStyle || memory.customerStyle || "To be refined"}
- Budget band: ${lead.budgetBand || memory.budgetBand}
- Budget reality: ${budgetReality.budgetStatus}
- Estimated typical scope from selected features: ${formatCurrency(budgetReality.estimatedTypical)}
- Garden size/shape: ${memory.gardenSize}, ${memory.gardenShape}
- Planting maintenance: ${memory.plantingMaintenance}
- Planting colour direction: ${memory.plantingColourScheme}

Manually add or enhance only these features:
${bulletList(safeFeatures)}

Reserve or avoid in this version:
${bulletList(reservedFeatures)}

Planting palette:
- ${memory.plantingPalette.paletteSummary}
- Preferred plants: ${formatList(memory.plantingPalette.preferredPlants)}
- Avoid: ${formatList(memory.plantingPalette.avoidPlants)}

Placement notes:
${Object.entries(memory.lockedFeaturePlacements)
  .map(([feature, placement]) => `- ${feature}: ${placement}`)
  .join("\n") || "- No locked placements set."}

Admin guardrails:
- ${guardrails}
- Do not block shed doors, house doors, side access, open circulation or patio routes.
- Do not turn an open side into a closed boundary.
- Do not add planters, fencing or screening where the source image shows open access.

Approved visual anchor:
${
  visualAnchor
    ? `- Use ${visualAnchor.imageFileName || "the approved concept image"} as the placement reference.
- Anchor notes: ${visualAnchor.placementNotes}`
    : "- No visual anchor locked yet. If one strong concept exists, use it as the design placement reference."
}

Short Firefly instruction:
Edit this exact source image only. Preserve the house, shed, doors, boundaries, patio, lawn shape, access routes and camera angle. Apply a ${lead.preferredStyle || memory.customerStyle || "premium contemporary"} Anthēon Outdoor direction using only the manually approved features above. Keep the result realistic, buildable and aligned to the selected budget. Do not add structures, fences, planters or premium features from the reserved list.

QC before uploading:
- Same camera angle and source view retained.
- No boundaries swapped or invented.
- Shed/door/side access remains clear.
- Only approved features are visible.
- Reserved features are not shown.
- No duplicated pergola, seating zone, planter run, fire pit or kitchen.
- Image looks premium but still buildable.`;
}

function getManualSafeFeatures(
  features: string[],
  budgetReality: ReturnType<typeof validateConceptAgainstBudget>,
) {
  if (
    budgetReality.budgetStatus !== "Impossible For Budget" &&
    budgetReality.budgetStatus !== "Likely Over Budget"
  ) {
    return features;
  }

  const reserved = new Set([...budgetReality.blockedFeatures, ...budgetReality.cautionFeatures]);
  const safe = features.filter((feature) => !reserved.has(feature));

  return safe.length
    ? safe
    : features.filter((feature) =>
        ["Seating area", "Low-maintenance planting", "Real lawn", "Pathway", "Storage"].includes(feature),
      );
}

function bulletList(items: string[]) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None specified";
}

function unique(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function getVersionKey(designVersion: DesignVersion): ProposalVersionKey {
  if (designVersion === "Enhanced Design") {
    return "enhancedDesign";
  }

  if (designVersion === "Dream Version") {
    return "dreamVersion";
  }

  return "withinBudget";
}

function buildGardenMappingPrompt(
  lead: GardenBriefLead,
  memory: DesignMemory,
  designVersion: DesignVersion,
  visualAnchor: VisualAnchorMemory | null,
) {
  const photoSummary = lead.photos?.length
    ? lead.photos
        .map((photo, index) =>
          `${index + 1}. ${photo.label || "Unlabelled view"} - labelled admin export/file of truth: ${buildPhotoDownloadName(
            photo,
          )} - customer original filename for reference only: ${photo.fileName}${
            photo.notes ? ` - notes: ${photo.notes}` : ""
          }`,
        )
        .join("\n")
    : "No uploaded photos are attached to this lead yet.";

  const placements = Object.entries(memory.lockedFeaturePlacements).length
    ? Object.entries(memory.lockedFeaturePlacements)
        .map(([feature, placement]) => `- ${feature}: ${placement}`)
        .join("\n")
    : "- No locked placements have been set yet.";

  const duplicateRules = memory.prohibitedDuplicates.length
    ? memory.prohibitedDuplicates.map((rule) => `- ${rule}`).join("\n")
    : "- Keep major features singular unless explicitly repeatable.";
  const anchorSection = visualAnchor
    ? `Approved visual anchor:
- Version: ${visualAnchor.versionTitle}
- Anchor image file: ${visualAnchor.imageFileName || "approved concept image"}
- Anchor approved at: ${visualAnchor.approvedAt}
- Placement lock notes:
${visualAnchor.placementNotes}`
    : `Approved visual anchor:
- No visual anchor has been locked for this proposal version yet.
- After the first strong concept is approved, use it as the design placement reference before generating the remaining views.`;

  return `You are preparing a coherent Anthēon Outdoor garden map from multiple customer photos.

Do not redesign the garden yet. Do not generate any concept image yet.
First, interpret all uploaded photos as one single garden space.
Use the photo labels, notes and visible context to map camera angles, boundaries, house position, existing features and any uncertainties.

Customer and project context:
- Customer: ${lead.fullName}
- Selected design version: ${designVersion}
- Garden size: ${memory.gardenSize}
- Garden shape: ${memory.gardenShape}
- House position: ${memory.housePosition}
- Existing features: ${formatList(memory.existingFeatures)}
- Preferred style: ${memory.customerStyle}
- Budget band: ${memory.budgetBand}
- Planting maintenance level: ${memory.plantingMaintenance}
- Planting colour scheme: ${memory.plantingColourScheme}
- Preferred planting: ${formatList(memory.plantingPalette.preferredPlants)}
- Avoid planting: ${formatList(memory.plantingPalette.avoidPlants)}
- Admin AI view guardrails: ${lead.aiViewGuardrails || "No additional admin view guardrails provided."}

Uploaded photo labels:
${photoSummary}

File naming rule:
- Use the labelled admin export filenames above as the source-of-truth files for mapping and generation.
- The customer original filenames are included only for reference.
- If asked for the original file, use the labelled admin export downloaded from Anthēon Admin.

Locked feature placements:
${placements}

${anchorSection}

Duplicate prevention rules:
${duplicateRules}

Mapping task:
1. Create a view registry using the exact uploaded filenames above.
2. For each filename, identify the camera position, viewing direction, visible boundary, open/non-boundary edges, access routes, foreground, midground and background.
3. Describe the overall garden layout as one connected space.
4. Confirm where the house, patio, rear boundary, left boundary, right boundary and existing features appear.
5. Flag any conflicts or uncertainties between photos, including any left/right ambiguity.
6. Confirm the feature placement map for this proposal version.
7. State which selected features may not be visible from each camera angle, so they are not duplicated elsewhere.

Important:
- Preserve the real garden layout and camera perspective.
- When later editing a specific source image, use that source image only as the visual base. Treat the other uploaded photos as context only.
- If an approved visual anchor exists, use that anchor as the design placement reference while preserving the current source photo as the camera/view reference.
- Preserve open sides, side access, patio circulation, door access and shed access. Do not close them with new fences, raised planters, screening or boundary planting unless explicitly requested.
- Do not treat the edge of the image as a boundary unless the source photo clearly shows a real boundary line, fence or wall.
- Do not swap left and right boundaries between views.
- Do not mirror, rotate into a different viewpoint, or replace a source view with another uploaded view.
- Do not invent extra premium features.
- Do not duplicate pergolas, fire pits, kitchens, raised planter runs, water features, hot tub areas or seating zones.
- If a feature is not visible in one view, keep it in its locked location rather than adding another one.
- Keep this mapping consistent for every later image generation in this Gemini conversation.`;
}

function formatList(items: string[] | undefined) {
  return items?.length ? items.join(", ") : "None specified";
}

function getPhotoUrl(photo: NonNullable<GardenBriefLead["photos"]>[number]) {
  return photo.publicUrl ?? photo.previewUrl ?? "";
}

function buildPhotoDownloadName(photo: NonNullable<GardenBriefLead["photos"]>[number]) {
  const extension = getFileExtension(photo.fileName);
  const label = photo.label || "garden-photo";

  return `${slugify(label)}-${photo.id}${extension}`;
}

function getFileExtension(fileName: string) {
  const match = fileName.match(/\.[a-z0-9]+$/i);

  return match ? match[0].toLowerCase() : "";
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function downloadUrl(url: string, fileName: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    triggerDownload(objectUrl, fileName);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    triggerDownload(url, fileName);
  }
}

function triggerDownload(url: string, fileName: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}
