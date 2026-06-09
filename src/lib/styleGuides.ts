export type StyleGuide = {
  name: string;
  aliases: string[];
  summary: string;
  shouldContain: string[];
  keyMaterials: string[];
  plantingDirection: string[];
  suitableFeatures: string[];
  budgetSensitiveAlternatives: string[];
  avoid: string[];
  sketchGuidance: string[];
  inspirationSlots: string[];
};

export const styleGuides: StyleGuide[] = [
  {
    name: "Dark Contemporary",
    aliases: ["contemporary", "dark", "dark modern", "dark contemporary"],
    summary:
      "Dark Contemporary uses charcoal tones, clean geometry, warm lighting and restrained planting to create a premium evening-focused garden.",
    shouldContain: [
      "dark fencing or screening",
      "black or charcoal detailing",
      "clean patio and seating geometry",
      "ornamental grasses",
      "evergreen structure",
      "warm feature lighting",
      "restrained furniture",
    ],
    keyMaterials: ["charcoal timber", "dark porcelain", "black metal", "gravel accents", "warm lighting"],
    plantingDirection: [
      "structured evergreens",
      "ornamental grasses",
      "soft white flowering accents",
      "multi-stem feature tree where budget allows",
    ],
    suitableFeatures: ["Seating area", "Garden lighting", "Privacy screening", "Raised planters", "Pathway"],
    budgetSensitiveAlternatives: [
      "paint or stain existing fence instead of replacing it",
      "use gravel accents instead of large porcelain areas",
      "use one raised planter feature instead of multiple masonry beds",
      "use solar or low-voltage lighting instead of a full electrical scheme",
    ],
    avoid: ["bright colours", "rustic cottage planting", "excessive features", "expensive structures in low budget bands"],
    sketchGuidance: [
      "keep main seating near the house",
      "use boundaries for planting or screening",
      "avoid overcrowding",
      "keep central lawn if budget is low",
      "use one strong focal feature",
    ],
    inspirationSlots: ["Charcoal boundary detail", "Evening lighting mood", "Clean seating zone"],
  },
  {
    name: "Mediterranean Escape",
    aliases: ["mediterranean", "mediterranean escape"],
    summary:
      "Mediterranean Escape brings warm stone, textured planting and relaxed dining into a garden that feels calm, sun-washed and inviting.",
    shouldContain: ["warm stone tones", "gravel or textured edges", "olive/lavender character", "relaxed dining", "softly layered planting"],
    keyMaterials: ["warm porcelain", "limestone tones", "terracotta pots", "gravel", "natural timber"],
    plantingDirection: ["lavender", "rosemary", "olive-style foliage", "salvia", "soft grasses", "drought-tolerant planting"],
    suitableFeatures: ["Seating area", "Pergola", "Raised planters", "Garden lighting", "Pathway"],
    budgetSensitiveAlternatives: [
      "use gravel and pots for atmosphere",
      "keep pergola as an Enhanced/Dream item if budget is tight",
      "refresh existing patio with styling rather than replacing all paving",
    ],
    avoid: ["cold grey-heavy schemes", "overly formal geometry", "tropical planting", "too many dark finishes"],
    sketchGuidance: ["place dining close to the house", "use pots around patio edges", "keep planting generous but informal", "reserve large structures for higher budgets"],
    inspirationSlots: ["Warm patio corner", "Potted planting group", "Relaxed dining pergola"],
  },
  {
    name: "Scandinavian Outdoor Living",
    aliases: ["minimalist", "scandinavian", "scandi", "scandinavian garden"],
    summary:
      "Scandinavian Outdoor Living is calm, pale and practical, using clean lines, soft planting and simple material choices.",
    shouldContain: ["simple geometry", "pale or neutral materials", "clear lawn or seating zones", "soft low-maintenance planting", "uncluttered furniture"],
    keyMaterials: ["pale paving", "light gravel", "timber accents", "soft grey planters", "simple metal edging"],
    plantingDirection: ["hakonechloa", "soft grasses", "evergreen shrubs", "white flowering accents", "low-maintenance perennials"],
    suitableFeatures: ["Seating area", "Real lawn", "Low-maintenance planting", "Pathway", "Storage"],
    budgetSensitiveAlternatives: [
      "retain existing lawn",
      "use small seating upgrades rather than full hard landscaping",
      "use simple planters and soft planting for impact",
    ],
    avoid: ["heavy dark structures", "busy colour palettes", "overly ornate features", "too many zones"],
    sketchGuidance: ["keep the plan simple", "prioritise clear circulation", "leave breathing space", "use planting as softness rather than clutter"],
    inspirationSlots: ["Calm seating", "Soft boundary planting", "Simple lawn layout"],
  },
  {
    name: "Resort Outdoor Living",
    aliases: ["resort", "resort-style", "resort outdoor living"],
    summary:
      "Resort Outdoor Living is shaped around entertaining, comfort and evening atmosphere, with more complete outdoor-room zoning.",
    shouldContain: ["generous seating", "dining zone", "feature lighting", "pergola or shelter where budget allows", "premium planting structure"],
    keyMaterials: ["large-format porcelain", "powder-coated metal", "slatted screening", "integrated lighting", "premium outdoor furniture"],
    plantingDirection: ["architectural evergreens", "multi-stem trees", "layered grasses", "soft flowering accents", "structured planters"],
    suitableFeatures: ["Pergola", "Outdoor kitchen", "Fire pit", "Garden lighting", "Seating area", "Privacy screening"],
    budgetSensitiveAlternatives: [
      "show resort mood through furniture and lighting in lower versions",
      "reserve outdoor kitchen and premium pergola for Outdoor Living or Luxury",
      "use one strong hosting zone before adding multiple zones",
    ],
    avoid: ["under-scaled furniture", "too many focal points", "budget bands that cannot support the structure shown", "blocking access routes"],
    sketchGuidance: ["start with the main hosting zone", "keep cooking/dining near the house", "separate dream items from within-budget direction", "leave clear circulation"],
    inspirationSlots: ["Outdoor room", "Hosting zone", "Evening lighting"],
  },
  {
    name: "Family Luxury Garden",
    aliases: ["family", "family-friendly", "family luxury garden"],
    summary:
      "Family Luxury Garden balances durable everyday use with a calm, premium layout that works for children, pets and adults.",
    shouldContain: ["usable lawn", "durable seating", "clear family zones", "storage or practical edges", "robust planting"],
    keyMaterials: ["durable paving", "real or artificial lawn where appropriate", "simple timber or composite accents", "easy-clean furniture"],
    plantingDirection: ["robust shrubs", "soft grasses", "non-fussy perennials", "evergreen structure", "child-friendly planting"],
    suitableFeatures: ["Real lawn", "Children’s play space", "Seating area", "Storage", "Low-maintenance planting", "Fencing"],
    budgetSensitiveAlternatives: [
      "retain lawn and upgrade edges",
      "use storage improvements before bespoke structures",
      "keep play areas flexible rather than built-in at lower budgets",
    ],
    avoid: ["delicate planting in high-use areas", "sharp or awkward routes", "overly formal zones", "features that reduce usable lawn unnecessarily"],
    sketchGuidance: ["protect central usable space", "place adult seating near the house", "keep play/storage practical", "make boundaries work hard"],
    inspirationSlots: ["Usable family lawn", "Durable seating", "Practical planting edge"],
  },
  {
    name: "Natural Modern Garden",
    aliases: ["natural", "natural planting", "natural modern garden"],
    summary:
      "Natural Modern Garden is planting-led and softly structured, combining calm organic movement with contemporary restraint.",
    shouldContain: ["soft boundaries", "planting-led zones", "naturalistic grasses", "calm seating", "wildlife-friendly feeling"],
    keyMaterials: ["gravel", "natural stone", "timber accents", "simple steel edging", "muted planters"],
    plantingDirection: ["ornamental grasses", "salvia", "seasonal perennials", "evergreen shrubs", "multi-stem amelanchier", "soft meadow influence"],
    suitableFeatures: ["Low-maintenance planting", "Real lawn", "Pathway", "Seating area", "Raised planters"],
    budgetSensitiveAlternatives: [
      "focus spend on planting and soil improvement",
      "retain existing hard surfaces where possible",
      "use gravel or stepping paths instead of large paved areas",
    ],
    avoid: ["high-maintenance specialist planting", "overly polished resort styling", "heavy dark structures", "too many built features"],
    sketchGuidance: ["lead with planting beds", "keep paths simple", "soften boundaries", "use one calm seating point", "protect practical access"],
    inspirationSlots: ["Soft planted boundary", "Natural path", "Calm planted seating"],
  },
];

export function getStyleGuide(style: string) {
  const normalised = style.toLowerCase().trim();

  return (
    styleGuides.find((guide) =>
      [guide.name.toLowerCase(), ...guide.aliases].some((alias) => normalised.includes(alias)),
    ) ?? styleGuides[0]
  );
}
