import type { GardenBriefLead } from "./types";

export const featureOptions = [
  "Porcelain patio",
  "Composite decking",
  "Pergola",
  "Outdoor kitchen",
  "Fire pit",
  "Garden lighting",
  "Seating area",
  "Artificial grass",
  "Real lawn",
  "Raised planters",
  "Water feature",
  "Privacy screening",
  "Hot tub area",
  "Sauna / wellness area",
  "Children’s play space",
  "Low-maintenance planting",
  "Storage",
  "Garden office base",
  "Pathway",
  "Retaining wall",
  "Fencing",
];

export const projectTypes = [
  "Full garden redesign",
  "Outdoor entertaining space",
  "Family garden",
  "Low-maintenance upgrade",
  "New-build garden transformation",
  "Patio / seating area",
  "Unsure",
];

export const preferredStyles = [
  "Contemporary",
  "Mediterranean",
  "Scandinavian",
  "Resort-style",
  "Natural planting",
  "Dark modern",
  "Minimalist",
  "Family-friendly",
];

export const budgetBands = [
  {
    title: "Garden Refresh",
    range: "£3,000 – £7,500",
    description: "Focused improvements that make the space feel calmer and more intentional.",
  },
  {
    title: "Signature Transformation",
    range: "£7,500 – £15,000",
    description: "A stronger garden direction with refined layout, seating and planting moments.",
  },
  {
    title: "Outdoor Living",
    range: "£15,000 – £30,000",
    description: "A more complete outdoor room with premium features and layered atmosphere.",
  },
  {
    title: "Luxury Outdoor Space",
    range: "£30,000 – £60,000+",
    description: "A highly considered outdoor environment with richer specification and detail.",
  },
  {
    title: "Not sure yet",
    range: "Guidance needed",
    description: "We can help shape a sensible investment level from the brief.",
  },
];

export const styleConcepts = [
  {
    title: "Modern Courtyard",
    description:
      "Crisp paving, structured planting and quiet architectural lines for compact or overlooked spaces.",
    features: "Porcelain, lighting, screening, raised planting",
    budget: "Garden Refresh to Signature Transformation",
    tone: "courtyard",
    imageSrc: "/images/styles/modern-courtyard.png",
  },
  {
    title: "Mediterranean Escape",
    description:
      "Warm stone, relaxed dining and textured planting with a softened, sun-washed character.",
    features: "Pergola, stone tones, gravel, dining terrace",
    budget: "Signature Transformation to Outdoor Living",
    tone: "mediterranean",
    imageSrc: "/images/styles/mediterranean-escape.png",
  },
  {
    title: "Scandinavian Garden",
    description:
      "Pale timber notes, soft minimalism and practical zones designed for everyday calm.",
    features: "Decking, pale paving, seating, simple planting",
    budget: "Garden Refresh to Outdoor Living",
    tone: "scandi",
    imageSrc: "/images/styles/scandinavian-garden.png",
  },
  {
    title: "Resort Outdoor Living",
    description:
      "A destination-style garden shaped around generous seating, cooking, warmth and evening atmosphere.",
    features: "Outdoor kitchen, fire pit, lighting, pergola",
    budget: "Outdoor Living to Luxury Outdoor Space",
    tone: "resort",
    imageSrc: "/images/styles/resort-outdoor-living.png",
  },
  {
    title: "Family Luxury Garden",
    description:
      "Family practicality refined through calm zoning, durable materials and considered proportion.",
    features: "Real lawn, storage, seating, family-friendly planting",
    budget: "Signature Transformation to Outdoor Living",
    tone: "family",
    imageSrc: "/images/styles/family-luxury-garden.png",
  },
  {
    title: "Dark Contemporary",
    description:
      "Charcoal finishes, warm accents and sculptural planting for a confident modern garden.",
    features: "Dark paving, screening, lighting, sculptural planting",
    budget: "Outdoor Living to Luxury Outdoor Space",
    tone: "dark",
    imageSrc: "/images/styles/dark-contemporary.png",
  },
];

export const services = [
  {
    title: "Full Garden Transformations",
    text: "A full rethink of layout, materials, planting, lighting and use, shaped into one coherent outdoor environment.",
  },
  {
    title: "Outdoor Living Spaces",
    text: "Outdoor rooms for dining, hosting and unwinding, with considered seating, shelter and evening atmosphere.",
  },
  {
    title: "Modern Patios",
    text: "Calm patio concepts built around proportion, porcelain, stone tones and crisp detailing.",
  },
  {
    title: "Pergolas & Dining Areas",
    text: "Sheltered dining settings designed as natural extensions of the home, not bolt-on garden features.",
  },
  {
    title: "Garden Lighting",
    text: "Layered lighting for routes, planting and social spaces, adding warmth and usability after dusk.",
  },
  {
    title: "Low-Maintenance Gardens",
    text: "Premium-looking gardens planned around durable materials, simple upkeep and planting that works hard without fuss.",
  },
  {
    title: "New-Build Garden Upgrades",
    text: "Blank-slate gardens shaped into mature-feeling spaces with stronger layout, privacy and outdoor living zones.",
  },
];

export const mockLeads: GardenBriefLead[] = [
  {
    id: "mock-1",
    createdAt: "2026-06-03T09:00:00.000Z",
    fullName: "Example Lead",
    email: "example@antheon.local",
    phone: "",
    address: "Local MVP example",
    budgetBand: "Signature Transformation: £7,500 – £15,000",
    preferredStyle: "Contemporary",
    plantingMaintenance: "Low maintenance",
    plantingColourScheme: "Soft whites and greens",
    projectType: "Outdoor entertaining space",
    mustHaves: ["Pergola", "Garden lighting", "Seating area"],
    niceToHaves: ["Outdoor kitchen", "Fire pit"],
    photos: [
      {
        id: "mock-photo-1",
        fileName: "garden-from-house.jpg",
        label: "View from house looking into garden",
        notes: "Main view from patio doors.",
      },
    ],
    gardenSize: "Medium",
    gardenShape: "Rectangular",
    housePosition: "At the front of the garden",
    existingFeatures: ["Existing patio", "Lawn", "Existing fencing"],
    layoutNotes: "Side access is available on the left.",
    notes: "Mock lead for frontend admin preview.",
    proposalStatus: "Brief Received",
    proposalImages: {
      withinBudget: {
        imageNotes: "",
        imageStatus: "Not Started",
        approved: false,
      },
      enhancedDesign: {
        imageNotes: "",
        imageStatus: "Not Started",
        approved: false,
      },
      dreamVersion: {
        imageNotes: "",
        imageStatus: "Not Started",
        approved: false,
      },
    },
    approvedMustHaves: ["Pergola", "Garden lighting", "Seating area"],
    cautionMustHaves: [],
    excludedMustHaves: [],
    approvedNiceToHaves: ["Fire pit"],
    excludedNiceToHaves: ["Outdoor kitchen"],
    withinBudgetFeatures: ["Pergola", "Garden lighting", "Seating area"],
    enhancedDesignFeatures: ["Pergola", "Garden lighting", "Seating area", "Fire pit"],
    dreamVersionFeatures: ["Pergola", "Garden lighting", "Seating area", "Outdoor kitchen", "Fire pit"],
    budgetGuidance:
      "Your selected must-haves can be explored within a Signature Transformation direction, provided the specification and scale are carefully controlled.",
    budgetPressure: "Medium",
    status: "New",
  },
];
