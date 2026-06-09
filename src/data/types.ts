import type { DesignMemory } from "@/lib/designMemory";

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Consultation Booked"
  | "Quoted"
  | "Won"
  | "Lost";

export type ProposalStatus =
  | "Draft"
  | "Brief Received"
  | "Design Memory Created"
  | "Proposal Drafted"
  | "Images Added"
  | "Reviewed"
  | "Approved"
  | "Sent";

export type ProposalImageStatus =
  | "Not Started"
  | "Generated Manually"
  | "Needs Regeneration"
  | "Approved";

export type ProposalVersionKey = "withinBudget" | "enhancedDesign" | "dreamVersion";

export type ProposalImageAsset = {
  id?: string;
  imageUrl?: string;
  previewUrl?: string;
  storageBucket?: string;
  storagePath?: string;
  fileName?: string;
  caption?: string;
  images?: ProposalImageAsset[];
  imageNotes: string;
  imageStatus: ProposalImageStatus;
  approved: boolean;
};

export type VisualAnchorMemory = {
  versionKey: ProposalVersionKey;
  versionTitle: string;
  imageId?: string;
  imageFileName?: string;
  imageUrl?: string;
  previewUrl?: string;
  placementNotes: string;
  approvedAt: string;
};

export type AdminGardenLayoutPreparation = {
  gardenShape?: string;
  approximateLength?: string;
  approximateWidth?: string;
  unit?: "metres" | "feet" | "";
  housePosition?: string;
  googleMapsReviewNotes?: string;
  existingLayoutNotes?: string;
  constraintsAccessNotes?: string;
  sketchNotes?: string;
  initialPlanDirectionNotes?: string;
};

export type FeaturePlacementNote = {
  feature: string;
  priority: "Must-have" | "Nice-to-have";
  budgetStatus: "Suitable" | "Caution" | "Better for enhanced/dream";
  placement: string;
  note: string;
};

export type ExistingGardenPlan = {
  image?: ProposalImageAsset;
  notes?: string;
  source?: "Google Maps" | "Bing Maps" | "Manual" | "Other" | "";
  createdAt?: string;
  updatedAt?: string;
};

export type ScaleInformation = {
  gardenWidth?: string;
  gardenLength?: string;
  unit?: "metres" | "feet" | "";
  calculatedArea?: number;
  scaleNotes?: string;
};

export type LayoutConceptStatus = "Draft" | "Shortlisted" | "Rejected" | "Selected" | "Merged";

export type LayoutConcept = {
  id: "A" | "B" | "C";
  conceptName: string;
  designIntent: string;
  layoutSummary: string;
  keyFeatures: string;
  featurePlacements: string;
  whyItFitsBudget: string;
  whyItFitsStyle: string;
  risksOrWatchouts: string;
  jackNotes: string;
  status: LayoutConceptStatus;
};

export type FinalLayoutDirection = {
  selectedConceptSource?: "Concept A" | "Concept B" | "Concept C" | "Merge" | "Manual" | "";
  finalLayoutSummary?: string;
  finalFeaturePlacements?: string;
  finalBudgetNotes?: string;
  finalStyleNotes?: string;
  finalRisks?: string;
  readyForMasterplan?: boolean;
};

export type MasterplanStatus = "Not Started" | "Sketch Required" | "AI Enhanced" | "Reviewed" | "Approved";

export type Masterplan = {
  image?: ProposalImageAsset;
  notes?: string;
  status?: MasterplanStatus;
};

export type HeroRenderStatus =
  | "Not Started"
  | "Prompt Prepared"
  | "Generated Manually"
  | "Needs Revision"
  | "Approved";

export type HeroRender = {
  image?: ProposalImageAsset;
  notes?: string;
  renderStatus?: HeroRenderStatus;
};

export type GardenPhotoLabel = {
  id: string;
  fileName: string;
  previewUrl?: string;
  storageBucket?: string;
  storagePath?: string;
  publicUrl?: string;
  label: string;
  notes: string;
};

export type GardenSize = "Small" | "Medium" | "Large" | "Unsure" | "";
export type PlantingMaintenance = "Low maintenance" | "Medium maintenance" | "High maintenance" | "Not sure" | "";
export type PlantingColourScheme =
  | "Soft whites and greens"
  | "Purples, blues and silvers"
  | "Warm Mediterranean tones"
  | "Evergreen and architectural"
  | "Soft pinks and whites"
  | "Bold seasonal colour"
  | "Natural meadow mix"
  | "Not sure"
  | "";

export type StyleQuizStoredResult = {
  styleName: string;
  matchingBriefStyle: string;
  budgetBand: string;
  answers: Record<string, string>;
  recommendedFeatures: string[];
  whyThisSuitsYou: string[];
  timestamp: string;
};

export type GardenBriefLead = {
  id: string;
  createdAt?: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  projectType: string;
  preferredStyle: string;
  plantingMaintenance?: PlantingMaintenance;
  plantingColourScheme?: PlantingColourScheme;
  budgetBand: string;
  mustHaves: string[];
  niceToHaves: string[];
  photos?: GardenPhotoLabel[];
  gardenSize?: GardenSize;
  gardenShape?: string;
  housePosition?: string;
  existingFeatures?: string[];
  layoutNotes?: string;
  notes: string;
  styleQuizResult?: StyleQuizStoredResult;
  status: LeadStatus;
  proposalStatus?: ProposalStatus;
  proposalReviewNotes?: string;
  proposalSentAt?: string;
  proposalImages?: Partial<Record<ProposalVersionKey, ProposalImageAsset>>;
  visualAnchorMemory?: Partial<Record<ProposalVersionKey, VisualAnchorMemory>>;
  aiViewGuardrails?: string;
  adminLayoutPreparation?: AdminGardenLayoutPreparation;
  featurePlacementNotes?: FeaturePlacementNote[];
  planSketchImage?: ProposalImageAsset;
  existingGardenPlan?: ExistingGardenPlan;
  scaleInformation?: ScaleInformation;
  layoutConcepts?: LayoutConcept[];
  finalLayoutDirection?: FinalLayoutDirection;
  masterplan?: Masterplan;
  heroRender?: HeroRender;
  approvedMustHaves?: string[];
  cautionMustHaves?: string[];
  excludedMustHaves?: string[];
  approvedNiceToHaves?: string[];
  excludedNiceToHaves?: string[];
  withinBudgetFeatures?: string[];
  enhancedDesignFeatures?: string[];
  dreamVersionFeatures?: string[];
  budgetGuidance?: string;
  budgetPressure?: "Low" | "Medium" | "High" | "Very High";
  designMemory?: DesignMemory;
  withinBudgetDesignMemory?: DesignMemory;
  enhancedDesignMemory?: DesignMemory;
  dreamDesignMemory?: DesignMemory;
};
