import type { GardenBriefLead, LayoutConcept, ProposalImageAsset, ProposalVersionKey } from "./types";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { buildProposalPack } from "@/lib/proposalBuilder";

export const LEADS_STORAGE_KEY = "antheon-garden-briefs";
export const GARDEN_PHOTOS_BUCKET = "garden-brief-photos";
export const PROPOSAL_IMAGES_BUCKET = "proposal-concept-images";

type LeadRow = {
  id: string;
  created_at: string | null;
  status: GardenBriefLead["status"] | null;
  proposal_status: GardenBriefLead["proposalStatus"] | null;
  data: GardenBriefLead;
};

type PhotoUpload = {
  photoId: string;
  file: File;
};

export function loadLocalLeads(): GardenBriefLead[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(LEADS_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as GardenBriefLead[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalLead(lead: GardenBriefLead) {
  const current = loadLocalLeads();
  const next = [lead, ...current.filter((item) => item.id !== lead.id)];
  window.localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(next));
}

export function saveLocalLeads(leads: GardenBriefLead[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
}

export function updateLocalLead(updatedLead: GardenBriefLead) {
  const current = loadLocalLeads();
  const next = current.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead));

  if (!next.some((lead) => lead.id === updatedLead.id)) {
    next.unshift(updatedLead);
  }

  saveLocalLeads(next);
}

export async function loadLeads(): Promise<GardenBriefLead[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return loadLocalLeads();
  }

  const { data, error } = await supabase
    .from("leads")
    .select("id, created_at, status, proposal_status, data")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Supabase lead load failed; using local leads.", error.message);
    return loadLocalLeads();
  }

  const leads = ((data ?? []) as LeadRow[]).map(rowToLead);
  saveLocalLeads(leads);

  return leads;
}

export async function saveLead(lead: GardenBriefLead, photoUploads: PhotoUpload[] = []) {
  const enrichedLead = await uploadGardenPhotos(lead, photoUploads);

  saveLocalLead(enrichedLead);

  if (!isSupabaseConfigured() || !supabase) {
    return enrichedLead;
  }

  const { error } = await supabase.from("leads").upsert(leadToRow(enrichedLead), {
    onConflict: "id",
  });

  if (error) {
    console.warn("Supabase lead save failed; lead remains in localStorage.", error.message);
    return enrichedLead;
  }

  await syncLeadDetails(enrichedLead);

  return enrichedLead;
}

export async function updateLead(updatedLead: GardenBriefLead) {
  updateLocalLead(updatedLead);

  if (!isSupabaseConfigured() || !supabase) {
    return updatedLead;
  }

  const { error } = await supabase.from("leads").upsert(leadToRow(updatedLead), {
    onConflict: "id",
  });

  if (error) {
    console.warn("Supabase lead update failed; lead remains in localStorage.", error.message);
    return updatedLead;
  }

  await syncLeadDetails(updatedLead);

  return updatedLead;
}

export async function uploadProposalImageFiles({
  leadId,
  versionKey,
  files,
  currentImage,
}: {
  leadId: string;
  versionKey: ProposalVersionKey;
  files: File[];
  currentImage: ProposalImageAsset;
}) {
  const gallery = getImageGallery(currentImage);
  const uploadedImages = await Promise.all(
    files.map(async (file) => {
      const id = crypto.randomUUID();
      const fallbackDataUrl = await fileToDataUrl(file);

      if (!isSupabaseConfigured() || !supabase) {
        return createProposalImageAsset({
          id,
          file,
          imageUrl: fallbackDataUrl,
          previewUrl: fallbackDataUrl,
        });
      }

      const storagePath = `${leadId}/${versionKey}/${id}-${safeFileName(file.name)}`;
      const { error } = await supabase.storage
        .from(PROPOSAL_IMAGES_BUCKET)
        .upload(storagePath, file, {
          contentType: file.type || undefined,
          upsert: true,
        });

      if (error) {
        console.warn("Supabase proposal image upload failed; using local preview.", error.message);
        return createProposalImageAsset({
          id,
          file,
          imageUrl: fallbackDataUrl,
          previewUrl: fallbackDataUrl,
        });
      }

      const publicUrl = getPublicStorageUrl(PROPOSAL_IMAGES_BUCKET, storagePath);

      return createProposalImageAsset({
        id,
        file,
        imageUrl: publicUrl,
        previewUrl: publicUrl,
        storageBucket: PROPOSAL_IMAGES_BUCKET,
        storagePath,
      });
    }),
  );
  const selectedImage = uploadedImages[0];

  return {
    ...currentImage,
    images: [...gallery, ...uploadedImages],
    fileName: selectedImage.fileName,
    imageUrl: selectedImage.imageUrl,
    previewUrl: selectedImage.previewUrl,
    storageBucket: selectedImage.storageBucket,
    storagePath: selectedImage.storagePath,
    imageStatus: "Generated Manually" as const,
  };
}

export async function uploadLayoutConceptImageFile({
  leadId,
  conceptId,
  file,
  currentImage,
}: {
  leadId: string;
  conceptId: LayoutConcept["id"];
  file: File;
  currentImage?: ProposalImageAsset;
}) {
  const id = crypto.randomUUID();
  const fallbackDataUrl = await fileToDataUrl(file);
  const notes = currentImage?.imageNotes || "Gemini layout concept reference.";

  if (!isSupabaseConfigured() || !supabase) {
    return {
      ...createProposalImageAsset({
        id,
        file,
        imageUrl: fallbackDataUrl,
        previewUrl: fallbackDataUrl,
      }),
      imageNotes: notes,
      approved: currentImage?.approved ?? false,
    };
  }

  const storagePath = `${leadId}/layout-concepts/${conceptId}/${id}-${safeFileName(file.name)}`;
  const { error } = await supabase.storage
    .from(PROPOSAL_IMAGES_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type || undefined,
      upsert: true,
    });

  if (error) {
    console.warn("Supabase layout concept image upload failed; using local preview.", error.message);
    return {
      ...createProposalImageAsset({
        id,
        file,
        imageUrl: fallbackDataUrl,
        previewUrl: fallbackDataUrl,
      }),
      imageNotes: notes,
      approved: currentImage?.approved ?? false,
    };
  }

  const publicUrl = getPublicStorageUrl(PROPOSAL_IMAGES_BUCKET, storagePath);

  return {
    ...createProposalImageAsset({
      id,
      file,
      imageUrl: publicUrl,
      previewUrl: publicUrl,
      storageBucket: PROPOSAL_IMAGES_BUCKET,
      storagePath,
    }),
    imageNotes: notes,
    approved: currentImage?.approved ?? false,
  };
}

function createProposalImageAsset({
  id,
  file,
  imageUrl,
  previewUrl,
  storageBucket,
  storagePath,
}: {
  id: string;
  file: File;
  imageUrl: string;
  previewUrl: string;
  storageBucket?: string;
  storagePath?: string;
}): ProposalImageAsset {
  return {
    id,
    fileName: file.name,
    imageUrl,
    previewUrl,
    storageBucket,
    storagePath,
    caption: "",
    imageNotes: "",
    imageStatus: "Generated Manually",
    approved: false,
  };
}

async function uploadGardenPhotos(lead: GardenBriefLead, photoUploads: PhotoUpload[]) {
  if (!photoUploads.length) {
    return lead;
  }

  const uploadedPhotos = await Promise.all(
    (lead.photos ?? []).map(async (photo) => {
      const upload = photoUploads.find((item) => item.photoId === photo.id);

      if (!upload) {
        return photo;
      }

      if (!isSupabaseConfigured() || !supabase) {
        return photo;
      }

      const storagePath = `${lead.id}/${buildLabelledPhotoFileName(photo, upload.file.name)}`;
      const { error } = await supabase.storage
        .from(GARDEN_PHOTOS_BUCKET)
        .upload(storagePath, upload.file, {
          contentType: upload.file.type || undefined,
          upsert: true,
        });

      if (error) {
        console.warn("Supabase garden photo upload failed; keeping local preview.", error.message);
        return photo;
      }

      const publicUrl = getPublicStorageUrl(GARDEN_PHOTOS_BUCKET, storagePath);

      return {
        ...photo,
        previewUrl: publicUrl,
        publicUrl,
        storageBucket: GARDEN_PHOTOS_BUCKET,
        storagePath,
      };
    }),
  );

  return {
    ...lead,
    photos: uploadedPhotos,
  };
}

async function syncLeadDetails(lead: GardenBriefLead) {
  if (!supabase) {
    return;
  }

  await Promise.all([
    syncLeadPhotos(lead),
    syncDesignMemories(lead),
    syncProposalPack(lead),
    syncProposalImages(lead),
  ]);
}

async function syncLeadPhotos(lead: GardenBriefLead) {
  if (!supabase) {
    return;
  }

  await supabase.from("lead_photos").delete().eq("lead_id", lead.id);

  if (!lead.photos?.length) {
    return;
  }

  const rows = lead.photos.map((photo, index) => ({
    id: photo.id,
    lead_id: lead.id,
    sort_order: index,
    file_name: photo.fileName,
    label: photo.label,
    notes: photo.notes,
    storage_bucket: photo.storageBucket ?? null,
    storage_path: photo.storagePath ?? null,
    public_url: photo.publicUrl ?? photo.previewUrl ?? null,
    metadata: photo,
  }));

  const { error } = await supabase.from("lead_photos").upsert(rows, {
    onConflict: "id",
  });

  if (error) {
    console.warn("Supabase lead photo metadata sync failed.", error.message);
  }
}

async function syncDesignMemories(lead: GardenBriefLead) {
  if (!supabase) {
    return;
  }

  const memories = [
    ["withinBudget", "Within Budget", lead.withinBudgetDesignMemory],
    ["enhancedDesign", "Enhanced Design", lead.enhancedDesignMemory],
    ["dreamVersion", "Dream Version", lead.dreamDesignMemory],
  ] as const;
  const rows = memories
    .filter(([, , memory]) => Boolean(memory))
    .map(([versionKey, versionTitle, memory]) => ({
      id: `${lead.id}-${versionKey}`,
      lead_id: lead.id,
      version_key: versionKey,
      version_title: versionTitle,
      memory,
    }));

  if (!rows.length) {
    return;
  }

  const { error } = await supabase.from("design_memories").upsert(rows, {
    onConflict: "id",
  });

  if (error) {
    console.warn("Supabase design memory sync failed.", error.message);
  }
}

async function syncProposalPack(lead: GardenBriefLead) {
  if (!supabase) {
    return;
  }

  const proposalPack = buildProposalPack(lead);
  const { error } = await supabase.from("proposal_packs").upsert(
    {
      lead_id: lead.id,
      status: lead.proposalStatus ?? "Draft",
      review_notes: lead.proposalReviewNotes ?? null,
      sent_at: lead.proposalSentAt ?? null,
      data: proposalPack,
    },
    { onConflict: "lead_id" },
  );

  if (error) {
    console.warn("Supabase proposal pack sync failed.", error.message);
  }
}

async function syncProposalImages(lead: GardenBriefLead) {
  if (!supabase) {
    return;
  }

  await supabase.from("proposal_images").delete().eq("lead_id", lead.id);

  const rows = (Object.entries(lead.proposalImages ?? {}) as Array<
    [ProposalVersionKey, ProposalImageAsset]
  >).flatMap(([versionKey, image]) =>
    getImageGallery(image).map((asset, index) => ({
      id: asset.id ?? `${lead.id}-${versionKey}-${index}`,
      lead_id: lead.id,
      version_key: versionKey,
      sort_order: index,
      file_name: asset.fileName ?? null,
      storage_bucket: asset.storageBucket ?? null,
      storage_path: asset.storagePath ?? null,
      public_url: asset.imageUrl ?? asset.previewUrl ?? null,
      image_notes: image.imageNotes ?? asset.imageNotes ?? "",
      image_status: image.imageStatus ?? asset.imageStatus ?? "Not Started",
      approved: Boolean(image.approved || asset.approved),
      metadata: asset,
    })),
  );

  if (!rows.length) {
    return;
  }

  const { error } = await supabase.from("proposal_images").upsert(rows, {
    onConflict: "id",
  });

  if (error) {
    console.warn("Supabase proposal image metadata sync failed.", error.message);
  }
}

function leadToRow(lead: GardenBriefLead) {
  return {
    id: lead.id,
    created_at: lead.createdAt ?? new Date().toISOString(),
    status: lead.status,
    proposal_status: lead.proposalStatus ?? "Brief Received",
    full_name: lead.fullName,
    email: lead.email,
    phone: lead.phone,
    address: lead.address,
    project_type: lead.projectType,
    preferred_style: lead.preferredStyle,
    budget_band: lead.budgetBand,
    garden_size: lead.gardenSize,
    budget_pressure: lead.budgetPressure,
    data: lead,
  };
}

function rowToLead(row: LeadRow): GardenBriefLead {
  return {
    ...row.data,
    id: row.id,
    createdAt: row.created_at ?? row.data.createdAt,
    status: row.status ?? row.data.status,
    proposalStatus: row.proposal_status ?? row.data.proposalStatus,
  };
}

function getImageGallery(image?: ProposalImageAsset) {
  if (!image) {
    return [];
  }

  if (image.images?.length) {
    return image.images;
  }

  if (image.imageUrl || image.previewUrl) {
    return [
      {
        id: image.id ?? "primary-image",
        fileName: image.fileName,
        imageUrl: image.imageUrl,
        previewUrl: image.previewUrl,
        storageBucket: image.storageBucket,
        storagePath: image.storagePath,
        caption: image.caption,
        imageNotes: image.imageNotes,
        imageStatus: image.imageStatus,
        approved: image.approved,
      },
    ];
  }

  return [];
}

function getPublicStorageUrl(bucket: string, path: string) {
  if (!supabase) {
    return "";
  }

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

function safeFileName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "");
}

function buildLabelledPhotoFileName(
  photo: { id: string; label?: string; fileName?: string },
  fallbackFileName: string,
) {
  const sourceName = photo.fileName || fallbackFileName;
  const extension = getFileExtension(sourceName);
  const label = photo.label || "garden-photo";

  return `${safeFileName(label)}-${photo.id}${extension}`;
}

function getFileExtension(fileName: string) {
  const match = fileName.match(/\.[a-z0-9]+$/i);

  return match ? match[0].toLowerCase() : "";
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
