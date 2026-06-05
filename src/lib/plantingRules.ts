import type { PlantingMaintenance } from "@/data/types";

export type PlantingPalette = {
  style: string;
  maintenanceLevel: PlantingMaintenance | "Not sure";
  paletteSummary: string;
  preferredPlants: string[];
  avoidPlants: string[];
  maintenanceNotes: string[];
  promptInstructions: string[];
};

const stylePalettes: Record<string, string[]> = {
  Contemporary: [
    "pittosporum",
    "multi-stem amelanchier",
    "hakonechloa",
    "salvia",
    "evergreen jasmine",
  ],
  Mediterranean: [
    "olive",
    "lavender",
    "rosemary",
    "santolina",
    "thyme",
    "stipa grasses",
  ],
  Scandinavian: [
    "soft grasses",
    "ferns",
    "birch-style multi-stems",
    "evergreen shrubs",
    "white flowering perennials",
  ],
  "Resort-style": [
    "architectural grasses",
    "phormium",
    "pittosporum",
    "tree ferns in sheltered spots",
    "lush evergreen planting",
  ],
  "Natural planting": [
    "ornamental grasses",
    "verbena bonariensis",
    "echinacea",
    "geranium",
    "native-feeling meadow perennials",
  ],
  "Dark modern": [
    "black mondo grass",
    "pittosporum",
    "ferns",
    "euphorbia",
    "deep green evergreen structure",
  ],
  Minimalist: [
    "clipped evergreen forms",
    "hakonechloa",
    "simple grasses",
    "multi-stem trees",
    "low evergreen groundcover",
  ],
  "Family-friendly": [
    "durable lawn",
    "soft grasses",
    "robust shrubs",
    "sensory herbs",
    "simple evergreen planting",
  ],
};

const maintenanceAdjustments: Record<
  Exclude<PlantingMaintenance, ""> | "Not sure",
  {
    prefer: string[];
    avoid: string[];
    notes: string[];
  }
> = {
  "Low maintenance": {
    prefer: [
      "drought-tolerant planting",
      "evergreen structure",
      "slow-growing shrubs",
      "mulched planting beds",
    ],
    avoid: [
      "large areas of annual bedding",
      "high-maintenance clipped topiary",
      "plants needing frequent watering",
      "complex mixed borders requiring constant editing",
    ],
    notes: [
      "Keep planting simple, resilient and easy to care for.",
      "Use fewer species repeated confidently for a calmer design.",
    ],
  },
  "Medium maintenance": {
    prefer: [
      "seasonal perennials",
      "structured shrubs",
      "ornamental grasses",
      "selected flowering accents",
    ],
    avoid: [
      "planting that needs specialist weekly care",
      "overly delicate specimens in exposed positions",
    ],
    notes: [
      "Allow seasonal interest while keeping the planting realistic for regular homeowner care.",
    ],
  },
  "High maintenance": {
    prefer: [
      "layered perennial borders",
      "clipped forms",
      "seasonal containers",
      "more expressive specimen planting",
    ],
    avoid: ["invasive plants", "plants unsuitable for the likely garden conditions"],
    notes: [
      "A richer planting scheme can be explored, while still remaining buildable and appropriate.",
    ],
  },
  "Not sure": {
    prefer: ["balanced evergreen structure", "moderate-care perennials", "resilient shrubs"],
    avoid: ["planting that looks impressive only with intensive upkeep"],
    notes: ["Use a balanced medium-care planting direction until maintenance appetite is confirmed."],
  },
};

export function getPlantingPalette({
  style,
  maintenanceLevel,
  colourScheme,
}: {
  style: string;
  maintenanceLevel?: PlantingMaintenance | string;
  colourScheme?: string;
}): PlantingPalette {
  const resolvedStyle = style || "Contemporary";
  const resolvedMaintenance = resolveMaintenanceLevel(maintenanceLevel);
  const resolvedColourScheme = colourScheme || "Not sure";
  const basePlants = stylePalettes[resolvedStyle] ?? stylePalettes.Contemporary;
  const adjustment = maintenanceAdjustments[resolvedMaintenance];
  const preferredPlants = unique([...basePlants, ...adjustment.prefer]);

  return {
    style: resolvedStyle,
    maintenanceLevel: resolvedMaintenance,
    paletteSummary: `${resolvedStyle} planting with a ${resolvedMaintenance.toLowerCase()} care profile and ${resolvedColourScheme.toLowerCase()} colour direction.`,
    preferredPlants,
    avoidPlants: adjustment.avoid,
    maintenanceNotes: adjustment.notes,
    promptInstructions: [
      `Use a planting palette consistent with ${resolvedStyle} and ${resolvedMaintenance.toLowerCase()}.`,
      `Colour direction: ${resolvedColourScheme}.`,
      `Prefer: ${preferredPlants.join(", ")}.`,
      `Avoid: ${adjustment.avoid.join(", ")}.`,
      ...adjustment.notes,
      "Keep the planting realistic for a UK residential garden and appropriate to the selected maintenance level.",
    ],
  };
}

function resolveMaintenanceLevel(value: PlantingMaintenance | string | undefined) {
  if (
    value === "Low maintenance" ||
    value === "Medium maintenance" ||
    value === "High maintenance"
  ) {
    return value;
  }

  return "Not sure";
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}
