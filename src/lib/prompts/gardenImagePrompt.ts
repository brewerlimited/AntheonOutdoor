import type { DesignMemory, DesignVersion } from "@/lib/designMemory";
import { getBudgetRealityGuardrails, validateConceptAgainstBudget } from "@/lib/costRules";

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
