"use client";

import { useEffect, useMemo, useState } from "react";
import { mockLeads } from "@/data/content";
import { loadLeads, updateLead, uploadLayoutConceptImageFile } from "@/data/storage";
import type {
  FeaturePlacementNote,
  GardenBriefLead,
  HeroRenderStatus,
  LayoutConcept,
  LayoutConceptStatus,
  MasterplanStatus,
  ProposalImageAsset,
  ProposalVersionKey,
  VisualAnchorMemory,
} from "@/data/types";
import { calculateBudgetFit } from "@/lib/budgetRules";
import { formatCurrency, validateConceptAgainstBudget } from "@/lib/costRules";
import {
  createVersionDesignMemories,
  type DesignMemory,
  type DesignVersion,
  placementOptions,
} from "@/lib/designMemory";
import { calculateArea, defaultLayoutConcepts } from "@/lib/designStudio";
import {
  buildDesignConceptPrompt,
  buildHeroRenderPrompt,
} from "@/lib/prompts/designConceptPrompt";
import { buildGardenImagePrompt } from "@/lib/prompts/gardenImagePrompt";
import { getStyleGuide } from "@/lib/styleGuides";

const designVersions: DesignVersion[] = ["Within Budget", "Enhanced Design", "Dream Version"];
const adminGardenShapeOptions = [
  "Rectangular",
  "Square",
  "L-shaped",
  "Narrow / long",
  "Wide / shallow",
  "Irregular",
  "Unsure",
];
const adminHousePositionOptions = ["House at front", "House on left", "House on right", "Unsure"];
const adminPlacementOptions = [
  "Near house / patio doors",
  "Rear boundary",
  "Left boundary",
  "Right boundary",
  "Rear-left corner",
  "Rear-right corner",
  "Central garden",
  "Existing patio zone",
  "Not included in this version",
  "Unsure / discuss on call",
];
const existingPlanSources = ["Google Maps", "Bing Maps", "Manual", "Other"];
const layoutConceptStatuses: LayoutConceptStatus[] = [
  "Draft",
  "Shortlisted",
  "Rejected",
  "Selected",
  "Merged",
];
const finalLayoutSources = ["Concept A", "Concept B", "Concept C", "Merge", "Manual"];
const masterplanStatuses: MasterplanStatus[] = [
  "Not Started",
  "Sketch Required",
  "AI Enhanced",
  "Reviewed",
  "Approved",
];
const heroRenderStatuses: HeroRenderStatus[] = [
  "Not Started",
  "Prompt Prepared",
  "Generated Manually",
  "Needs Revision",
  "Approved",
];

export function AdminLeadDetail({ leadId }: { leadId: string }) {
  const [lead, setLead] = useState<GardenBriefLead | null>(null);
  const [designVersion, setDesignVersion] = useState<DesignVersion>("Within Budget");
  const [selectedPhotoId, setSelectedPhotoId] = useState("");
  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);

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

  const selectedStyleGuide = useMemo(
    () => getStyleGuide(lead?.preferredStyle || selectedMemory?.customerStyle || ""),
    [lead?.preferredStyle, selectedMemory?.customerStyle],
  );

  const featurePlacementNotes = useMemo(
    () => (lead ? buildFeaturePlacementRows(lead) : []),
    [lead],
  );

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
      adminLayoutPreparation: lead.adminLayoutPreparation,
      featurePlacementNotes: featurePlacementNotes,
      planSketchAvailable: Boolean(lead.planSketchImage?.previewUrl || lead.planSketchImage?.imageUrl),
    });
  }, [designVersion, featurePlacementNotes, lead, selectedMemory, selectedPhoto, selectedPhotoId]);

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
      featurePlacementNotes,
    });
  }, [designVersion, featurePlacementNotes, lead, selectedMemory, selectedPhoto]);

  const designConceptPrompt = useMemo(() => {
    if (!lead) {
      return "";
    }

    return buildDesignConceptPrompt({
      lead,
      scaleInfo: lead.scaleInformation,
      styleGuide: selectedStyleGuide,
    });
  }, [lead, selectedStyleGuide]);

  const heroRenderPrompt = useMemo(() => {
    if (!lead) {
      return "";
    }

    return buildHeroRenderPrompt({ lead, styleGuide: selectedStyleGuide });
  }, [lead, selectedStyleGuide]);

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

  function updateAdminLayoutField(
    field: keyof NonNullable<GardenBriefLead["adminLayoutPreparation"]>,
    value: string,
  ) {
    if (!lead) {
      return;
    }

    const updatedLead: GardenBriefLead = {
      ...lead,
      adminLayoutPreparation: {
        ...lead.adminLayoutPreparation,
        [field]: value,
      },
    };

    setLead(updatedLead);
    void updateLead(updatedLead);
  }

  function updateFeaturePlacementNote(
    feature: string,
    updates: Partial<FeaturePlacementNote>,
  ) {
    if (!lead) {
      return;
    }

    const rows = buildFeaturePlacementRows(lead);
    const nextRows = rows.map((row) =>
      row.feature === feature ? { ...row, ...updates } : row,
    );
    const updatedLead: GardenBriefLead = {
      ...lead,
      featurePlacementNotes: nextRows,
    };

    setLead(updatedLead);
    void updateLead(updatedLead);
  }

  function updateExistingPlanImage(files: FileList | null) {
    const file = files?.[0];

    if (!lead || !file) {
      return;
    }

    updateLeadState({
      existingGardenPlan: {
        ...lead.existingGardenPlan,
        image: createLocalImageAsset(file, "Cleaned-up existing garden plan."),
        updatedAt: new Date().toISOString(),
        createdAt: lead.existingGardenPlan?.createdAt ?? new Date().toISOString(),
      },
    });
  }

  function updateExistingPlanField(field: "notes" | "source", value: string) {
    if (!lead) {
      return;
    }

    updateLeadState({
      existingGardenPlan: {
        ...lead.existingGardenPlan,
        [field]: value,
        updatedAt: new Date().toISOString(),
        createdAt: lead.existingGardenPlan?.createdAt ?? new Date().toISOString(),
      },
    });
  }

  function updateScaleField(field: "gardenWidth" | "gardenLength" | "unit" | "scaleNotes", value: string) {
    if (!lead) {
      return;
    }

    const nextScale = {
      ...lead.scaleInformation,
      [field]: value,
    };

    updateLeadState({
      scaleInformation: {
        ...nextScale,
        calculatedArea: calculateArea(nextScale),
      },
    });
  }

  function updateConcept(
    conceptId: LayoutConcept["id"],
    updates: Partial<LayoutConcept>,
  ) {
    if (!lead) {
      return;
    }

    const concepts = getLayoutConcepts(lead).map((concept) =>
      concept.id === conceptId
        ? {
            ...concept,
            ...updates,
          }
        : concept,
    );

    updateLeadState({ layoutConcepts: concepts });
  }

  async function updateConceptImage(conceptId: LayoutConcept["id"], files: FileList | null) {
    const file = files?.[0];

    if (!lead || !file) {
      return;
    }

    const concept = getLayoutConcepts(lead).find((item) => item.id === conceptId);
    const image = await uploadLayoutConceptImageFile({
      leadId: lead.id,
      conceptId,
      file,
      currentImage: concept?.image,
    });

    updateConcept(conceptId, { image });
  }

  function updateConceptImageField(
    conceptId: LayoutConcept["id"],
    updates: Partial<ProposalImageAsset>,
  ) {
    if (!lead) {
      return;
    }

    const concept = getLayoutConcepts(lead).find((item) => item.id === conceptId);

    if (!concept) {
      return;
    }

    updateConcept(conceptId, {
      image: {
        ...(concept.image ?? {
          imageNotes: "",
          imageStatus: "Not Started",
          approved: false,
        }),
        ...updates,
      },
    });
  }

  function updateFinalLayoutField(
    field: keyof NonNullable<GardenBriefLead["finalLayoutDirection"]>,
    value: string | boolean,
  ) {
    if (!lead) {
      return;
    }

    updateLeadState({
      finalLayoutDirection: {
        ...lead.finalLayoutDirection,
        [field]: value,
      },
    });
  }

  function updateMasterplanImage(files: FileList | null) {
    const file = files?.[0];

    if (!lead || !file) {
      return;
    }

    updateLeadState({
      masterplan: {
        ...lead.masterplan,
        image: createLocalImageAsset(file, "Final plan sketch or AI-enhanced masterplan."),
        status: lead.masterplan?.status ?? "Sketch Required",
      },
    });
  }

  function updateMasterplanField(field: "notes" | "status", value: string) {
    if (!lead) {
      return;
    }

    updateLeadState({
      masterplan: {
        ...lead.masterplan,
        [field]: value,
      },
    });
  }

  function updateHeroRenderImage(files: FileList | null) {
    const file = files?.[0];

    if (!lead || !file) {
      return;
    }

    updateLeadState({
      heroRender: {
        ...lead.heroRender,
        image: createLocalImageAsset(file, "Hero concept render."),
        renderStatus: lead.heroRender?.renderStatus ?? "Generated Manually",
      },
    });
  }

  function updateHeroRenderField(field: "notes" | "renderStatus", value: string) {
    if (!lead) {
      return;
    }

    updateLeadState({
      heroRender: {
        ...lead.heroRender,
        [field]: value,
      },
    });
  }

  function updateLeadState(updates: Partial<GardenBriefLead>) {
    if (!lead) {
      return;
    }

    const updatedLead = {
      ...lead,
      ...updates,
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

  async function copyDesignConceptPrompt() {
    await navigator.clipboard.writeText(designConceptPrompt);
  }

  async function copyHeroRenderPrompt() {
    await navigator.clipboard.writeText(heroRenderPrompt);
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

      <div className="memory-layout">
        <article className="memory-panel">
          <p className="eyebrow">Design Studio</p>
          <h3>Lead summary</h3>
          <dl>
            <div>
              <dt>Address / postcode</dt>
              <dd>{lead.address || "No address provided"}</dd>
            </div>
            <div>
              <dt>Google Maps review</dt>
              <dd>
                {lead.address ? (
                  <a
                    className="inline-link"
                    href={buildGoogleMapsUrl(lead.address)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open in Google Maps
                  </a>
                ) : (
                  "Add an address/postcode first"
                )}
              </dd>
            </div>
            <div>
              <dt>Budget band</dt>
              <dd>{lead.budgetBand || "Not selected"}</dd>
            </div>
            <div>
              <dt>Selected style</dt>
              <dd>{lead.preferredStyle || "Style to be refined"}</dd>
            </div>
            <div>
              <dt>Must-haves</dt>
              <dd>{formatList(lead.mustHaves)}</dd>
            </div>
            <div>
              <dt>Nice-to-haves</dt>
              <dd>{formatList(lead.niceToHaves)}</dd>
            </div>
            <div>
              <dt>Customer notes</dt>
              <dd>{lead.notes || "No notes provided"}</dd>
            </div>
          </dl>
        </article>

        <article className="memory-panel">
          <p className="eyebrow">Garden layout preparation</p>
          <h3>Jack’s layout review</h3>
          <p>
            Use the customer photos and Google Maps/satellite view to prepare
            your own working plan sketch. These fields are admin-only.
          </p>
          <div className="field-grid">
            <label>
              Garden shape
              <select
                value={lead.adminLayoutPreparation?.gardenShape ?? lead.gardenShape ?? ""}
                onChange={(event) => updateAdminLayoutField("gardenShape", event.target.value)}
              >
                <option value="">Select a shape</option>
                {adminGardenShapeOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              House position
              <select
                value={lead.adminLayoutPreparation?.housePosition ?? lead.housePosition ?? ""}
                onChange={(event) => updateAdminLayoutField("housePosition", event.target.value)}
              >
                <option value="">Select a position</option>
                {adminHousePositionOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              Approx. garden length
              <input
                value={lead.adminLayoutPreparation?.approximateLength ?? ""}
                onChange={(event) => updateAdminLayoutField("approximateLength", event.target.value)}
                placeholder="e.g. 10"
              />
            </label>
            <label>
              Approx. garden width
              <input
                value={lead.adminLayoutPreparation?.approximateWidth ?? ""}
                onChange={(event) => updateAdminLayoutField("approximateWidth", event.target.value)}
                placeholder="e.g. 6"
              />
            </label>
            <label>
              Unit
              <select
                value={lead.adminLayoutPreparation?.unit ?? ""}
                onChange={(event) => updateAdminLayoutField("unit", event.target.value)}
              >
                <option value="">Select unit</option>
                <option>metres</option>
                <option>feet</option>
              </select>
            </label>
          </div>
          <label>
            Google Maps review notes
            <textarea
              rows={3}
              value={lead.adminLayoutPreparation?.googleMapsReviewNotes ?? ""}
              onChange={(event) =>
                updateAdminLayoutField("googleMapsReviewNotes", event.target.value)
              }
              placeholder="Satellite review, orientation, neighbouring context or access observations."
            />
          </label>
          <label>
            Existing layout notes
            <textarea
              rows={3}
              value={lead.adminLayoutPreparation?.existingLayoutNotes ?? lead.layoutNotes ?? ""}
              onChange={(event) =>
                updateAdminLayoutField("existingLayoutNotes", event.target.value)
              }
              placeholder="Existing patio, lawn, shed, boundaries, doors, level changes."
            />
          </label>
          <label>
            Constraints / access notes
            <textarea
              rows={3}
              value={lead.adminLayoutPreparation?.constraintsAccessNotes ?? ""}
              onChange={(event) =>
                updateAdminLayoutField("constraintsAccessNotes", event.target.value)
              }
              placeholder="Side access, drainage, tight turns, items not to block."
            />
          </label>
          <label>
            Jack’s sketch notes
            <textarea
              rows={3}
              value={lead.adminLayoutPreparation?.sketchNotes ?? ""}
              onChange={(event) => updateAdminLayoutField("sketchNotes", event.target.value)}
              placeholder="Quick plan sketch notes before drawing."
            />
          </label>
          <label>
            Initial plan direction notes
            <textarea
              rows={3}
              value={lead.adminLayoutPreparation?.initialPlanDirectionNotes ?? ""}
              onChange={(event) =>
                updateAdminLayoutField("initialPlanDirectionNotes", event.target.value)
              }
              placeholder="First layout direction for consultation."
            />
          </label>
        </article>
      </div>

      <div className="memory-layout design-studio-grid">
        <article className="memory-panel plan-sketch-panel">
          <p className="eyebrow">Existing garden plan</p>
          <h3>Top-down source of truth</h3>
          <p>
            Upload the cleaned-up top-down garden plan. This becomes the source
            of truth for layout concepts.
          </p>
          {lead.existingGardenPlan?.image?.previewUrl || lead.existingGardenPlan?.image?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={
                lead.existingGardenPlan.image.previewUrl ??
                lead.existingGardenPlan.image.imageUrl
              }
              alt="Existing top-down garden plan"
            />
          ) : (
            <div className="proposal-image-placeholder">
              Upload cleaned-up existing garden plan from satellite/manual prep.
            </div>
          )}
          <label>
            Existing plan source
            <select
              value={lead.existingGardenPlan?.source ?? ""}
              onChange={(event) => updateExistingPlanField("source", event.target.value)}
            >
              <option value="">Select source</option>
              {existingPlanSources.map((source) => (
                <option key={source}>{source}</option>
              ))}
            </select>
          </label>
          <label>
            Existing plan notes
            <textarea
              rows={4}
              value={lead.existingGardenPlan?.notes ?? ""}
              onChange={(event) => updateExistingPlanField("notes", event.target.value)}
              placeholder="How the plan was prepared, what was cleaned up, what is uncertain."
            />
          </label>
          <label>
            Upload existing garden plan
            <input
              accept="image/*"
              type="file"
              onChange={(event) => {
                updateExistingPlanImage(event.currentTarget.files);
                event.currentTarget.value = "";
              }}
            />
          </label>
          <p className="helper-text">
            Created: {formatDateOrPending(lead.existingGardenPlan?.createdAt)} · Updated:{" "}
            {formatDateOrPending(lead.existingGardenPlan?.updatedAt)}
          </p>
        </article>

        <article className="memory-panel">
          <p className="eyebrow">Scale information</p>
          <h3>Approximate dimensions</h3>
          <p>
            Use Google Maps measure tool or your own marked scale to record
            approximate dimensions. These dimensions guide AI concept layouts and
            budget realism.
          </p>
          <div className="field-grid">
            <label>
              Garden width
              <input
                value={lead.scaleInformation?.gardenWidth ?? ""}
                onChange={(event) => updateScaleField("gardenWidth", event.target.value)}
                placeholder="e.g. 6"
              />
            </label>
            <label>
              Garden length
              <input
                value={lead.scaleInformation?.gardenLength ?? ""}
                onChange={(event) => updateScaleField("gardenLength", event.target.value)}
                placeholder="e.g. 10"
              />
            </label>
            <label>
              Unit
              <select
                value={lead.scaleInformation?.unit ?? ""}
                onChange={(event) => updateScaleField("unit", event.target.value)}
              >
                <option value="">Select unit</option>
                <option>metres</option>
                <option>feet</option>
              </select>
            </label>
            <label>
              Calculated area
              <input
                readOnly
                value={
                  lead.scaleInformation?.calculatedArea
                    ? `${lead.scaleInformation.calculatedArea} sq ${lead.scaleInformation.unit || ""}`
                    : "Not calculated"
                }
              />
            </label>
          </div>
          <label>
            Scale notes
            <textarea
              rows={4}
              value={lead.scaleInformation?.scaleNotes ?? ""}
              onChange={(event) => updateScaleField("scaleNotes", event.target.value)}
              placeholder="Measurement method, approximate scale, uncertainty or marked reference."
            />
          </label>
        </article>
      </div>

      <article className="memory-panel style-guide-panel">
        <p className="eyebrow">Selected style guide</p>
        <h3>{selectedStyleGuide.name}</h3>
        <p>{selectedStyleGuide.summary}</p>
        <div className="style-guide-grid">
          <GuideList title="Should contain" items={selectedStyleGuide.shouldContain} />
          <GuideList title="Key materials" items={selectedStyleGuide.keyMaterials} />
          <GuideList title="Planting direction" items={selectedStyleGuide.plantingDirection} />
          <GuideList title="Suitable features" items={selectedStyleGuide.suitableFeatures} />
          <GuideList
            title="Budget-sensitive alternatives"
            items={selectedStyleGuide.budgetSensitiveAlternatives}
          />
          <GuideList title="Avoid" items={selectedStyleGuide.avoid} />
          <GuideList title="Sketch guidance" items={selectedStyleGuide.sketchGuidance} />
        </div>
        <div className="inspiration-slot-grid">
          {selectedStyleGuide.inspirationSlots.map((slot) => (
            <div className="inspiration-slot" key={slot}>
              Placeholder inspiration image: {slot}
            </div>
          ))}
        </div>
      </article>

      <article className="memory-panel">
        <p className="eyebrow">Feature placement notes</p>
        <h3>Guide the plan sketch</h3>
        <p>
          These notes are for Jack’s plan sketch and any later AI-improved plan
          view. They do not ask the customer to prepare a sketch.
        </p>
        <div className="feature-placement-grid">
          {featurePlacementNotes.map((row) => (
            <article className="feature-placement-card" key={`${row.priority}-${row.feature}`}>
              <div>
                <h4>{row.feature}</h4>
                <span>{row.priority}</span>
                <span>{row.budgetStatus}</span>
              </div>
              <label>
                Placement
                <select
                  value={row.placement}
                  onChange={(event) =>
                    updateFeaturePlacementNote(row.feature, { placement: event.target.value })
                  }
                >
                  {adminPlacementOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label>
                Placement note
                <textarea
                  rows={2}
                  value={row.note}
                  onChange={(event) =>
                    updateFeaturePlacementNote(row.feature, { note: event.target.value })
                  }
                  placeholder="Sketch note or call discussion point."
                />
              </label>
            </article>
          ))}
        </div>
      </article>

      <article className="memory-panel">
        <div className="photo-download-header">
          <div>
            <p className="eyebrow">AI layout concepts</p>
            <h3>Concept A / B / C</h3>
            <p>
              Copy the prompt, paste it into ChatGPT/Gemini with the existing
              garden plan, then record the three layout options here. No AI API
              is connected yet.
            </p>
          </div>
          <button className="button button-secondary" type="button" onClick={copyDesignConceptPrompt}>
            Copy AI Concept Prompt
          </button>
        </div>
        <div className="concept-card-grid">
          {getLayoutConcepts(lead).map((concept) => (
            <article className="layout-concept-card" key={concept.id}>
              <div className="concept-card-header">
                <p className="eyebrow">Concept {concept.id}</p>
                <select
                  value={concept.status}
                  onChange={(event) =>
                    updateConcept(concept.id, {
                      status: event.target.value as LayoutConceptStatus,
                    })
                  }
                >
                  {layoutConceptStatuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>
              <label>
                Concept name
                <input
                  value={concept.conceptName}
                  onChange={(event) => updateConcept(concept.id, { conceptName: event.target.value })}
                />
              </label>
              <div className="layout-concept-image-panel">
                <div className="layout-concept-image-frame">
                  {concept.image?.imageUrl || concept.image?.previewUrl ? (
                    <>
                      <img
                        alt={`${concept.conceptName || `Concept ${concept.id}`} reference`}
                        src={concept.image.imageUrl || concept.image.previewUrl}
                      />
                      <button
                        aria-label={`Expand Concept ${concept.id} image`}
                        className="concept-image-expand-button"
                        type="button"
                        onClick={() =>
                          setExpandedImageUrl(concept.image?.imageUrl || concept.image?.previewUrl || null)
                        }
                      >
                        ↗
                      </button>
                    </>
                  ) : (
                    <p>Upload the Gemini layout image for this concept.</p>
                  )}
                </div>
                <label>
                  Gemini concept image
                  <input
                    accept="image/*"
                    type="file"
                    onChange={(event) => void updateConceptImage(concept.id, event.target.files)}
                  />
                </label>
                <div className="field-grid">
                  <label>
                    Image status
                    <select
                      value={concept.image?.imageStatus ?? "Not Started"}
                      onChange={(event) =>
                        updateConceptImageField(concept.id, {
                          imageStatus: event.target.value as ProposalImageAsset["imageStatus"],
                        })
                      }
                    >
                      <option>Not Started</option>
                      <option>Generated Manually</option>
                      <option>Needs Regeneration</option>
                      <option>Approved</option>
                    </select>
                  </label>
                  <label className="review-check">
                    <input
                      checked={Boolean(concept.image?.approved)}
                      type="checkbox"
                      onChange={(event) =>
                        updateConceptImageField(concept.id, { approved: event.target.checked })
                      }
                    />
                    Reference approved
                  </label>
                </div>
                <label>
                  Image notes
                  <textarea
                    rows={2}
                    value={concept.image?.imageNotes ?? ""}
                    onChange={(event) =>
                      updateConceptImageField(concept.id, { imageNotes: event.target.value })
                    }
                    placeholder="What this concept image gets right or needs changing."
                  />
                </label>
              </div>
              <label>
                Design intent
                <textarea
                  rows={2}
                  value={concept.designIntent}
                  onChange={(event) => updateConcept(concept.id, { designIntent: event.target.value })}
                />
              </label>
              <label>
                Layout summary
                <textarea
                  rows={3}
                  value={concept.layoutSummary}
                  onChange={(event) => updateConcept(concept.id, { layoutSummary: event.target.value })}
                />
              </label>
              <label>
                Key features
                <textarea
                  rows={2}
                  value={concept.keyFeatures}
                  onChange={(event) => updateConcept(concept.id, { keyFeatures: event.target.value })}
                />
              </label>
              <label>
                Feature placements
                <textarea
                  rows={3}
                  value={concept.featurePlacements}
                  onChange={(event) =>
                    updateConcept(concept.id, { featurePlacements: event.target.value })
                  }
                />
              </label>
              <label>
                Why it fits budget
                <textarea
                  rows={2}
                  value={concept.whyItFitsBudget}
                  onChange={(event) =>
                    updateConcept(concept.id, { whyItFitsBudget: event.target.value })
                  }
                />
              </label>
              <label>
                Why it fits style
                <textarea
                  rows={2}
                  value={concept.whyItFitsStyle}
                  onChange={(event) =>
                    updateConcept(concept.id, { whyItFitsStyle: event.target.value })
                  }
                />
              </label>
              <label>
                Risks / watchouts
                <textarea
                  rows={2}
                  value={concept.risksOrWatchouts}
                  onChange={(event) =>
                    updateConcept(concept.id, { risksOrWatchouts: event.target.value })
                  }
                />
              </label>
              <label>
                Jack notes
                <textarea
                  rows={2}
                  value={concept.jackNotes}
                  onChange={(event) => updateConcept(concept.id, { jackNotes: event.target.value })}
                />
              </label>
            </article>
          ))}
        </div>
        <pre className="prompt-preview prompt-preview-compact">{designConceptPrompt}</pre>
      </article>

      <article className="memory-panel">
        <p className="eyebrow">Jack review</p>
        <h3>Final layout direction</h3>
        <div className="field-grid">
          <label>
            Selected concept source
            <select
              value={lead.finalLayoutDirection?.selectedConceptSource ?? ""}
              onChange={(event) =>
                updateFinalLayoutField("selectedConceptSource", event.target.value)
              }
            >
              <option value="">Select source</option>
              {finalLayoutSources.map((source) => (
                <option key={source}>{source}</option>
              ))}
            </select>
          </label>
          <label className="review-check">
            <input
              checked={Boolean(lead.finalLayoutDirection?.readyForMasterplan)}
              type="checkbox"
              onChange={(event) =>
                updateFinalLayoutField("readyForMasterplan", event.target.checked)
              }
            />
            Ready for masterplan
          </label>
        </div>
        <label>
          Final layout summary
          <textarea
            rows={3}
            value={lead.finalLayoutDirection?.finalLayoutSummary ?? ""}
            onChange={(event) =>
              updateFinalLayoutField("finalLayoutSummary", event.target.value)
            }
          />
        </label>
        <label>
          Final feature placements
          <textarea
            rows={3}
            value={lead.finalLayoutDirection?.finalFeaturePlacements ?? ""}
            onChange={(event) =>
              updateFinalLayoutField("finalFeaturePlacements", event.target.value)
            }
          />
        </label>
        <label>
          Final budget notes
          <textarea
            rows={2}
            value={lead.finalLayoutDirection?.finalBudgetNotes ?? ""}
            onChange={(event) => updateFinalLayoutField("finalBudgetNotes", event.target.value)}
          />
        </label>
        <label>
          Final style notes
          <textarea
            rows={2}
            value={lead.finalLayoutDirection?.finalStyleNotes ?? ""}
            onChange={(event) => updateFinalLayoutField("finalStyleNotes", event.target.value)}
          />
        </label>
        <label>
          Final risks
          <textarea
            rows={2}
            value={lead.finalLayoutDirection?.finalRisks ?? ""}
            onChange={(event) => updateFinalLayoutField("finalRisks", event.target.value)}
          />
        </label>
      </article>

      <article className="memory-panel plan-sketch-panel">
        <div>
          <p className="eyebrow">Final masterplan</p>
          <h3>Masterplan placeholder</h3>
          <p>
            Upload the final plan sketch or AI-enhanced masterplan once the
            layout direction has been chosen.
          </p>
        </div>
        {lead.masterplan?.image?.previewUrl || lead.masterplan?.image?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={lead.masterplan.image.previewUrl ?? lead.masterplan.image.imageUrl}
            alt="Final masterplan"
          />
        ) : (
          <div className="proposal-image-placeholder">
            Upload final plan sketch or AI-enhanced masterplan.
          </div>
        )}
        <label>
          Masterplan status
          <select
            value={lead.masterplan?.status ?? "Not Started"}
            onChange={(event) => updateMasterplanField("status", event.target.value)}
          >
            {masterplanStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
        <label>
          Masterplan notes
          <textarea
            rows={3}
            value={lead.masterplan?.notes ?? ""}
            onChange={(event) => updateMasterplanField("notes", event.target.value)}
          />
        </label>
        <label>
          Upload masterplan image
          <input
            accept="image/*"
            type="file"
            onChange={(event) => {
              updateMasterplanImage(event.currentTarget.files);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </article>

      <article className="memory-panel plan-sketch-panel">
        <div className="photo-download-header">
          <div>
            <p className="eyebrow">Hero concept render</p>
            <h3>One strong hero image</h3>
            <p>
              Prepare one hero render from the final masterplan, customer photos,
              selected style, budget and final feature placements.
            </p>
          </div>
          <button className="button button-secondary" type="button" onClick={copyHeroRenderPrompt}>
            Copy Hero Render Prompt
          </button>
        </div>
        {lead.heroRender?.image?.previewUrl || lead.heroRender?.image?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={lead.heroRender.image.previewUrl ?? lead.heroRender.image.imageUrl}
            alt="Hero concept render"
          />
        ) : (
          <div className="proposal-image-placeholder">
            Upload manually generated hero concept render.
          </div>
        )}
        <label>
          Render status
          <select
            value={lead.heroRender?.renderStatus ?? "Not Started"}
            onChange={(event) => updateHeroRenderField("renderStatus", event.target.value)}
          >
            {heroRenderStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
        <label>
          Hero render notes
          <textarea
            rows={3}
            value={lead.heroRender?.notes ?? ""}
            onChange={(event) => updateHeroRenderField("notes", event.target.value)}
          />
        </label>
        <label>
          Upload hero render
          <input
            accept="image/*"
            type="file"
            onChange={(event) => {
              updateHeroRenderImage(event.currentTarget.files);
              event.currentTarget.value = "";
            }}
          />
        </label>
        <pre className="prompt-preview prompt-preview-compact">{heroRenderPrompt}</pre>
      </article>

      <article className="memory-panel gemini-prep-panel">
        <div className="photo-download-header">
          <div>
            <p className="eyebrow">Optional prompt preparation</p>
            <h3>Reference pack for manual AI work</h3>
            <p>
              Use this only as a support prompt for manual Firefly/Gemini work.
              Jack’s layout review, style guide, feature placement notes and
              plan sketch remain the source of truth.
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
          <li>Review address/postcode in Google Maps and prepare Jack’s sketch notes.</li>
          <li>Use the selected style guide and feature placement notes to guide edits.</li>
          <li>Create one strong hero concept first; treat other views as optional support material.</li>
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
          <h3>Consultation data</h3>
          <p>
            Internal budget, style and proposal-version data used to prepare the
            consultation pack.
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
          <h3>Optional prompt preview</h3>
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
            ×
          </button>
          <figure onClick={(event) => event.stopPropagation()}>
            <img src={expandedImageUrl} alt="Expanded layout concept" />
            <figcaption>Layout concept reference</figcaption>
          </figure>
        </div>
      ) : null}
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

function GuideList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4>{title}</h4>
      <ul className="feature-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function buildGoogleMapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function buildFeaturePlacementRows(lead: GardenBriefLead): FeaturePlacementNote[] {
  const existing = lead.featurePlacementNotes ?? [];
  const mustHaves = lead.mustHaves.map((feature) =>
    buildFeaturePlacementRow({
      existing,
      feature,
      lead,
      priority: "Must-have",
    }),
  );
  const niceToHaves = lead.niceToHaves.map((feature) =>
    buildFeaturePlacementRow({
      existing,
      feature,
      lead,
      priority: "Nice-to-have",
    }),
  );

  return uniqueFeatureRows([...mustHaves, ...niceToHaves]);
}

function getLayoutConcepts(lead: GardenBriefLead): LayoutConcept[] {
  const saved = lead.layoutConcepts ?? [];

  return defaultLayoutConcepts.map((concept) => ({
    ...concept,
    ...(saved.find((savedConcept) => savedConcept.id === concept.id) ?? {}),
  }));
}

function createLocalImageAsset(file: File, imageNotes: string): ProposalImageAsset {
  return {
    fileName: file.name,
    previewUrl: URL.createObjectURL(file),
    imageNotes,
    imageStatus: "Generated Manually",
    approved: false,
  };
}

function formatDateOrPending(value?: string) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function buildFeaturePlacementRow({
  existing,
  feature,
  lead,
  priority,
}: {
  existing: FeaturePlacementNote[];
  feature: string;
  lead: GardenBriefLead;
  priority: FeaturePlacementNote["priority"];
}): FeaturePlacementNote {
  const saved = existing.find((row) => row.feature === feature);

  return {
    feature,
    priority,
    budgetStatus: getFeatureBudgetStatus(lead, feature, priority),
    placement: saved?.placement || "Unsure / discuss on call",
    note: saved?.note || "",
  };
}

function getFeatureBudgetStatus(
  lead: GardenBriefLead,
  feature: string,
  priority: FeaturePlacementNote["priority"],
): FeaturePlacementNote["budgetStatus"] {
  if (
    lead.excludedMustHaves?.includes(feature) ||
    lead.excludedNiceToHaves?.includes(feature)
  ) {
    return "Better for enhanced/dream";
  }

  if (lead.cautionMustHaves?.includes(feature) || priority === "Nice-to-have") {
    return "Caution";
  }

  return "Suitable";
}

function uniqueFeatureRows(rows: FeaturePlacementNote[]) {
  const seen = new Set<string>();

  return rows.filter((row) => {
    if (seen.has(row.feature)) {
      return false;
    }

    seen.add(row.feature);
    return true;
  });
}

function buildManualProductionBrief({
  designVersion,
  featurePlacementNotes,
  lead,
  memory,
  photo,
  visualAnchor,
}: {
  designVersion: DesignVersion;
  featurePlacementNotes: FeaturePlacementNote[];
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

Jack layout preparation:
- Garden shape: ${lead.adminLayoutPreparation?.gardenShape || lead.gardenShape || "Not reviewed yet"}
- Approx. size: ${lead.adminLayoutPreparation?.approximateLength || "?"} x ${lead.adminLayoutPreparation?.approximateWidth || "?"} ${lead.adminLayoutPreparation?.unit || ""}
- House position: ${lead.adminLayoutPreparation?.housePosition || lead.housePosition || "Not reviewed yet"}
- Google Maps notes: ${lead.adminLayoutPreparation?.googleMapsReviewNotes || "Not reviewed yet"}
- Sketch notes: ${lead.adminLayoutPreparation?.sketchNotes || "No sketch notes yet"}
- Initial plan direction: ${lead.adminLayoutPreparation?.initialPlanDirectionNotes || "No plan direction yet"}

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

Jack feature placement notes:
${featurePlacementNotes
  .map(
    (note) =>
      `- ${note.feature} (${note.priority}, ${note.budgetStatus}): ${note.placement}${
        note.note ? ` — ${note.note}` : ""
      }`,
  )
  .join("\n") || "- No feature placement notes yet."}

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
