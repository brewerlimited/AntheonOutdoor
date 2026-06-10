import type {
  ExistingGardenPlan,
  GardenBriefLead,
  LayoutConcept,
  ScaleInformation,
} from "@/data/types";
import type { StyleGuide } from "@/lib/styleGuides";

export type ConceptBriefInput = {
  lead: GardenBriefLead;
  existingPlan?: ExistingGardenPlan;
  scaleInfo?: ScaleInformation;
  budgetBand: string;
  selectedStyle: string;
  mustHaves: string[];
  niceToHaves: string[];
  budgetRules: string;
  styleGuide: StyleGuide;
};

export const defaultLayoutConcepts: LayoutConcept[] = [
  {
    id: "A",
    conceptName: "Concept A",
    image: undefined,
    designIntent: "",
    layoutSummary: "",
    keyFeatures: "",
    featurePlacements: "",
    whyItFitsBudget: "",
    whyItFitsStyle: "",
    risksOrWatchouts: "",
    jackNotes: "",
    status: "Draft",
  },
  {
    id: "B",
    conceptName: "Concept B",
    image: undefined,
    designIntent: "",
    layoutSummary: "",
    keyFeatures: "",
    featurePlacements: "",
    whyItFitsBudget: "",
    whyItFitsStyle: "",
    risksOrWatchouts: "",
    jackNotes: "",
    status: "Draft",
  },
  {
    id: "C",
    conceptName: "Concept C",
    image: undefined,
    designIntent: "",
    layoutSummary: "",
    keyFeatures: "",
    featurePlacements: "",
    whyItFitsBudget: "",
    whyItFitsStyle: "",
    risksOrWatchouts: "",
    jackNotes: "",
    status: "Draft",
  },
];

export function buildConceptBrief({
  lead,
  existingPlan,
  scaleInfo,
  budgetBand,
  selectedStyle,
  mustHaves,
  niceToHaves,
  budgetRules,
  styleGuide,
}: ConceptBriefInput) {
  const area = calculateArea(scaleInfo);

  return `Anthēon Outdoor Design Studio - AI Layout Concept Brief

Use the uploaded existing top-down garden plan as the source of truth.
Do not generate images. Produce layout thinking only.

Customer:
- Name: ${lead.fullName}
- Address/postcode: ${lead.address || "Not provided"}
- Project type: ${lead.projectType || "Not selected"}
- Customer notes: ${lead.notes || "No notes provided"}

Existing garden plan:
- Source: ${existingPlan?.source || "Not recorded"}
- Notes: ${existingPlan?.notes || "No existing plan notes yet"}
- Plan image uploaded: ${existingPlan?.image?.fileName || existingPlan?.image?.imageUrl ? "Yes" : "No"}

Scale information:
- Width: ${scaleInfo?.gardenWidth || "Unknown"}
- Length: ${scaleInfo?.gardenLength || "Unknown"}
- Unit: ${scaleInfo?.unit || "Not recorded"}
- Approximate area: ${area ? `${area} sq ${scaleInfo?.unit || ""}` : "Not calculated"}
- Scale notes: ${scaleInfo?.scaleNotes || "No scale notes yet"}

Budget and style:
- Budget band: ${budgetBand || "Not selected"}
- Selected style: ${selectedStyle || "To be refined"}
- Budget restrictions: ${budgetRules}

Requested features:
- Must-haves: ${list(mustHaves)}
- Nice-to-haves: ${list(niceToHaves)}

Style guide:
- Summary: ${styleGuide.summary}
- Should contain: ${list(styleGuide.shouldContain)}
- Key materials: ${list(styleGuide.keyMaterials)}
- Planting direction: ${list(styleGuide.plantingDirection)}
- Budget-sensitive alternatives: ${list(styleGuide.budgetSensitiveAlternatives)}
- Avoid: ${list(styleGuide.avoid)}
- Sketch guidance: ${list(styleGuide.sketchGuidance)}

Task:
Create Concept A, Concept B and Concept C as three different realistic layout options.
Each concept should explain zones, feature placement, budget fit, style fit and risks.
Respect the house footprint, garden boundaries, neighbouring properties, scale and access constraints.`;
}

export function calculateArea(scaleInfo?: ScaleInformation) {
  const width = Number(scaleInfo?.gardenWidth);
  const length = Number(scaleInfo?.gardenLength);

  if (!Number.isFinite(width) || !Number.isFinite(length) || width <= 0 || length <= 0) {
    return undefined;
  }

  return Number((width * length).toFixed(1));
}

function list(items: string[]) {
  return items.length ? items.join(", ") : "None specified";
}
