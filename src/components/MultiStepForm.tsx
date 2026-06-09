"use client";

import { useEffect, useMemo, useState } from "react";
import { budgetBands, featureOptions, preferredStyles, projectTypes } from "@/data/content";
import { saveLead } from "@/data/storage";
import type {
  GardenBriefLead,
  GardenPhotoLabel,
  GardenSize,
  PlantingColourScheme,
  PlantingMaintenance,
  StyleQuizStoredResult,
} from "@/data/types";
import { calculateBudgetFit } from "@/lib/budgetRules";
import { createVersionDesignMemories } from "@/lib/designMemory";
import { normaliseInvestmentBand } from "@/lib/investmentBands";
import { loadStyleQuizResult } from "@/lib/styleQuiz";
import { BudgetBandCard } from "./BudgetBandCard";
import { Button } from "./Button";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  projectType: "",
  preferredStyle: "",
  plantingMaintenance: "" as PlantingMaintenance,
  plantingColourScheme: "" as PlantingColourScheme,
  budgetBand: "",
  mustHaves: [] as string[],
  niceToHaves: [] as string[],
  photos: [] as GardenPhotoLabel[],
  gardenSize: "" as GardenSize,
  gardenShape: "",
  housePosition: "",
  existingFeatures: [] as string[],
  layoutNotes: "",
  notes: "",
};

const stepTitles = [
  "Your details",
  "Project direction",
  "Features",
  "Photos & notes",
];

const photoLabelOptions = [
  "View from house looking into garden",
  "View from rear garden looking back to house",
  "Left boundary",
  "Right boundary",
  "Rear boundary",
  "Patio / doors area",
  "Existing feature / problem area",
  "Other",
];

const plantingMaintenanceOptions: PlantingMaintenance[] = [
  "Low maintenance",
  "Medium maintenance",
  "High maintenance",
  "Not sure",
];
const plantingColourSchemeOptions: PlantingColourScheme[] = [
  "Soft whites and greens",
  "Purples, blues and silvers",
  "Warm Mediterranean tones",
  "Evergreen and architectural",
  "Soft pinks and whites",
  "Bold seasonal colour",
  "Natural meadow mix",
  "Not sure",
];

export function MultiStepForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [photoFiles, setPhotoFiles] = useState<Record<string, File>>({});
  const [submittedLead, setSubmittedLead] = useState<GardenBriefLead | null>(null);
  const [quizResult, setQuizResult] = useState<StyleQuizStoredResult | null>(null);
  const [isCustomStyle, setIsCustomStyle] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const result = loadStyleQuizResult();

      if (!result) {
        return;
      }

      setQuizResult(result);
      setForm((current) => ({
        ...current,
        preferredStyle: result.matchingBriefStyle || current.preferredStyle,
        budgetBand: normaliseInvestmentBand(result.budgetBand) || current.budgetBand,
      }));
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const selectedBudget = useMemo(
    () => budgetBands.find((band) => `${band.title}: ${band.range}` === form.budgetBand),
    [form.budgetBand],
  );
  const budgetFit = useMemo(
    () =>
      calculateBudgetFit({
        budgetBand: form.budgetBand,
        gardenSize: form.gardenSize,
        mustHaves: form.mustHaves,
        niceToHaves: form.niceToHaves,
      }),
    [form.budgetBand, form.gardenSize, form.mustHaves, form.niceToHaves],
  );

  function updateField(name: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleListField(
    name: "mustHaves" | "niceToHaves",
    feature: string,
  ) {
    setForm((current) => {
      const values = current[name];
      const next = values.includes(feature)
        ? values.filter((item) => item !== feature)
        : [...values, feature];

      return { ...current, [name]: next };
    });
  }

  function addPhotos(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    const nextPhotos = Array.from(files).map((file) => {
      const id = crypto.randomUUID();

      setPhotoFiles((current) => ({ ...current, [id]: file }));

      return {
        id,
        fileName: file.name,
        previewUrl: URL.createObjectURL(file),
        label: "",
        notes: "",
      };
    });

    setForm((current) => ({ ...current, photos: [...current.photos, ...nextPhotos] }));
  }

  function updatePhoto(id: string, field: "label" | "notes", value: string) {
    setForm((current) => ({
      ...current,
      photos: current.photos.map((photo) =>
        photo.id === id ? { ...photo, [field]: value } : photo,
      ),
    }));
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step < stepTitles.length - 1) {
      setStep((current) => Math.min(stepTitles.length - 1, current + 1));
      return;
    }

    const leadBase: GardenBriefLead = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: "New",
      proposalStatus: "Brief Received",
      ...form,
      styleQuizResult: quizResult ?? undefined,
      approvedMustHaves: budgetFit.approvedMustHaves,
      cautionMustHaves: budgetFit.cautionMustHaves,
      excludedMustHaves: budgetFit.excludedMustHaves,
      approvedNiceToHaves: budgetFit.approvedNiceToHaves,
      excludedNiceToHaves: budgetFit.excludedNiceToHaves,
      withinBudgetFeatures: budgetFit.withinBudgetFeatures,
      enhancedDesignFeatures: budgetFit.enhancedDesignFeatures,
      dreamVersionFeatures: budgetFit.dreamVersionFeatures,
      budgetGuidance: budgetFit.budgetGuidance,
      budgetPressure: budgetFit.estimatedBudgetPressure,
    };
    const designMemories = createVersionDesignMemories(leadBase);
    const lead: GardenBriefLead = {
      ...leadBase,
      ...designMemories,
      designMemory: designMemories.withinBudgetDesignMemory,
    };

    const savedLead = await saveLead(
      lead,
      form.photos
        .map((photo) => ({ photoId: photo.id, file: photoFiles[photo.id] }))
        .filter((upload): upload is { photoId: string; file: File } => Boolean(upload.file)),
    );
    setSubmittedLead(savedLead);
  }

  if (submittedLead) {
    return (
      <div className="success-state">
        <p className="eyebrow">Brief received</p>
        <h2>Thank you — your garden brief has been received.</h2>
        <p>
          We’ll review your space, photos, ideas and preferred investment level,
          then contact you within 48 hours to talk through your design direction
          or ask any follow-up questions.
        </p>
        <p>
          During this review, we may use your submitted photos, address/location
          context and selected features to prepare early visual direction options
          for your garden.
        </p>
        <div className="lead-preview">
          <span>{submittedLead.fullName}</span>
          <strong>{submittedLead.budgetBand || "Budget to be discussed"}</strong>
          <p>{submittedLead.preferredStyle || "Style to be refined"}</p>
        </div>
        <div className="success-timeline">
          <div>
            <span>01</span>
            <strong>Brief received</strong>
            <p>Your brief has been prepared for review.</p>
          </div>
          <div>
            <span>02</span>
            <strong>Design direction review</strong>
            <p>Photos, layout, budget and requested features are considered together.</p>
          </div>
          <div>
            <span>03</span>
            <strong>Follow-up within 48 hours</strong>
            <p>We’ll talk through the direction or ask any useful follow-up questions.</p>
          </div>
        </div>
        <BudgetFitPanel
          approvedMustHaves={submittedLead.approvedMustHaves ?? []}
          cautionMustHaves={submittedLead.cautionMustHaves ?? []}
          excludedMustHaves={submittedLead.excludedMustHaves ?? []}
          approvedNiceToHaves={submittedLead.approvedNiceToHaves ?? []}
          excludedNiceToHaves={submittedLead.excludedNiceToHaves ?? []}
          guidance={submittedLead.budgetGuidance ?? ""}
          pressure={submittedLead.budgetPressure ?? "Low"}
        />
        <ProposalVersions lead={submittedLead} />
        <div className="button-row">
          <Button
            type="button"
            onClick={() => {
              setSubmittedLead(null);
              setForm(initialForm);
              setPhotoFiles({});
              setIsCustomStyle(false);
              setStep(0);
            }}
          >
            Prepare another brief
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="brief-form" onSubmit={submitForm}>
      {quizResult ? (
        <div className="quiz-brief-note">
          <span>Style quiz result</span>
          <p>
            Based on your style quiz, we’ve pre-selected{" "}
            <strong>{quizResult.styleName}</strong>. You can change this at any
            time.
          </p>
        </div>
      ) : null}
      <div className="form-progress">
        {stepTitles.map((title, index) => (
          <button
            className={index === step ? "active" : ""}
            key={title}
            type="button"
            onClick={() => setStep(index)}
          >
            <span>{index + 1}</span>
            {title}
          </button>
        ))}
      </div>

      {step === 0 ? (
        <div className="form-panel">
          <h2>Your details</h2>
          <div className="field-grid">
            <label>
              Full name
              <input
                required
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
              />
            </label>
            <label>
              Email
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
            </label>
            <label>
              Phone
              <input
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
              />
            </label>
            <label>
              Address / postcode
              <input
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
              />
              <span className="helper-text">
                Your address helps us review the approximate garden layout using
                mapping tools before your consultation.
              </span>
            </label>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="form-panel">
          <h2>Project direction</h2>
          <label>
            Project type
            <select
              value={form.projectType}
              onChange={(event) => updateField("projectType", event.target.value)}
            >
              <option value="">Select a project type</option>
              {projectTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <label>
            Preferred style
            <select
              value={isCustomStyle ? "Custom style" : form.preferredStyle}
              onChange={(event) => {
                if (event.target.value === "Custom style") {
                  setIsCustomStyle(true);
                  updateField("preferredStyle", "");
                  return;
                }

                setIsCustomStyle(false);
                updateField("preferredStyle", event.target.value);
              }}
            >
              <option value="">Select a preferred style</option>
              {preferredStyles.map((style) => (
                <option key={style}>{style}</option>
              ))}
              <option>Custom style</option>
            </select>
          </label>
          {isCustomStyle ? (
            <label>
              Describe your preferred style
              <input
                value={form.preferredStyle}
                onChange={(event) => updateField("preferredStyle", event.target.value)}
                placeholder="For example: calm Japanese courtyard with dark timber and soft planting"
              />
            </label>
          ) : null}
          <label>
            How much ongoing garden maintenance would you be comfortable with?
            <select
              value={form.plantingMaintenance}
              onChange={(event) =>
                updateField("plantingMaintenance", event.target.value as PlantingMaintenance)
              }
            >
              <option value="">Select a maintenance level</option>
              {plantingMaintenanceOptions.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </label>
          <div className="budget-section">
            <p className="field-label">
              What level of investment are you comfortable making into your outdoor space?
            </p>
            <div className="budget-grid">
              {budgetBands.map((band) => {
                const value = `${band.title}: ${band.range}`;
                return (
                  <BudgetBandCard
                    key={band.title}
                    {...band}
                    selected={form.budgetBand === value}
                    onSelect={() => updateField("budgetBand", value)}
                  />
                );
              })}
            </div>
            {selectedBudget ? <p className="helper-text">{selectedBudget.description}</p> : null}
            <p className="helper-text">
              This helps us shape a design direction that feels ambitious but
              realistic. Final scope and pricing are subject to consultation,
              survey and formal quotation.
            </p>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="form-panel">
          <h2>Features</h2>
          <FeatureChecklist
            label="Must-have features"
            options={featureOptions}
            values={form.mustHaves}
            onToggle={(feature) => toggleListField("mustHaves", feature)}
          />
          <FeatureChecklist
            label="Nice-to-have features"
            options={featureOptions}
            values={form.niceToHaves}
            onToggle={(feature) => toggleListField("niceToHaves", feature)}
          />
          {form.budgetBand && (form.mustHaves.length || form.niceToHaves.length) ? (
            <BudgetFitPanel
              approvedMustHaves={budgetFit.approvedMustHaves}
              cautionMustHaves={budgetFit.cautionMustHaves}
              excludedMustHaves={budgetFit.excludedMustHaves}
              approvedNiceToHaves={budgetFit.approvedNiceToHaves}
              excludedNiceToHaves={budgetFit.excludedNiceToHaves}
              guidance={budgetFit.budgetGuidance}
              pressure={budgetFit.estimatedBudgetPressure}
            />
          ) : null}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="form-panel">
          <h2>Photos & notes</h2>
          <label>
            Preferred planting colour scheme
            <select
              value={form.plantingColourScheme}
              onChange={(event) =>
                updateField(
                  "plantingColourScheme",
                  event.target.value as PlantingColourScheme,
                )
              }
            >
              <option value="">Select a colour direction</option>
              {plantingColourSchemeOptions.map((scheme) => (
                <option key={scheme}>{scheme}</option>
              ))}
            </select>
          </label>
          <div className="upload-placeholder">
            <span>Garden photos / videos</span>
            <strong>Local photo labelling</strong>
            <p>
              Please have images ready to upload. Add garden photos and label
              each view so we can prepare your consultation more accurately.
            </p>
            <input
              accept="image/*,video/*"
              multiple
              type="file"
              onChange={(event) => addPhotos(event.target.files)}
            />
          </div>
          {form.photos.length ? (
            <div className="photo-list">
              {form.photos.map((photo) => (
                <article className="photo-card" key={photo.id}>
                  {photo.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo.previewUrl} alt="" />
                  ) : null}
                  <div>
                    <h3>{photo.fileName}</h3>
                    <label>
                      Photo label
                      <select
                        value={photo.label}
                        onChange={(event) => updatePhoto(photo.id, "label", event.target.value)}
                      >
                        <option value="">Select a view label</option>
                        {photoLabelOptions.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Notes for this photo
                      <textarea
                        rows={3}
                        value={photo.notes}
                        onChange={(event) => updatePhoto(photo.id, "notes", event.target.value)}
                        placeholder="Anything we should notice in this view?"
                      />
                    </label>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
          <label>
            Additional notes
            <textarea
              rows={6}
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Tell us about the space, access, priorities, dislikes or timing."
            />
          </label>
        </div>
      ) : null}

      <div className="form-actions">
        <Button
          type="button"
          variant="secondary"
          disabled={step === 0}
          onClick={() => setStep((current) => Math.max(0, current - 1))}
        >
          Back
        </Button>
        {step < stepTitles.length - 1 ? (
          <Button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              setStep((current) => Math.min(stepTitles.length - 1, current + 1));
            }}
          >
            {step === 2 ? "Continue to photos" : "Continue"}
          </Button>
        ) : (
          <Button type="submit">Prepare Garden Brief</Button>
        )}
      </div>
    </form>
  );
}

function BudgetFitPanel({
  approvedMustHaves,
  cautionMustHaves,
  excludedMustHaves,
  approvedNiceToHaves,
  excludedNiceToHaves,
  guidance,
  pressure,
}: {
  approvedMustHaves: string[];
  cautionMustHaves: string[];
  excludedMustHaves: string[];
  approvedNiceToHaves: string[];
  excludedNiceToHaves: string[];
  guidance: string;
  pressure: "Low" | "Medium" | "High" | "Very High";
}) {
  return (
    <aside className="budget-fit-panel">
      <div className="budget-fit-header">
        <div>
          <p className="eyebrow">Budget fit</p>
          <h3>Investment-level guidance</h3>
        </div>
        <span>{pressure} pressure</span>
      </div>
      <p>{guidance}</p>
      <div className="budget-fit-grid">
        <FeatureBucket
          title="Best suited to this investment level"
          items={[...approvedMustHaves, ...approvedNiceToHaves]}
          fallback="Select features to see what aligns naturally."
        />
        <FeatureBucket
          title="May require careful specification"
          items={cautionMustHaves}
          fallback="No selected must-haves need careful specification yet."
        />
        <FeatureBucket
          title="Better suited to a higher investment version"
          items={[...excludedMustHaves, ...excludedNiceToHaves]}
          fallback="No selected features are reserved for an Enhanced or Dream version yet."
        />
      </div>
    </aside>
  );
}

function ProposalVersions({ lead }: { lead: GardenBriefLead }) {
  return (
    <div className="proposal-grid">
      <ProposalCard
        title="Within Budget"
        description="Uses approved must-haves only. Reserved items can be explored in the Enhanced or Dream version."
        features={lead.withinBudgetFeatures ?? []}
        reserved={lead.excludedMustHaves ?? []}
      />
      <ProposalCard
        title="Enhanced Design"
        description="Uses approved must-haves plus selected suitable nice-to-haves and carefully specified caution features."
        features={lead.enhancedDesignFeatures ?? []}
      />
      <ProposalCard
        title="Dream Version"
        description="Uses all requested features. This version may exceed your selected investment level."
        features={lead.dreamVersionFeatures ?? []}
      />
    </div>
  );
}

function ProposalCard({
  title,
  description,
  features,
  reserved = [],
}: {
  title: string;
  description: string;
  features: string[];
  reserved?: string[];
}) {
  return (
    <article className="proposal-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <FeatureList items={features} fallback="No features selected yet." />
      {reserved.length ? (
        <div className="reserved-list">
          <span>Reserved for Enhanced/Dream version</span>
          <FeatureList items={reserved} fallback="" />
        </div>
      ) : null}
    </article>
  );
}

function FeatureBucket({
  title,
  items,
  fallback,
}: {
  title: string;
  items: string[];
  fallback: string;
}) {
  return (
    <div>
      <h4>{title}</h4>
      <FeatureList items={items} fallback={fallback} />
    </div>
  );
}

function FeatureList({ items, fallback }: { items: string[]; fallback: string }) {
  if (!items.length) {
    return <p className="empty-list">{fallback}</p>;
  }

  return (
    <ul className="feature-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function FeatureChecklist({
  label,
  options,
  values,
  onToggle,
}: {
  label: string;
  options: string[];
  values: string[];
  onToggle: (feature: string) => void;
}) {
  return (
    <fieldset className="checklist">
      <legend>{label}</legend>
      <div className="chip-grid">
        {options.map((feature) => (
          <label className={values.includes(feature) ? "chip selected" : "chip"} key={feature}>
            <input
              type="checkbox"
              checked={values.includes(feature)}
              onChange={() => onToggle(feature)}
            />
            {feature}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
