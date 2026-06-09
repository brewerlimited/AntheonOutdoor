import type { GardenBriefLead, ScaleInformation } from "@/data/types";
import { buildConceptBrief } from "@/lib/designStudio";
import type { StyleGuide } from "@/lib/styleGuides";

export function buildDesignConceptPrompt({
  lead,
  scaleInfo,
  styleGuide,
}: {
  lead: GardenBriefLead;
  scaleInfo?: ScaleInformation;
  styleGuide: StyleGuide;
}) {
  const conceptBrief = buildConceptBrief({
    lead,
    existingPlan: lead.existingGardenPlan,
    scaleInfo,
    budgetBand: lead.budgetBand,
    selectedStyle: lead.preferredStyle,
    mustHaves: lead.mustHaves,
    niceToHaves: lead.niceToHaves,
    budgetRules: lead.budgetGuidance || "Use selected budget band and avoid unrealistic feature combinations.",
    styleGuide,
  });

  return `${conceptBrief}

Output format:

Concept A — [Name]
- Design intent:
- Layout summary:
- Feature placement:
- Approximate area allocation:
- Budget fit:
- Style fit:
- Risks:

Concept B — [Name]
- Design intent:
- Layout summary:
- Feature placement:
- Approximate area allocation:
- Budget fit:
- Style fit:
- Risks:

Concept C — [Name]
- Design intent:
- Layout summary:
- Feature placement:
- Approximate area allocation:
- Budget fit:
- Style fit:
- Risks:

Important:
- Use the uploaded existing top-down garden plan as the source of truth.
- Respect the scale information provided.
- Do not alter the house footprint, garden boundaries or neighbouring properties.
- Produce three different layout concepts for this garden.
- Each concept should be realistic for the selected budget band.
- Explain feature placement, approximate zones and why each layout works.
- Do not generate images yet. This is for layout thinking only.`;
}

export function buildHeroRenderPrompt({ lead, styleGuide }: { lead: GardenBriefLead; styleGuide: StyleGuide }) {
  const final = lead.finalLayoutDirection;

  return `Anthēon Outdoor Hero Concept Render Prompt

Create one strong hero concept image only. Do not attempt multiple coherent camera views.

Use these as the source of truth:
- Final masterplan: ${lead.masterplan?.image?.fileName || "Use uploaded final masterplan if available"}
- Customer labelled photos: ${lead.photos?.map((photo) => photo.label || photo.fileName).join(", ") || "No photos listed"}
- Selected style: ${lead.preferredStyle || "To be refined"}
- Budget band: ${lead.budgetBand || "Not selected"}
- Final layout summary: ${final?.finalLayoutSummary || "Not written yet"}
- Final feature placements: ${final?.finalFeaturePlacements || "Not written yet"}
- Final budget notes: ${final?.finalBudgetNotes || lead.budgetGuidance || "Follow selected budget band"}
- Final style notes: ${final?.finalStyleNotes || styleGuide.summary}

Style guide:
- Materials: ${styleGuide.keyMaterials.join(", ")}
- Planting: ${styleGuide.plantingDirection.join(", ")}
- Avoid: ${styleGuide.avoid.join(", ")}

Instructions:
- Create a realistic, buildable Anthēon Outdoor hero concept.
- Preserve the customer home's character and garden boundaries.
- Follow the final masterplan and final feature placements.
- Do not invent duplicate feature locations.
- Do not add features beyond the budget-aligned version.
- The image should feel premium, calm and consultation-ready, not like a fake completed project.`;
}
