"use client";

import { useEffect, useMemo, useState } from "react";
import { mockLeads } from "@/data/content";
import { loadLeads, updateLead } from "@/data/storage";
import type { GardenBriefLead } from "@/data/types";
import { calculateBudgetFit } from "@/lib/budgetRules";
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
  const [photoLabel, setPhotoLabel] = useState("");

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

  const prompt = useMemo(() => {
    if (!lead || !selectedMemory) {
      return "";
    }

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
      photoLabel,
    });
  }, [designVersion, lead, photoLabel, selectedMemory]);

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
              <select value={photoLabel} onChange={(event) => setPhotoLabel(event.target.value)}>
                <option value="">Select a photo view</option>
                {photoOptions.map((label) => (
                  <option key={label}>{label}</option>
                ))}
              </select>
            </label>
          </div>
          <pre className="prompt-preview">{prompt}</pre>
        </article>
      </div>

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

function formatList(items: string[] | undefined) {
  return items?.length ? items.join(", ") : "None specified";
}
