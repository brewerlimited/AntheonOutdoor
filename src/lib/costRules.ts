import { getBudgetBandKey, type BudgetBandKey } from "@/lib/budgetRules";

export type BudgetRealityStatus =
  | "Within Range"
  | "Stretch"
  | "Likely Over Budget"
  | "Impossible For Budget";

export type CostRule = {
  label: string;
  minCost: number;
  typicalCost: number;
  maxCost: number;
  unit: string;
  scalable: boolean;
  budgetCategory: string;
  notes: string;
  hardBlockedBudgetBands: BudgetBandKey[];
  cautionBudgetBands: BudgetBandKey[];
};

export type ConceptValidationInput =
  | string[]
  | {
      features?: string[];
      style?: string;
      gardenSize?: string;
      quantities?: Record<string, number | string>;
    };

export type BudgetRealityResult = {
  estimatedMin: number;
  estimatedTypical: number;
  estimatedMax: number;
  budgetStatus: BudgetRealityStatus;
  blockedFeatures: string[];
  cautionFeatures: string[];
  reasons: string[];
  correctedFeatureSet: string[];
  suggestedCorrection: string;
};

const budgetRanges: Record<BudgetBandKey, { min: number; max: number }> = {
  "Garden Refresh": { min: 3500, max: 7000 },
  "Signature Transformation": { min: 7500, max: 15000 },
  "Outdoor Living": { min: 15000, max: 30000 },
  "Luxury Outdoor Space": { min: 30000, max: 60000 },
  "Not sure yet": { min: 0, max: Number.POSITIVE_INFINITY },
};

const premiumFeatureLabels = [
  "Pergola",
  "Composite decking",
  "Outdoor kitchen",
  "Hot tub area",
  "Sauna / wellness area",
  "Water feature",
  "Retaining wall",
  "Garden office base",
];

const gardenRefreshAlternatives: Record<string, string[]> = {
  "Pergola": ["Dark privacy screen", "Seating area"],
  "Composite decking": ["Gravel/paver seating area"],
  "Porcelain patio": ["10-15m2 patio zone"],
  "Outdoor kitchen": ["Simple BBQ/store zone"],
  "Fire pit": ["Portable fire bowl placeholder"],
  "Artificial grass": ["Existing lawn retained", "Turf refresh"],
  "Garden lighting": ["4-6 low-voltage/solar feature lights"],
  "Fencing": ["Paint/stain existing fence", "One feature screen"],
  "Water feature": ["One sculptural planter focal point"],
  "Hot tub area": ["Private seating corner"],
  "Sauna / wellness area": ["Calm planted seating zone"],
  "Retaining wall": ["Simple planted edge"],
};

export const costRules: CostRule[] = [
  {
    label: "Porcelain patio",
    minCost: 1500,
    typicalCost: 4500,
    maxCost: 9000,
    unit: "10-30m2 area",
    scalable: true,
    budgetCategory: "Surfaces",
    notes: "Patios can run around £65-£180/m2 depending on material, prep and detail. Garden Refresh should stay around 10-15m2.",
    hardBlockedBudgetBands: [],
    cautionBudgetBands: ["Garden Refresh", "Signature Transformation"],
  },
  {
    label: "Composite decking",
    minCost: 3500,
    typicalCost: 8000,
    maxCost: 16000,
    unit: "defined deck zone",
    scalable: true,
    budgetCategory: "Surfaces",
    notes: "Composite decking is rarely sensible in a Garden Refresh unless treated as a tiny accent, so it should be reserved for higher versions.",
    hardBlockedBudgetBands: ["Garden Refresh"],
    cautionBudgetBands: ["Signature Transformation"],
  },
  {
    label: "Pergola",
    minCost: 3500,
    typicalCost: 9500,
    maxCost: 24000,
    unit: "1 no.",
    scalable: false,
    budgetCategory: "Outdoor living",
    notes: "Small pergolas can be explored with caution from Signature Transformation; premium pergolas belong higher.",
    hardBlockedBudgetBands: ["Garden Refresh"],
    cautionBudgetBands: ["Signature Transformation"],
  },
  {
    label: "Outdoor kitchen",
    minCost: 6000,
    typicalCost: 15000,
    maxCost: 35000,
    unit: "1 zone",
    scalable: false,
    budgetCategory: "Outdoor living",
    notes: "Usually reserved for Outdoor Living or Luxury versions; a Garden Refresh can show only a simple BBQ/store zone.",
    hardBlockedBudgetBands: ["Garden Refresh"],
    cautionBudgetBands: ["Signature Transformation", "Outdoor Living"],
  },
  {
    label: "Fire pit",
    minCost: 250,
    typicalCost: 2500,
    maxCost: 7500,
    unit: "portable to built-in",
    scalable: true,
    budgetCategory: "Atmosphere",
    notes: "Portable fire bowls can fit tighter budgets; built-in zones need more scope.",
    hardBlockedBudgetBands: [],
    cautionBudgetBands: ["Garden Refresh"],
  },
  {
    label: "Garden lighting",
    minCost: 400,
    typicalCost: 2500,
    maxCost: 10000,
    unit: "limited to premium scheme",
    scalable: true,
    budgetCategory: "Atmosphere",
    notes: "Garden Refresh should use limited warm feature lighting, around 4-6 low-voltage or solar points.",
    hardBlockedBudgetBands: [],
    cautionBudgetBands: ["Garden Refresh", "Signature Transformation"],
  },
  {
    label: "Seating area",
    minCost: 700,
    typicalCost: 2500,
    maxCost: 12000,
    unit: "1 zone",
    scalable: true,
    budgetCategory: "Layout",
    notes: "A focused seating area is one of the most budget-flexible design moves.",
    hardBlockedBudgetBands: [],
    cautionBudgetBands: [],
  },
  {
    label: "Artificial grass",
    minCost: 900,
    typicalCost: 3000,
    maxCost: 9500,
    unit: "10-30m2 area",
    scalable: true,
    budgetCategory: "Planting and lawn",
    notes: "Artificial grass is commonly around £60-£100/m2 installed. Full replacement above 15m2 is not a Garden Refresh move.",
    hardBlockedBudgetBands: [],
    cautionBudgetBands: ["Garden Refresh", "Signature Transformation"],
  },
  {
    label: "Real lawn",
    minCost: 500,
    typicalCost: 1800,
    maxCost: 6500,
    unit: "turf refresh",
    scalable: true,
    budgetCategory: "Planting and lawn",
    notes: "Retaining or refreshing lawn is usually more suitable than full replacement in lower budgets.",
    hardBlockedBudgetBands: [],
    cautionBudgetBands: [],
  },
  {
    label: "Raised planters",
    minCost: 700,
    typicalCost: 2500,
    maxCost: 8500,
    unit: "1 feature run",
    scalable: true,
    budgetCategory: "Planting and lawn",
    notes: "Garden Refresh should show one small raised planter feature, not planters on every boundary.",
    hardBlockedBudgetBands: [],
    cautionBudgetBands: ["Garden Refresh"],
  },
  {
    label: "Water feature",
    minCost: 2500,
    typicalCost: 8500,
    maxCost: 18000,
    unit: "1 focal point",
    scalable: false,
    budgetCategory: "Atmosphere",
    notes: "Power, water, maintenance and bespoke detailing make this unsuitable for a Garden Refresh concept.",
    hardBlockedBudgetBands: ["Garden Refresh"],
    cautionBudgetBands: ["Signature Transformation", "Outdoor Living"],
  },
  {
    label: "Privacy screening",
    minCost: 800,
    typicalCost: 3500,
    maxCost: 12000,
    unit: "feature panel or boundary run",
    scalable: true,
    budgetCategory: "Boundaries",
    notes: "A limited feature screen can fit lower budgets; full boundary screening should move higher.",
    hardBlockedBudgetBands: [],
    cautionBudgetBands: ["Garden Refresh"],
  },
  {
    label: "Hot tub area",
    minCost: 3500,
    typicalCost: 11000,
    maxCost: 22000,
    unit: "base and surrounding zone",
    scalable: false,
    budgetCategory: "Wellness",
    notes: "Only sensible in lower budgets if the hot tub already exists and the surrounding scope is minimal.",
    hardBlockedBudgetBands: ["Garden Refresh"],
    cautionBudgetBands: ["Signature Transformation", "Outdoor Living"],
  },
  {
    label: "Sauna / wellness area",
    minCost: 12000,
    typicalCost: 26000,
    maxCost: 45000,
    unit: "1 structure/zone",
    scalable: false,
    budgetCategory: "Wellness",
    notes: "A premium wellness structure belongs in Luxury or Dream versions.",
    hardBlockedBudgetBands: ["Garden Refresh", "Signature Transformation"],
    cautionBudgetBands: ["Outdoor Living"],
  },
  {
    label: "Children’s play space",
    minCost: 500,
    typicalCost: 2500,
    maxCost: 8500,
    unit: "integrated area",
    scalable: true,
    budgetCategory: "Family",
    notes: "Simple integrated play works across budgets; bespoke structures need more scope.",
    hardBlockedBudgetBands: [],
    cautionBudgetBands: [],
  },
  {
    label: "Low-maintenance planting",
    minCost: 700,
    typicalCost: 3000,
    maxCost: 12000,
    unit: "planting scheme",
    scalable: true,
    budgetCategory: "Planting and lawn",
    notes: "A strong Garden Refresh lever when used with simple grasses, evergreens and restrained structure.",
    hardBlockedBudgetBands: [],
    cautionBudgetBands: [],
  },
  {
    label: "Storage",
    minCost: 400,
    typicalCost: 1800,
    maxCost: 7000,
    unit: "storage improvement",
    scalable: true,
    budgetCategory: "Practical",
    notes: "Useful across budgets; bespoke integrated storage belongs higher.",
    hardBlockedBudgetBands: [],
    cautionBudgetBands: [],
  },
  {
    label: "Garden office base",
    minCost: 2500,
    typicalCost: 7000,
    maxCost: 14000,
    unit: "base only",
    scalable: true,
    budgetCategory: "Practical",
    notes: "Base only, excluding the building. Usually not a Garden Refresh priority.",
    hardBlockedBudgetBands: ["Garden Refresh"],
    cautionBudgetBands: ["Signature Transformation"],
  },
  {
    label: "Pathway",
    minCost: 700,
    typicalCost: 2500,
    maxCost: 8000,
    unit: "controlled route",
    scalable: true,
    budgetCategory: "Layout",
    notes: "Works across budgets when material, width and length are controlled.",
    hardBlockedBudgetBands: [],
    cautionBudgetBands: ["Garden Refresh"],
  },
  {
    label: "Retaining wall",
    minCost: 3500,
    typicalCost: 12000,
    maxCost: 30000,
    unit: "structural wall",
    scalable: true,
    budgetCategory: "Structure",
    notes: "Major retaining walls, excavation and engineering can consume budget quickly.",
    hardBlockedBudgetBands: ["Garden Refresh"],
    cautionBudgetBands: ["Signature Transformation", "Outdoor Living"],
  },
  {
    label: "Fencing",
    minCost: 900,
    typicalCost: 5000,
    maxCost: 15000,
    unit: "repair/paint to replacement",
    scalable: true,
    budgetCategory: "Boundaries",
    notes: "Garden Refresh should usually paint/stain existing fencing or add one feature screen, not replace all boundaries.",
    hardBlockedBudgetBands: [],
    cautionBudgetBands: ["Garden Refresh", "Signature Transformation"],
  },
];

export const darkContemporaryGardenRefreshFeatures = [
  "Existing fencing painted/stained charcoal",
  "10-12m2 dark patio/seating area",
  "One raised planter feature",
  "Low-maintenance grasses/evergreen planting",
  "4-6 warm feature lights",
  "Existing lawn retained",
];

export function estimateFeatureCost(feature: string, quantity?: number | string) {
  const rule = findCostRule(feature);
  const multiplier = typeof quantity === "number" && rule?.scalable ? quantity : 1;

  if (!rule) {
    return { min: 0, typical: 0, max: 0 };
  }

  return {
    min: Math.round(rule.minCost * multiplier),
    typical: Math.round(rule.typicalCost * multiplier),
    max: Math.round(rule.maxCost * multiplier),
  };
}

export function validateConceptAgainstBudget(
  concept: ConceptValidationInput,
  budgetBand: string,
): BudgetRealityResult {
  const budgetKey = getBudgetBandKey(budgetBand);
  const features = getConceptFeatures(concept);
  const style = Array.isArray(concept) ? "" : concept.style ?? "";
  const budgetRange = budgetRanges[budgetKey];
  const costedFeatures = features.map((feature) =>
    estimateFeatureCost(feature, Array.isArray(concept) ? undefined : concept.quantities?.[feature]),
  );
  const estimatedMin = sum(costedFeatures.map((item) => item.min));
  const estimatedTypical = sum(costedFeatures.map((item) => item.typical));
  const estimatedMax = sum(costedFeatures.map((item) => item.max));
  const blockedFeatures = getBlockedFeatures(features, budgetKey);
  const cautionFeatures = getCautionFeatures(features, budgetKey);
  const premiumCount = features.filter((feature) => premiumFeatureLabels.includes(feature)).length;
  const reasons = buildReasons({
    budgetKey,
    blockedFeatures,
    cautionFeatures,
    estimatedTypical,
    budgetMax: budgetRange.max,
    premiumCount,
  });
  const budgetStatus = getBudgetStatus({
    budgetKey,
    blockedFeatures,
    cautionFeatures,
    estimatedTypical,
    budgetMax: budgetRange.max,
    premiumCount,
  });
  const correctedFeatureSet = correctConceptFeatureSet(features, budgetKey, style);

  return {
    estimatedMin,
    estimatedTypical,
    estimatedMax,
    budgetStatus,
    blockedFeatures,
    cautionFeatures,
    reasons,
    correctedFeatureSet,
    suggestedCorrection: buildSuggestedCorrection(blockedFeatures, cautionFeatures, correctedFeatureSet),
  };
}

export function getBudgetRealityGuardrails({
  budgetBand,
  features,
  style,
}: {
  budgetBand: string;
  features: string[];
  style?: string;
}) {
  const budgetKey = getBudgetBandKey(budgetBand);
  const result = validateConceptAgainstBudget({ features, style }, budgetBand);
  const blocked = result.blockedFeatures.length
    ? `Do not include: ${result.blockedFeatures.join(", ")}.`
    : "";

  if (budgetKey !== "Garden Refresh") {
    return `Budget realism check:
- Estimated typical scope: ${formatCurrency(result.estimatedTypical)}.
- Budget status: ${result.budgetStatus}.
- ${blocked || "Keep the concept aligned to the included feature set and avoid inventing extra premium structures."}`;
  }

  return `STRICT BUDGET REALISM:
This concept must be achievable within £3,500–£7,000.
Do not include pergolas, outdoor kitchens, composite decking, hot tubs, saunas, water features, large porcelain patios, extensive fencing replacement or full artificial grass replacement.
Use no more than 4–5 low-cost visual-impact features.
Prioritise retaining existing elements, repainting/staining, small hardstanding areas, gravel, simple raised planters, low-maintenance planting and limited warm lighting.
The image must look premium through styling, colour, layout and lighting — not through expensive structures.
Corrected Garden Refresh direction: ${result.correctedFeatureSet.join(", ")}.`;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    currency: "GBP",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function findCostRule(feature: string) {
  return costRules.find((rule) => rule.label === feature);
}

function getConceptFeatures(concept: ConceptValidationInput) {
  return Array.from(new Set((Array.isArray(concept) ? concept : concept.features ?? []).filter(Boolean)));
}

function getBlockedFeatures(features: string[], budgetKey: BudgetBandKey) {
  const blocked = features.filter((feature) =>
    findCostRule(feature)?.hardBlockedBudgetBands.includes(budgetKey),
  );

  if (budgetKey !== "Garden Refresh") {
    return blocked;
  }

  const refreshSpecificBlocks = features.filter((feature) =>
    ["Composite decking", "Pergola", "Outdoor kitchen", "Water feature", "Hot tub area", "Sauna / wellness area", "Garden office base", "Retaining wall"].includes(feature),
  );
  const premiumSelected = features.filter((feature) => premiumFeatureLabels.includes(feature));
  const premiumOverflow = premiumSelected.length > 1 ? premiumSelected.slice(1) : [];

  return Array.from(new Set([...blocked, ...refreshSpecificBlocks, ...premiumOverflow]));
}

function getCautionFeatures(features: string[], budgetKey: BudgetBandKey) {
  return features.filter((feature) =>
    findCostRule(feature)?.cautionBudgetBands.includes(budgetKey),
  );
}

function correctConceptFeatureSet(features: string[], budgetKey: BudgetBandKey, style?: string) {
  if (budgetKey !== "Garden Refresh") {
    return features;
  }

  if (style?.toLowerCase().includes("dark")) {
    return darkContemporaryGardenRefreshFeatures;
  }

  const corrected = features.flatMap((feature) => {
    if (gardenRefreshAlternatives[feature]) {
      return gardenRefreshAlternatives[feature];
    }

    return feature;
  });

  return Array.from(
    new Set([
      ...corrected.filter((feature) => !getBlockedFeatures([feature], budgetKey).length),
      "Low-maintenance planting",
      "Existing lawn retained",
    ]),
  ).slice(0, 6);
}

function getBudgetStatus({
  budgetKey,
  blockedFeatures,
  cautionFeatures,
  estimatedTypical,
  budgetMax,
  premiumCount,
}: {
  budgetKey: BudgetBandKey;
  blockedFeatures: string[];
  cautionFeatures: string[];
  estimatedTypical: number;
  budgetMax: number;
  premiumCount: number;
}): BudgetRealityStatus {
  if (blockedFeatures.length || (budgetKey === "Garden Refresh" && premiumCount >= 2)) {
    return "Impossible For Budget";
  }

  if (estimatedTypical > budgetMax * 1.35) {
    return "Impossible For Budget";
  }

  if (estimatedTypical > budgetMax || cautionFeatures.length >= 3) {
    return "Likely Over Budget";
  }

  if (estimatedTypical > budgetMax * 0.78 || cautionFeatures.length) {
    return "Stretch";
  }

  return "Within Range";
}

function buildReasons({
  budgetKey,
  blockedFeatures,
  cautionFeatures,
  estimatedTypical,
  budgetMax,
  premiumCount,
}: {
  budgetKey: BudgetBandKey;
  blockedFeatures: string[];
  cautionFeatures: string[];
  estimatedTypical: number;
  budgetMax: number;
  premiumCount: number;
}) {
  const reasons: string[] = [];

  if (blockedFeatures.length) {
    reasons.push(
      `${blockedFeatures.join(", ")} ${blockedFeatures.length === 1 ? "is" : "are"} not recommended within this investment level.`,
    );
  }

  if (cautionFeatures.length) {
    reasons.push(`${cautionFeatures.join(", ")} may require careful specification.`);
  }

  if (Number.isFinite(budgetMax) && estimatedTypical > budgetMax) {
    reasons.push(
      `The selected feature set has an estimated typical scope of ${formatCurrency(estimatedTypical)}, above the ${formatCurrency(budgetMax)} guide for this band.`,
    );
  }

  if (budgetKey === "Garden Refresh" && premiumCount >= 2) {
    reasons.push("Multiple premium feature zones are better suited to an Enhanced or Dream version.");
  }

  return reasons.length ? reasons : ["The selected feature set appears aligned to this investment level."];
}

function buildSuggestedCorrection(
  blockedFeatures: string[],
  cautionFeatures: string[],
  correctedFeatureSet: string[],
) {
  if (!blockedFeatures.length && !cautionFeatures.length) {
    return "Keep the concept scope controlled and avoid adding unrequested premium features.";
  }

  return `${[...blockedFeatures, ...cautionFeatures].join(", ")} should be scope-controlled or reserved for Enhanced/Dream. Suggested direction: ${correctedFeatureSet.join(", ")}.`;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}
