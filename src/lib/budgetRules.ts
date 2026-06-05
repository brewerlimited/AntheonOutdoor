export type BudgetBandKey =
  | "Garden Refresh"
  | "Signature Transformation"
  | "Outdoor Living"
  | "Luxury Outdoor Space"
  | "Not sure yet";

export type BudgetPressure = "Low" | "Medium" | "High" | "Very High";
export type GardenSize = "Small" | "Medium" | "Large" | "Unsure" | "";

export type GardenFeatureRule = {
  label: string;
  category: string;
  estimatedMin: number;
  estimatedMax: number;
  budgetSuitability: string;
  notes: string;
  allowedInBudgetBands: BudgetBandKey[];
  cautionInBudgetBands: BudgetBandKey[];
};

export type BudgetFitResult = {
  approvedMustHaves: string[];
  cautionMustHaves: string[];
  excludedMustHaves: string[];
  approvedNiceToHaves: string[];
  excludedNiceToHaves: string[];
  estimatedBudgetPressure: BudgetPressure;
  budgetGuidance: string;
  withinBudgetFeatures: string[];
  enhancedDesignFeatures: string[];
  dreamVersionFeatures: string[];
};

export const budgetBandLabels: BudgetBandKey[] = [
  "Garden Refresh",
  "Signature Transformation",
  "Outdoor Living",
  "Luxury Outdoor Space",
  "Not sure yet",
];

const budgetBandCeilings: Record<BudgetBandKey, number> = {
  "Garden Refresh": 7500,
  "Signature Transformation": 15000,
  "Outdoor Living": 30000,
  "Luxury Outdoor Space": 60000,
  "Not sure yet": 0,
};

const premiumScopeFeatures = [
  "Porcelain patio",
  "Composite decking",
  "Pergola",
  "Outdoor kitchen",
  "Water feature",
  "Hot tub area",
  "Sauna / wellness area",
  "Garden office base",
  "Retaining wall",
  "Fencing",
];

export const gardenFeatureRules: GardenFeatureRule[] = [
  {
    label: "Porcelain patio",
    category: "Surfaces",
    estimatedMin: 4500,
    estimatedMax: 22000,
    budgetSuitability: "Best when the size and specification match the chosen investment level.",
    notes: "Small refresh areas can work at entry level; larger schemes suit higher budgets.",
    allowedInBudgetBands: ["Signature Transformation", "Outdoor Living", "Luxury Outdoor Space"],
    cautionInBudgetBands: ["Garden Refresh", "Not sure yet"],
  },
  {
    label: "Composite decking",
    category: "Surfaces",
    estimatedMin: 3500,
    estimatedMax: 16000,
    budgetSuitability: "Suitable where the deck is a defined zone rather than the whole garden.",
    notes: "Specification, subframe and levels can change cost materially.",
    allowedInBudgetBands: ["Signature Transformation", "Outdoor Living", "Luxury Outdoor Space"],
    cautionInBudgetBands: ["Garden Refresh", "Not sure yet"],
  },
  {
    label: "Pergola",
    category: "Outdoor living",
    estimatedMin: 3500,
    estimatedMax: 24000,
    budgetSuitability: "Works well when sized carefully for the budget.",
    notes: "Premium or large pergolas are better suited to higher investment versions.",
    allowedInBudgetBands: ["Signature Transformation", "Outdoor Living", "Luxury Outdoor Space"],
    cautionInBudgetBands: ["Garden Refresh", "Not sure yet"],
  },
  {
    label: "Outdoor kitchen",
    category: "Outdoor living",
    estimatedMin: 6000,
    estimatedMax: 35000,
    budgetSuitability: "Usually most appropriate from Outdoor Living upward.",
    notes: "A simple cooking station can sometimes fit; larger kitchens can quickly dominate budget.",
    allowedInBudgetBands: ["Outdoor Living", "Luxury Outdoor Space"],
    cautionInBudgetBands: ["Signature Transformation", "Not sure yet"],
  },
  {
    label: "Fire pit",
    category: "Atmosphere",
    estimatedMin: 900,
    estimatedMax: 7500,
    budgetSuitability: "A good flexible feature if the surrounding zone is kept focused.",
    notes: "Built-in seating and premium finishes increase scope.",
    allowedInBudgetBands: ["Signature Transformation", "Outdoor Living", "Luxury Outdoor Space"],
    cautionInBudgetBands: ["Garden Refresh", "Not sure yet"],
  },
  {
    label: "Garden lighting",
    category: "Atmosphere",
    estimatedMin: 800,
    estimatedMax: 10000,
    budgetSuitability: "Scales well from simple low-voltage lighting to architectural schemes.",
    notes: "Basic lighting can fit a refresh; premium layered lighting suits higher bands.",
    allowedInBudgetBands: [
      "Garden Refresh",
      "Signature Transformation",
      "Outdoor Living",
      "Luxury Outdoor Space",
    ],
    cautionInBudgetBands: ["Not sure yet"],
  },
  {
    label: "Seating area",
    category: "Layout",
    estimatedMin: 1200,
    estimatedMax: 12000,
    budgetSuitability: "One of the most adaptable features across all investment levels.",
    notes: "Cost depends on surface, furniture allowance and built-in details.",
    allowedInBudgetBands: [
      "Garden Refresh",
      "Signature Transformation",
      "Outdoor Living",
      "Luxury Outdoor Space",
    ],
    cautionInBudgetBands: ["Not sure yet"],
  },
  {
    label: "Artificial grass",
    category: "Planting and lawn",
    estimatedMin: 1500,
    estimatedMax: 9500,
    budgetSuitability: "Can fit lower bands when used in smaller, defined areas.",
    notes: "Preparation and area size are the main cost drivers.",
    allowedInBudgetBands: [
      "Garden Refresh",
      "Signature Transformation",
      "Outdoor Living",
      "Luxury Outdoor Space",
    ],
    cautionInBudgetBands: ["Not sure yet"],
  },
  {
    label: "Real lawn",
    category: "Planting and lawn",
    estimatedMin: 900,
    estimatedMax: 6500,
    budgetSuitability: "Generally suitable across all budgets.",
    notes: "Drainage, levelling and access can affect scope.",
    allowedInBudgetBands: [
      "Garden Refresh",
      "Signature Transformation",
      "Outdoor Living",
      "Luxury Outdoor Space",
    ],
    cautionInBudgetBands: ["Not sure yet"],
  },
  {
    label: "Raised planters",
    category: "Planting and lawn",
    estimatedMin: 900,
    estimatedMax: 8500,
    budgetSuitability: "A strong way to add structure without overcomplicating the build.",
    notes: "Bespoke masonry or large runs increase budget pressure.",
    allowedInBudgetBands: [
      "Garden Refresh",
      "Signature Transformation",
      "Outdoor Living",
      "Luxury Outdoor Space",
    ],
    cautionInBudgetBands: ["Not sure yet"],
  },
  {
    label: "Water feature",
    category: "Atmosphere",
    estimatedMin: 2500,
    estimatedMax: 18000,
    budgetSuitability: "Most convincing when the wider garden budget can support it.",
    notes: "Power, water supply, maintenance and bespoke detailing need consideration.",
    allowedInBudgetBands: ["Luxury Outdoor Space"],
    cautionInBudgetBands: ["Signature Transformation", "Outdoor Living", "Not sure yet"],
  },
  {
    label: "Privacy screening",
    category: "Boundaries",
    estimatedMin: 1200,
    estimatedMax: 12000,
    budgetSuitability: "Works across budgets when the length and material are controlled.",
    notes: "Bespoke screens and long boundary runs raise the investment level.",
    allowedInBudgetBands: [
      "Garden Refresh",
      "Signature Transformation",
      "Outdoor Living",
      "Luxury Outdoor Space",
    ],
    cautionInBudgetBands: ["Not sure yet"],
  },
  {
    label: "Hot tub area",
    category: "Wellness",
    estimatedMin: 3500,
    estimatedMax: 22000,
    budgetSuitability: "Best from Outdoor Living upward, especially if services or structure are needed.",
    notes: "May fit lower bands only where the hot tub already exists and the surrounding scope is small.",
    allowedInBudgetBands: ["Outdoor Living", "Luxury Outdoor Space"],
    cautionInBudgetBands: ["Signature Transformation", "Not sure yet"],
  },
  {
    label: "Sauna / wellness area",
    category: "Wellness",
    estimatedMin: 12000,
    estimatedMax: 45000,
    budgetSuitability: "Usually a premium feature for a higher investment version.",
    notes: "Structure, power, base, privacy and access all need careful planning.",
    allowedInBudgetBands: ["Luxury Outdoor Space"],
    cautionInBudgetBands: ["Outdoor Living", "Not sure yet"],
  },
  {
    label: "Children’s play space",
    category: "Family",
    estimatedMin: 800,
    estimatedMax: 8500,
    budgetSuitability: "Can be worked into most budgets when integrated simply.",
    notes: "Bespoke play structures or surfacing increase scope.",
    allowedInBudgetBands: [
      "Garden Refresh",
      "Signature Transformation",
      "Outdoor Living",
      "Luxury Outdoor Space",
    ],
    cautionInBudgetBands: ["Not sure yet"],
  },
  {
    label: "Low-maintenance planting",
    category: "Planting and lawn",
    estimatedMin: 900,
    estimatedMax: 12000,
    budgetSuitability: "A strong fit across all budget levels.",
    notes: "Mature planting and large beds increase the specification.",
    allowedInBudgetBands: [
      "Garden Refresh",
      "Signature Transformation",
      "Outdoor Living",
      "Luxury Outdoor Space",
    ],
    cautionInBudgetBands: ["Not sure yet"],
  },
  {
    label: "Storage",
    category: "Practical",
    estimatedMin: 500,
    estimatedMax: 7000,
    budgetSuitability: "Useful and realistic across most projects.",
    notes: "Integrated or bespoke storage is more suited to higher bands.",
    allowedInBudgetBands: [
      "Garden Refresh",
      "Signature Transformation",
      "Outdoor Living",
      "Luxury Outdoor Space",
    ],
    cautionInBudgetBands: ["Not sure yet"],
  },
  {
    label: "Garden office base",
    category: "Practical",
    estimatedMin: 2500,
    estimatedMax: 14000,
    budgetSuitability: "Can work where the base is clearly scoped and services are understood.",
    notes: "This does not include the garden office building itself.",
    allowedInBudgetBands: ["Signature Transformation", "Outdoor Living", "Luxury Outdoor Space"],
    cautionInBudgetBands: ["Garden Refresh", "Not sure yet"],
  },
  {
    label: "Pathway",
    category: "Layout",
    estimatedMin: 900,
    estimatedMax: 8000,
    budgetSuitability: "Suitable across budgets when material and length are controlled.",
    notes: "Premium paving or complex levels increase scope.",
    allowedInBudgetBands: [
      "Garden Refresh",
      "Signature Transformation",
      "Outdoor Living",
      "Luxury Outdoor Space",
    ],
    cautionInBudgetBands: ["Not sure yet"],
  },
  {
    label: "Retaining wall",
    category: "Structure",
    estimatedMin: 3500,
    estimatedMax: 30000,
    budgetSuitability: "Can consume budget quickly and should be specified carefully.",
    notes: "Major retaining walls, excavation and engineering are better suited to higher investment levels.",
    allowedInBudgetBands: ["Luxury Outdoor Space"],
    cautionInBudgetBands: ["Signature Transformation", "Outdoor Living", "Not sure yet"],
  },
  {
    label: "Fencing",
    category: "Boundaries",
    estimatedMin: 900,
    estimatedMax: 15000,
    budgetSuitability: "Repairs or selected sections fit lower bands; full premium boundaries need more budget.",
    notes: "Length, access and material specification are the main variables.",
    allowedInBudgetBands: [
      "Garden Refresh",
      "Signature Transformation",
      "Outdoor Living",
      "Luxury Outdoor Space",
    ],
    cautionInBudgetBands: ["Not sure yet"],
  },
];

export function getBudgetBandKey(budgetBand: string): BudgetBandKey {
  const match = budgetBandLabels.find((label) => budgetBand.startsWith(label));
  return match ?? "Not sure yet";
}

export function calculateBudgetFit({
  budgetBand,
  gardenSize,
  mustHaves,
  niceToHaves,
}: {
  budgetBand: string;
  gardenSize?: GardenSize | string;
  mustHaves: string[];
  niceToHaves: string[];
}): BudgetFitResult {
  const budgetKey = getBudgetBandKey(budgetBand);
  const uniqueMustHaves = unique(mustHaves);
  const uniqueNiceToHaves = unique(niceToHaves).filter((feature) => !uniqueMustHaves.includes(feature));

  let approvedMustHaves = uniqueMustHaves.filter((feature) => isAllowed(feature, budgetKey));
  let cautionMustHaves = uniqueMustHaves.filter((feature) => isCaution(feature, budgetKey));
  let excludedMustHaves = uniqueMustHaves.filter(
    (feature) => !approvedMustHaves.includes(feature) && !cautionMustHaves.includes(feature),
  );
  let approvedNiceToHaves = uniqueNiceToHaves.filter(
    (feature) => isAllowed(feature, budgetKey) || isCaution(feature, budgetKey),
  );
  let excludedNiceToHaves = uniqueNiceToHaves.filter(
    (feature) => !approvedNiceToHaves.includes(feature),
  );

  ({
    approvedMustHaves,
    cautionMustHaves,
    excludedMustHaves,
    approvedNiceToHaves,
    excludedNiceToHaves,
  } = applyAggregateScopeControl({
    budgetKey,
    gardenSize,
    approvedMustHaves,
    cautionMustHaves,
    excludedMustHaves,
    approvedNiceToHaves,
    excludedNiceToHaves,
  }));

  const estimatedBudgetPressure = getBudgetPressure({
    budgetKey,
    gardenSize,
    approvedMustHaves,
    cautionMustHaves,
    excludedMustHaves,
    approvedNiceToHaves,
    excludedNiceToHaves,
  });

  const budgetGuidance = getBudgetGuidance({
    budgetKey,
    gardenSize,
    approvedMustHaves,
    cautionMustHaves,
    excludedMustHaves,
    approvedNiceToHaves,
    excludedNiceToHaves,
    estimatedBudgetPressure,
  });

  const enhancedDesignFeatures = unique([
    ...approvedMustHaves,
    ...approvedNiceToHaves,
    ...cautionMustHaves,
  ]);

  return {
    approvedMustHaves,
    cautionMustHaves,
    excludedMustHaves,
    approvedNiceToHaves,
    excludedNiceToHaves,
    estimatedBudgetPressure,
    budgetGuidance,
    withinBudgetFeatures: approvedMustHaves,
    enhancedDesignFeatures,
    dreamVersionFeatures: unique([...uniqueMustHaves, ...uniqueNiceToHaves]),
  };
}

function isAllowed(feature: string, budgetKey: BudgetBandKey) {
  const rule = findRule(feature);
  if (!rule) {
    return budgetKey === "Not sure yet";
  }

  return rule.allowedInBudgetBands.includes(budgetKey);
}

function isCaution(feature: string, budgetKey: BudgetBandKey) {
  const rule = findRule(feature);
  if (!rule) {
    return false;
  }

  return rule.cautionInBudgetBands.includes(budgetKey);
}

function findRule(feature: string) {
  return gardenFeatureRules.find((rule) => rule.label === feature);
}

function applyAggregateScopeControl({
  budgetKey,
  gardenSize,
  approvedMustHaves,
  cautionMustHaves,
  excludedMustHaves,
  approvedNiceToHaves,
  excludedNiceToHaves,
}: {
  budgetKey: BudgetBandKey;
  gardenSize?: GardenSize | string;
  approvedMustHaves: string[];
  cautionMustHaves: string[];
  excludedMustHaves: string[];
  approvedNiceToHaves: string[];
  excludedNiceToHaves: string[];
}) {
  const ceiling = budgetBandCeilings[budgetKey];

  if (!ceiling) {
    return {
      approvedMustHaves,
      cautionMustHaves,
      excludedMustHaves,
      approvedNiceToHaves,
      excludedNiceToHaves,
    };
  }

  const selectedMustHaves = unique([...approvedMustHaves, ...cautionMustHaves]);
  const selectedFeatures = unique([...selectedMustHaves, ...approvedNiceToHaves]);
  const selectedMinimum = getEstimatedMinimum(selectedFeatures);
  const premiumCount = selectedFeatures.filter((feature) =>
    premiumScopeFeatures.includes(feature),
  ).length;
  const maxMustHaveCount = getMaxMustHaveCount(budgetKey, gardenSize);
  const targetScope = ceiling * getTargetScopeRatio(budgetKey);
  const overloaded =
    selectedMinimum > targetScope ||
    selectedMustHaves.length > maxMustHaveCount ||
    premiumCount > getPremiumFeatureLimit(budgetKey);

  if (!overloaded) {
    return {
      approvedMustHaves,
      cautionMustHaves,
      excludedMustHaves,
      approvedNiceToHaves,
      excludedNiceToHaves,
    };
  }

  let runningMinimum = getEstimatedMinimum(selectedMustHaves);
  const reservedMustHaves: string[] = [];
  const candidates = [...selectedMustHaves].sort(
    (left, right) =>
      getReservePriority(right, budgetKey) - getReservePriority(left, budgetKey),
  );

  for (const feature of candidates) {
    const remainingCount = selectedMustHaves.length - reservedMustHaves.length;
    const stillTooLarge =
      runningMinimum > targetScope ||
      remainingCount > maxMustHaveCount ||
      countPremiumFeatures(selectedMustHaves, reservedMustHaves) >
        getPremiumFeatureLimit(budgetKey);

    if (!stillTooLarge || remainingCount <= 3) {
      break;
    }

    reservedMustHaves.push(feature);
    runningMinimum -= findRule(feature)?.estimatedMin ?? 0;
  }

  const reservedSet = new Set(reservedMustHaves);
  const nextApprovedMustHaves = approvedMustHaves.filter((feature) => !reservedSet.has(feature));
  const nextCautionMustHaves = cautionMustHaves.filter((feature) => !reservedSet.has(feature));
  const reservedNiceToHaves =
    selectedMinimum > ceiling || approvedNiceToHaves.length > 2 ? approvedNiceToHaves : [];
  const reservedNiceSet = new Set(reservedNiceToHaves);

  return {
    approvedMustHaves: nextApprovedMustHaves,
    cautionMustHaves: nextCautionMustHaves,
    excludedMustHaves: unique([...excludedMustHaves, ...reservedMustHaves]),
    approvedNiceToHaves: approvedNiceToHaves.filter((feature) => !reservedNiceSet.has(feature)),
    excludedNiceToHaves: unique([...excludedNiceToHaves, ...reservedNiceToHaves]),
  };
}

function getEstimatedMinimum(features: string[]) {
  return features.reduce((total, feature) => total + (findRule(feature)?.estimatedMin ?? 0), 0);
}

function getReservePriority(feature: string, budgetKey: BudgetBandKey) {
  const rule = findRule(feature);
  const premiumWeight = premiumScopeFeatures.includes(feature) ? 9000 : 0;
  const cautionWeight = isCaution(feature, budgetKey) ? 7000 : 0;

  return (rule?.estimatedMin ?? 0) + premiumWeight + cautionWeight;
}

function countPremiumFeatures(features: string[], reserved: string[]) {
  return features.filter(
    (feature) => premiumScopeFeatures.includes(feature) && !reserved.includes(feature),
  ).length;
}

function getTargetScopeRatio(budgetKey: BudgetBandKey) {
  if (budgetKey === "Garden Refresh") {
    return 0.72;
  }

  if (budgetKey === "Signature Transformation") {
    return 0.76;
  }

  if (budgetKey === "Outdoor Living") {
    return 0.82;
  }

  return 0.9;
}

function getMaxMustHaveCount(budgetKey: BudgetBandKey, gardenSize?: GardenSize | string) {
  const largeGardenAdjustment = gardenSize === "Large" ? -1 : 0;

  if (budgetKey === "Garden Refresh") {
    return 4 + largeGardenAdjustment;
  }

  if (budgetKey === "Signature Transformation") {
    return 6 + largeGardenAdjustment;
  }

  if (budgetKey === "Outdoor Living") {
    return 9 + largeGardenAdjustment;
  }

  return 14 + largeGardenAdjustment;
}

function getPremiumFeatureLimit(budgetKey: BudgetBandKey) {
  if (budgetKey === "Garden Refresh") {
    return 1;
  }

  if (budgetKey === "Signature Transformation") {
    return 2;
  }

  if (budgetKey === "Outdoor Living") {
    return 4;
  }

  return 7;
}

function getBudgetPressure({
  budgetKey,
  gardenSize,
  approvedMustHaves,
  cautionMustHaves,
  excludedMustHaves,
  approvedNiceToHaves,
  excludedNiceToHaves,
}: {
  budgetKey: BudgetBandKey;
  gardenSize?: GardenSize | string;
  approvedMustHaves: string[];
  cautionMustHaves: string[];
  excludedMustHaves: string[];
  approvedNiceToHaves: string[];
  excludedNiceToHaves: string[];
}): BudgetPressure {
  const premiumCount = [
    ...approvedMustHaves,
    ...cautionMustHaves,
    ...approvedNiceToHaves,
  ].filter((feature) =>
    [
      "Outdoor kitchen",
      "Hot tub area",
      "Sauna / wellness area",
      "Water feature",
      "Retaining wall",
      "Pergola",
      "Porcelain patio",
    ].includes(feature),
  ).length;

  const pressureScore =
    cautionMustHaves.length * 2 +
    excludedMustHaves.length * 3 +
    excludedNiceToHaves.length +
    Math.max(0, approvedNiceToHaves.length - 3) +
    (budgetKey === "Luxury Outdoor Space" && premiumCount >= 4 ? 3 : 0) +
    getGardenSizePressure(gardenSize, budgetKey, approvedMustHaves.length + approvedNiceToHaves.length);

  if (pressureScore >= 7) {
    return "Very High";
  }

  if (pressureScore >= 4) {
    return "High";
  }

  if (pressureScore >= 2 || premiumCount >= 3) {
    return "Medium";
  }

  return "Low";
}

function getBudgetGuidance({
  budgetKey,
  gardenSize,
  approvedMustHaves,
  cautionMustHaves,
  excludedMustHaves,
  approvedNiceToHaves,
  excludedNiceToHaves,
  estimatedBudgetPressure,
}: {
  budgetKey: BudgetBandKey;
  gardenSize?: GardenSize | string;
  approvedMustHaves: string[];
  cautionMustHaves: string[];
  excludedMustHaves: string[];
  approvedNiceToHaves: string[];
  excludedNiceToHaves: string[];
  estimatedBudgetPressure: BudgetPressure;
}) {
  const sizeGuidance = getGardenSizeGuidance(gardenSize, budgetKey);

  if (budgetKey === "Not sure yet") {
    return joinGuidance(
      "We can use your feature choices and garden size to shape a considered investment range, then prepare Within Budget, Enhanced and Dream versions for review.",
      sizeGuidance,
    );
  }

  if (!approvedMustHaves.length && !cautionMustHaves.length && !excludedMustHaves.length) {
    return joinGuidance(
      `Select your priority features and we will show how they align with a ${budgetKey} investment level.`,
      sizeGuidance,
    );
  }

  if (excludedMustHaves.length || estimatedBudgetPressure === "Very High") {
    return joinGuidance(
      "Several selected features are more suited to a higher investment level. We can still prepare a Within Budget version, but some items may need to move into the Enhanced or Dream version.",
      sizeGuidance,
    );
  }

  if (cautionMustHaves.length || estimatedBudgetPressure === "High") {
    return joinGuidance(
      `Your selected must-haves can be explored within a ${budgetKey} direction, provided the specification and scale are carefully controlled.`,
      sizeGuidance,
    );
  }

  if (approvedNiceToHaves.length && !excludedNiceToHaves.length) {
    return joinGuidance(
      `Your selected must-haves are generally suitable for a ${budgetKey} budget, with selected nice-to-haves available for an Enhanced Design version if budget remains.`,
      sizeGuidance,
    );
  }

  return joinGuidance(
    `Your selected must-haves are generally suitable for a ${budgetKey} budget, provided the works are kept focused and well specified.`,
    sizeGuidance,
  );
}

function getGardenSizePressure(
  gardenSize: GardenSize | string | undefined,
  budgetKey: BudgetBandKey,
  selectedFeatureCount: number,
) {
  if (gardenSize === "Large" && budgetKey === "Garden Refresh") {
    return 3;
  }

  if (gardenSize === "Large" && budgetKey === "Signature Transformation") {
    return 2;
  }

  if (gardenSize === "Large" && selectedFeatureCount >= 5) {
    return 2;
  }

  if (gardenSize === "Medium" && budgetKey === "Garden Refresh" && selectedFeatureCount >= 4) {
    return 1;
  }

  return 0;
}

function getGardenSizeGuidance(
  gardenSize: GardenSize | string | undefined,
  budgetKey: BudgetBandKey,
) {
  if (gardenSize === "Large" && budgetKey === "Garden Refresh") {
    return "Because the garden is described as large, this investment level is best treated as a focused refresh zone rather than a whole-garden transformation.";
  }

  if (gardenSize === "Large" && budgetKey === "Signature Transformation") {
    return "Because the garden is described as large, the design may need to prioritise key zones first and reserve wider garden coverage for an Enhanced or Dream version.";
  }

  if (gardenSize === "Small") {
    return "Because the garden is described as small, a focused feature set can often feel more complete at this investment level.";
  }

  return "";
}

function joinGuidance(primary: string, secondary: string) {
  return secondary ? `${primary} ${secondary}` : primary;
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}
