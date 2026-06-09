import type { GardenBriefLead } from "@/data/types";
import { calculateBudgetFit } from "@/lib/budgetRules";
import {
  createVersionDesignMemories,
  type DesignMemory,
  type DesignVersion,
} from "@/lib/designMemory";

export type ProposalVersion = {
  title: DesignVersion;
  investmentLevel: string;
  designIntent: string;
  includedFeatures: string[];
  reservedFeatures: string[];
  featurePlacements: Record<string, string>;
  budgetNotes: string;
  customerFriendlyDescription: string;
  promptReadySummary: string;
};

export type ProposalPack = {
  leadId: string;
  customerName: string;
  projectSummary: string;
  designStyleSummary: string;
  budgetSummary: string;
  layoutReviewSummary: string;
  featurePlacementSummary: string;
  existingPlanSummary: string;
  scaleSummary: string;
  layoutConceptSummary: string;
  finalLayoutSummary: string;
  masterplanSummary: string;
  heroRenderSummary: string;
  withinBudget: ProposalVersion;
  enhancedDesign: ProposalVersion;
  dreamVersion: ProposalVersion;
  nextSteps: string[];
  internalReviewChecklist: string[];
};

export const proposalChecklistItems = [
  "Budget band checked",
  "Features match selected version",
  "No duplicated major features",
  "Layout preparation reviewed",
  "Feature placement notes reviewed",
  "Plan sketch considered",
  "Excluded features not shown in Within Budget",
  "Dream Version marked as potentially above budget",
  "Customer notes considered",
  "Ready to send",
];

export function buildProposalPack(leadBrief: GardenBriefLead): ProposalPack {
  const fit = calculateBudgetFit({
    budgetBand: leadBrief.budgetBand,
    gardenSize: leadBrief.gardenSize,
    mustHaves: leadBrief.mustHaves,
    niceToHaves: leadBrief.niceToHaves,
  });
  const enrichedLead: GardenBriefLead = {
    ...leadBrief,
    approvedMustHaves: leadBrief.approvedMustHaves ?? fit.approvedMustHaves,
    cautionMustHaves: leadBrief.cautionMustHaves ?? fit.cautionMustHaves,
    excludedMustHaves: leadBrief.excludedMustHaves ?? fit.excludedMustHaves,
    approvedNiceToHaves: leadBrief.approvedNiceToHaves ?? fit.approvedNiceToHaves,
    excludedNiceToHaves: leadBrief.excludedNiceToHaves ?? fit.excludedNiceToHaves,
    withinBudgetFeatures: leadBrief.withinBudgetFeatures ?? fit.withinBudgetFeatures,
    enhancedDesignFeatures: leadBrief.enhancedDesignFeatures ?? fit.enhancedDesignFeatures,
    dreamVersionFeatures: leadBrief.dreamVersionFeatures ?? fit.dreamVersionFeatures,
    budgetGuidance: leadBrief.budgetGuidance ?? fit.budgetGuidance,
    budgetPressure: leadBrief.budgetPressure ?? fit.estimatedBudgetPressure,
  };
  const memories = createVersionDesignMemories(enrichedLead);
  const withinMemory = leadBrief.withinBudgetDesignMemory ?? memories.withinBudgetDesignMemory;
  const enhancedMemory = leadBrief.enhancedDesignMemory ?? memories.enhancedDesignMemory;
  const dreamMemory = leadBrief.dreamDesignMemory ?? memories.dreamDesignMemory;

  return {
    leadId: enrichedLead.id,
    customerName: enrichedLead.fullName,
    projectSummary: buildProjectSummary(enrichedLead),
    designStyleSummary: buildStyleSummary(enrichedLead),
    budgetSummary: `${enrichedLead.budgetBand || "Investment level to be discussed"}. ${enrichedLead.budgetGuidance ?? fit.budgetGuidance}`,
    layoutReviewSummary: buildLayoutReviewSummary(enrichedLead),
    featurePlacementSummary: buildFeaturePlacementSummary(enrichedLead),
    existingPlanSummary: buildExistingPlanSummary(enrichedLead),
    scaleSummary: buildScaleSummary(enrichedLead),
    layoutConceptSummary: buildLayoutConceptSummary(enrichedLead),
    finalLayoutSummary: buildFinalLayoutSummary(enrichedLead),
    masterplanSummary: buildMasterplanSummary(enrichedLead),
    heroRenderSummary: buildHeroRenderSummary(enrichedLead),
    withinBudget: buildVersion({
      title: "Within Budget",
      investmentLevel: enrichedLead.budgetBand,
      designIntent: "A focused design direction aligned to your selected investment level.",
      includedFeatures: withinMemory.versionFeatures,
      reservedFeatures: getReservedFeatures(enrichedLead, withinMemory.versionFeatures),
      memory: withinMemory,
      budgetNotes:
        "Focused design direction aligned to your selected investment level. Final scope and specification remain subject to consultation and survey.",
      customerFriendlyDescription:
        "A refined, controlled version built around your key must-haves and the most realistic scope for the selected investment level.",
    }),
    enhancedDesign: buildVersion({
      title: "Enhanced Design",
      investmentLevel: "Selected investment level with considered upgrades",
      designIntent: "A more complete outdoor living scheme.",
      includedFeatures: enhancedMemory.versionFeatures,
      reservedFeatures: getReservedFeatures(enrichedLead, enhancedMemory.versionFeatures),
      memory: enhancedMemory,
      budgetNotes:
        "Adds suitable nice-to-haves and carefully specified caution features where the scope remains balanced.",
      customerFriendlyDescription:
        "A fuller visual direction that adds selected upgrades while keeping the overall scheme practical and buildable.",
    }),
    dreamVersion: buildVersion({
      title: "Dream Version",
      investmentLevel: "Aspirational investment version",
      designIntent: "The full aspirational version, still grounded in a buildable garden layout.",
      includedFeatures: dreamMemory.versionFeatures,
      reservedFeatures: [],
      memory: dreamMemory,
      budgetNotes: "This version may exceed your selected investment level.",
      customerFriendlyDescription:
        "The broadest design direction, using all requested features where physically sensible. This version may exceed your selected investment level.",
    }),
    nextSteps: [
      "Review the three proposal versions and note which direction feels closest.",
      "Talk through budget, priorities and any features that need refining.",
      "Move toward a clearer scope before survey, specification or formal quotation.",
    ],
    internalReviewChecklist: proposalChecklistItems,
  };
}

export function buildCustomerSummary(pack: ProposalPack) {
  return `Hi ${pack.customerName || "there"},

We’ve reviewed your garden brief, photos and preferred investment level.

Based on what you’ve shared, we’ve prepared three design directions:

1. Within Budget — a focused version built around your key must-haves.
2. Enhanced Design — a more complete outdoor living scheme with selected upgrades.
3. Dream Version — the full aspirational version, which may exceed your selected budget.

We’ll run through these with you and refine the direction before anything moves forward.`;
}

function buildVersion({
  title,
  investmentLevel,
  designIntent,
  includedFeatures,
  reservedFeatures,
  memory,
  budgetNotes,
  customerFriendlyDescription,
}: {
  title: DesignVersion;
  investmentLevel: string;
  designIntent: string;
  includedFeatures: string[];
  reservedFeatures: string[];
  memory: DesignMemory;
  budgetNotes: string;
  customerFriendlyDescription: string;
}): ProposalVersion {
  return {
    title,
    investmentLevel,
    designIntent,
    includedFeatures,
    reservedFeatures,
    featurePlacements: memory.lockedFeaturePlacements,
    budgetNotes,
    customerFriendlyDescription,
    promptReadySummary: `${title}: ${designIntent} Include ${list(includedFeatures)}. Reserve ${list(reservedFeatures)}. Keep placements locked as ${placementSummary(memory.lockedFeaturePlacements)}.`,
  };
}

function buildProjectSummary(lead: GardenBriefLead) {
  const prep = lead.adminLayoutPreparation;

  return `${lead.projectType || "Garden project"} for a garden reviewed from the customer brief, labelled photos and address context. Shape: ${prep?.gardenShape || lead.gardenShape || "to be confirmed"}. House position: ${prep?.housePosition || lead.housePosition || "to be confirmed"}.`;
}

function buildStyleSummary(lead: GardenBriefLead) {
  const maintenance = lead.plantingMaintenance || "maintenance level to be confirmed";
  const colourScheme = lead.plantingColourScheme || "colour direction to be confirmed";

  return `${lead.preferredStyle || "Style to be refined"} visual direction with ${maintenance.toLowerCase()} planting, ${colourScheme.toLowerCase()} tones and ${list(lead.mustHaves)} as priority features.`;
}

function getReservedFeatures(lead: GardenBriefLead, includedFeatures: string[]) {
  const requested = lead.dreamVersionFeatures ?? [...lead.mustHaves, ...lead.niceToHaves];

  return requested.filter((feature) => !includedFeatures.includes(feature));
}

function buildLayoutReviewSummary(lead: GardenBriefLead) {
  const prep = lead.adminLayoutPreparation;

  if (!prep) {
    return "Layout review to be prepared from the address, labelled photos and Jack's plan sketch.";
  }

  return [
    prep.googleMapsReviewNotes ? `Google Maps: ${prep.googleMapsReviewNotes}` : "",
    prep.existingLayoutNotes ? `Existing layout: ${prep.existingLayoutNotes}` : "",
    prep.constraintsAccessNotes ? `Constraints/access: ${prep.constraintsAccessNotes}` : "",
    prep.sketchNotes ? `Sketch notes: ${prep.sketchNotes}` : "",
    prep.initialPlanDirectionNotes ? `Plan direction: ${prep.initialPlanDirectionNotes}` : "",
  ]
    .filter(Boolean)
    .join(" ") || "Layout review to be prepared from the address, labelled photos and Jack's plan sketch.";
}

function buildFeaturePlacementSummary(lead: GardenBriefLead) {
  if (!lead.featurePlacementNotes?.length) {
    return "Feature placement notes to be prepared before consultation.";
  }

  return lead.featurePlacementNotes
    .map((note) => `${note.feature}: ${note.placement}`)
    .join("; ");
}

function buildExistingPlanSummary(lead: GardenBriefLead) {
  const plan = lead.existingGardenPlan;

  if (!plan) {
    return "Existing garden plan not uploaded yet.";
  }

  return `${plan.image?.fileName || "Plan image to be uploaded"} from ${plan.source || "source not recorded"}. ${plan.notes || ""}`.trim();
}

function buildScaleSummary(lead: GardenBriefLead) {
  const scale = lead.scaleInformation;

  if (!scale) {
    return "Scale information not recorded yet.";
  }

  return `${scale.gardenWidth || "?"} x ${scale.gardenLength || "?"} ${scale.unit || ""}. Area: ${scale.calculatedArea ? `${scale.calculatedArea} sq ${scale.unit || ""}` : "not calculated"}. ${scale.scaleNotes || ""}`.trim();
}

function buildLayoutConceptSummary(lead: GardenBriefLead) {
  if (!lead.layoutConcepts?.length) {
    return "AI layout concepts A/B/C not recorded yet.";
  }

  return lead.layoutConcepts
    .map((concept) => `Concept ${concept.id}: ${concept.conceptName || "Unnamed"} (${concept.status})`)
    .join("; ");
}

function buildFinalLayoutSummary(lead: GardenBriefLead) {
  const final = lead.finalLayoutDirection;

  if (!final) {
    return "Final layout direction not selected yet.";
  }

  return `${final.selectedConceptSource || "No source selected"}: ${final.finalLayoutSummary || "summary to be written"}`;
}

function buildMasterplanSummary(lead: GardenBriefLead) {
  return `${lead.masterplan?.status || "Not Started"}: ${lead.masterplan?.notes || "Final masterplan not uploaded yet."}`;
}

function buildHeroRenderSummary(lead: GardenBriefLead) {
  return `${lead.heroRender?.renderStatus || "Not Started"}: ${lead.heroRender?.notes || "Hero render not prepared yet."}`;
}

function placementSummary(placements: Record<string, string>) {
  const entries = Object.entries(placements);

  return entries.length
    ? entries.map(([feature, placement]) => `${feature} in ${placement}`).join("; ")
    : "no placements set";
}

function list(items: string[]) {
  return items.length ? items.join(", ") : "none specified";
}
