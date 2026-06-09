import type { DesignMemory, DesignVersion } from "@/lib/designMemory";
import { getBudgetRealityGuardrails, validateConceptAgainstBudget } from "@/lib/costRules";
import type { GardenPhotoLabel, VisualAnchorMemory } from "@/data/types";

type GardenImagePromptInput = {
  designVersion: DesignVersion;
  budgetBand: string;
  approvedFeatures: string[];
  cautionFeatures: string[];
  excludedFeatures: string[];
  style: string;
  customerNotes: string;
  designMemory: DesignMemory;
  photoLabel: string;
  currentPhoto?: GardenPhotoLabel | null;
  visualAnchor?: VisualAnchorMemory | null;
};

export function buildGardenImagePrompt({
  designVersion,
  budgetBand,
  approvedFeatures,
  cautionFeatures,
  excludedFeatures,
  style,
  customerNotes,
  designMemory,
  photoLabel,
  currentPhoto,
  visualAnchor,
}: GardenImagePromptInput) {
  const placements = Object.entries(designMemory.lockedFeaturePlacements)
    .map(([feature, placement]) => `- ${feature}: ${placement}`)
    .join("\n");
  const duplicates = designMemory.prohibitedDuplicates.map((rule) => `- ${rule}`).join("\n");
  const spatial = designMemory.spatialInstructions.map((rule) => `- ${rule}`).join("\n");
  const budgetReality = validateConceptAgainstBudget(
    {
      features: approvedFeatures,
      style: style || designMemory.customerStyle,
      gardenSize: designMemory.gardenSize,
    },
    budgetBand || designMemory.budgetBand,
  );
  const budgetGuardrails = getBudgetRealityGuardrails({
    budgetBand: budgetBand || designMemory.budgetBand,
    features: approvedFeatures,
    style: style || designMemory.customerStyle,
  });

  return `Create a realistic, buildable Anthēon Outdoor garden concept for the ${designVersion} proposal.

SOURCE IMAGE LOCK - CRITICAL:
- Use the uploaded source image "${currentPhoto?.fileName || photoLabel || "selected garden photo"}" as the visual base for this generation.
- Source photo label: ${currentPhoto?.label || photoLabel || "Unlabelled garden view"}.
- Source photo notes: ${currentPhoto?.notes || "No source photo notes provided."}
- Other uploaded photos are context only. Do not use another uploaded photo as the base image.
- Keep the same camera position, viewing direction, boundary side, house position, foreground, midground and background relationship as this source image.
- Do not swap the left boundary with the right boundary.
- Do not turn a boundary view into a view from the house, or a view from the house into a boundary view.
- If the phone photo orientation is sideways or contains EXIF rotation, correct only the orientation needed for viewing; do not redesign the camera angle or mirror the garden.
- The result should look like this exact source photo has been carefully redesigned, not like a newly invented garden.

${buildVisualAnchorPromptSection(visualAnchor)}

Camera/view context:
- Current photo label: ${photoLabel || "Unlabelled garden view"}
- Preserve the existing garden layout, perspective and house/garden relationship from this view.

Design memory is the single source of truth:
- Garden size: ${designMemory.gardenSize}
- Garden shape: ${designMemory.gardenShape}
- House position: ${designMemory.housePosition}
- Existing features: ${list(designMemory.existingFeatures)}
- Customer style preference: ${style || designMemory.customerStyle || "Not specified"}
- Planting maintenance level: ${designMemory.plantingMaintenance}
- Preferred planting colour scheme: ${designMemory.plantingColourScheme}
- Planting palette direction: ${designMemory.plantingPalette.paletteSummary}
- Preferred planting: ${list(designMemory.plantingPalette.preferredPlants)}
- Avoid planting: ${list(designMemory.plantingPalette.avoidPlants)}
- Budget band: ${budgetBand || designMemory.budgetBand || "Not specified"}

Locked feature placements:
${placements || "- No locked feature placements yet."}

Spatial instructions:
${spatial}

Duplicate prevention:
${duplicates}
- Keep feature placement consistent across all views.
- If a feature is not visible from this camera angle, do not invent another one.
- If the pergola is locked to the house-side patio zone, show it only where that house-side patio zone is actually visible from this source view. Do not move it to a rear boundary or side boundary to make it visible.
- If a locked feature is outside this source camera angle, omit it from this view instead of relocating or duplicating it.
- Do not add features excluded from this version.

Version feature scope:
- Approved features: ${list(approvedFeatures)}
- Caution features requiring careful specification: ${list(cautionFeatures)}
- Excluded/reserved features: ${list(excludedFeatures)}
- Budget reality status: ${budgetReality.budgetStatus}
- Corrected budget-safe feature set if needed: ${list(budgetReality.correctedFeatureSet)}

${budgetGuardrails}

Customer notes:
${customerNotes || "No additional customer notes provided."}

Design quality:
- Respect the selected budget band and proposal version.
- Keep the design premium, calm, practical and buildable.
- If a feature is not realistic for this budget band, reserve it for Enhanced/Dream instead of showing it.
- If this concept includes blocked features for the selected budget, treat it as a failed concept and regenerate.
- Do not generate unrealistic construction, impossible levels or duplicated premium features.
- Do not fake completed project photography or add unrequested luxury features.`;
}

function list(items: string[]) {
  return items.length ? items.join(", ") : "None specified";
}

function buildVisualAnchorPromptSection(visualAnchor?: VisualAnchorMemory | null) {
  if (!visualAnchor) {
    return `APPROVED VISUAL ANCHOR:
- No approved anchor image has been locked yet for this proposal version.
- Follow the design memory and source image lock carefully.`;
  }

  return `APPROVED VISUAL ANCHOR - DESIGN PLACEMENT LOCK:
- An earlier concept image has been approved as the visual anchor for this proposal version.
- Anchor image file: ${visualAnchor.imageFileName || "approved concept image"}.
- Use the current source photo for camera angle and view structure.
- Use the approved anchor image for feature placement, design language and material consistency.
- Do not redesign or relocate approved anchor features.
- Do not add a second pergola, second seating zone, second raised planter run, second fire pit, second kitchen or repeated premium feature zone.
- If an anchored feature is not visible from the current camera angle, omit it from this view rather than moving it.
- Anchor placement notes:
${visualAnchor.placementNotes || "No written anchor notes provided."}`;
}
