import type { GardenBriefLead, GardenPhotoLabel } from "@/data/types";
import { getPlantingPalette, type PlantingPalette } from "@/lib/plantingRules";

export type DesignVersion = "Within Budget" | "Enhanced Design" | "Dream Version";

export type DesignMemory = {
  gardenSize: string;
  gardenShape: string;
  housePosition: string;
  photoMap: GardenPhotoLabel[];
  existingFeatures: string[];
  customerStyle: string;
  plantingMaintenance: string;
  plantingColourScheme: string;
  plantingPalette: PlantingPalette;
  budgetBand: string;
  selectedMustHaves: string[];
  selectedNiceToHaves: string[];
  lockedFeaturePlacements: Record<string, string>;
  prohibitedDuplicates: string[];
  spatialInstructions: string[];
  designVersion: DesignVersion;
  versionFeatures: string[];
};

export const placementOptions = [
  "Rear boundary only",
  "Left boundary",
  "Right boundary",
  "Patio zone",
  "House-side patio zone",
  "Central lawn zone",
  "Rear feature zone",
  "Rear-left corner",
  "Rear-right corner",
  "Path edges",
  "Boundary planting",
  "Existing shed zone",
  "Do not include",
];

const repeatableFeatures = new Set(["Garden lighting", "Low-maintenance planting", "Pathway"]);

const basePlacementRules: Record<string, string> = {
  "Porcelain patio": "House-side patio zone",
  "Composite decking": "Patio zone",
  Pergola: "House-side patio zone",
  "Outdoor kitchen": "House-side patio zone",
  "Fire pit": "Rear feature zone",
  "Garden lighting": "Path edges and boundary planting",
  "Seating area": "Patio zone",
  "Artificial grass": "Central lawn zone",
  "Real lawn": "Central lawn zone",
  "Raised planters": "Rear boundary only",
  "Water feature": "Rear feature zone",
  "Privacy screening": "Most overlooked boundary only",
  "Hot tub area": "Rear-right corner",
  "Sauna / wellness area": "Rear private zone",
  "Children’s play space": "Central lawn zone",
  "Low-maintenance planting": "Boundary planting",
  Storage: "Existing shed zone",
  "Garden office base": "Rear-left corner",
  Pathway: "Connect house-side patio to rear feature zone",
  "Retaining wall": "Level-change zone only",
  Fencing: "Existing boundary line",
};

export function createDesignMemory(
  leadBrief: GardenBriefLead,
  designVersion: DesignVersion = "Within Budget",
): DesignMemory {
  const versionFeatures = getVersionFeatures(leadBrief, designVersion);
  const plantingPalette = getPlantingPalette({
    style: leadBrief.preferredStyle,
    maintenanceLevel: leadBrief.plantingMaintenance,
    colourScheme: leadBrief.plantingColourScheme,
  });

  return {
    gardenSize: leadBrief.gardenSize || "Unsure",
    gardenShape: leadBrief.gardenShape || "Unsure",
    housePosition: leadBrief.housePosition || "Unsure",
    photoMap: leadBrief.photos ?? [],
    existingFeatures: leadBrief.existingFeatures ?? [],
    customerStyle: leadBrief.preferredStyle,
    plantingMaintenance: leadBrief.plantingMaintenance || "Not sure",
    plantingColourScheme: leadBrief.plantingColourScheme || "Not sure",
    plantingPalette,
    budgetBand: leadBrief.budgetBand,
    selectedMustHaves: leadBrief.mustHaves,
    selectedNiceToHaves: leadBrief.niceToHaves,
    lockedFeaturePlacements: createFeaturePlacementMap(versionFeatures, leadBrief),
    prohibitedDuplicates: createProhibitedDuplicateRules(versionFeatures),
    spatialInstructions: createSpatialInstructions(leadBrief, versionFeatures),
    designVersion,
    versionFeatures,
  };
}

export function createVersionDesignMemories(leadBrief: GardenBriefLead) {
  return {
    withinBudgetDesignMemory: createDesignMemory(leadBrief, "Within Budget"),
    enhancedDesignMemory: createDesignMemory(leadBrief, "Enhanced Design"),
    dreamDesignMemory: createDesignMemory(leadBrief, "Dream Version"),
  };
}

export function getVersionFeatures(leadBrief: GardenBriefLead, designVersion: DesignVersion) {
  if (designVersion === "Within Budget") {
    return unique(leadBrief.withinBudgetFeatures ?? leadBrief.approvedMustHaves ?? []);
  }

  if (designVersion === "Enhanced Design") {
    return unique(leadBrief.enhancedDesignFeatures ?? []);
  }

  return unique(leadBrief.dreamVersionFeatures ?? [...leadBrief.mustHaves, ...leadBrief.niceToHaves]);
}

export function createFeaturePlacementMap(features: string[], leadBrief: GardenBriefLead) {
  return features.reduce<Record<string, string>>((placements, feature) => {
    placements[feature] = choosePlacement(feature, leadBrief);
    return placements;
  }, {});
}

export function createProhibitedDuplicateRules(features: string[]) {
  const rules = [
    "Do not move existing shed unless requested.",
    "Do not invent extra premium features outside the approved proposal version.",
    "If a feature is not visible from a camera angle, do not duplicate it elsewhere.",
  ];

  features.forEach((feature) => {
    if (repeatableFeatures.has(feature)) {
      return;
    }

    if (feature === "Raised planters") {
      rules.push("Do not place raised planters on every boundary.");
      return;
    }

    if (feature === "Privacy screening") {
      rules.push("Do not apply privacy screening everywhere unless requested.");
      return;
    }

    if (feature === "Fire pit") {
      rules.push("Do not create multiple fire pit zones.");
      return;
    }

    if (feature === "Outdoor kitchen") {
      rules.push("Do not repeat the outdoor kitchen in more than one view.");
      return;
    }

    rules.push(`Do not add more than one ${feature.toLowerCase()}.`);
  });

  return unique(rules);
}

function createSpatialInstructions(leadBrief: GardenBriefLead, features: string[]) {
  const instructions = [
    `Treat the garden as one ${leadBrief.gardenSize || "unspecified size"}, ${leadBrief.gardenShape || "unspecified shape"} space across all uploaded views.`,
    `Use the house position as: ${leadBrief.housePosition || "unsure"}.`,
    "Preserve the existing garden layout and camera relationship between views.",
    "Use locked feature placements as the single source of truth.",
    "Keep visible features consistent across all generated views.",
    ...getPlantingPalette({
      style: leadBrief.preferredStyle,
      maintenanceLevel: leadBrief.plantingMaintenance,
    }).promptInstructions,
  ];

  if (leadBrief.layoutNotes) {
    instructions.push(`Customer layout/access notes: ${leadBrief.layoutNotes}`);
  }

  if (features.includes("Pathway")) {
    instructions.push("Use the pathway as a connector, not as a repeated decorative motif.");
  }

  if (features.includes("Privacy screening")) {
    instructions.push("Apply privacy screening only to the overlooked or selected boundary.");
  }

  return instructions;
}

function choosePlacement(feature: string, leadBrief: GardenBriefLead) {
  if (feature === "Storage" && (leadBrief.existingFeatures ?? []).includes("Shed")) {
    return "Existing shed zone";
  }

  if (feature === "Pergola" && leadBrief.housePosition === "Along the left side") {
    return "Left house-side patio zone";
  }

  if (feature === "Pergola" && leadBrief.housePosition === "Along the right side") {
    return "Right house-side patio zone";
  }

  return basePlacementRules[feature] ?? "Dedicated feature zone";
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}
