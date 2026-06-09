"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { mockLeads } from "@/data/content";
import { loadLeads } from "@/data/storage";
import type { GardenBriefLead } from "@/data/types";
import { calculateBudgetFit } from "@/lib/budgetRules";
import { createVersionDesignMemories } from "@/lib/designMemory";

export function AdminLeads() {
  const [leads, setLeads] = useState<GardenBriefLead[]>(mockLeads);

  useEffect(() => {
    let active = true;

    loadLeads().then((storedLeads) => {
      if (active) {
        setLeads(storedLeads.length ? storedLeads : mockLeads);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const displayLeads = useMemo(() => leads.map(withBudgetFallback), [leads]);

  return (
    <section className="section admin-section">
      <div className="admin-toolbar">
        <div>
          <p className="eyebrow">Lead workspace</p>
          <h2>Submitted garden briefs</h2>
        </div>
        <p>{leads.length} lead{leads.length === 1 ? "" : "s"}</p>
      </div>
      <div className="lead-table-wrap">
        <table className="lead-table">
          <thead>
            <tr>
              <th>Submitted</th>
              <th>Client</th>
              <th>Project</th>
              <th>Budget</th>
              <th>Style</th>
              <th>Proposal</th>
              <th>Images</th>
              <th>Sent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayLeads.map((lead) => (
              <tr key={lead.id}>
                <td data-label="Submitted">{formatSubmittedDate(lead.createdAt)}</td>
                <td data-label="Client">
                  <strong>{lead.fullName || "Unnamed lead"}</strong>
                  <span>{lead.email || lead.phone || "No contact added"}</span>
                </td>
                <td data-label="Project">
                  <strong>{lead.projectType || "Not selected"}</strong>
                  <span>{formatList(lead.mustHaves).slice(0, 90)}</span>
                </td>
                <td data-label="Budget">
                  <strong>{lead.budgetBand || "Not selected"}</strong>
                  <span>{lead.budgetPressure ?? "Not calculated"} pressure</span>
                </td>
                <td data-label="Style">
                  <strong>{lead.preferredStyle || "Not selected"}</strong>
                  <span>{lead.plantingMaintenance || "Maintenance not set"}</span>
                  <span>{lead.plantingColourScheme || "Colour not set"}</span>
                  {lead.styleQuizResult ? <span>Quiz: {lead.styleQuizResult.styleName}</span> : null}
                </td>
                <td data-label="Proposal">
                  <StatusBadge>{lead.proposalStatus ?? "Brief Received"}</StatusBadge>
                </td>
                <td data-label="Images">{getImageStatusSummary(lead)}</td>
                <td data-label="Sent">
                  {lead.proposalSentAt ? formatSubmittedDate(lead.proposalSentAt) : "Not sent"}
                </td>
                <td data-label="Actions">
                  <div className="table-actions">
                    <Link className="text-link" href={`/admin/leads/${lead.id}`}>
                      Studio
                    </Link>
                    <Link className="text-link" href={`/admin/leads/${lead.id}/proposal`}>
                      Proposal
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function withBudgetFallback(lead: GardenBriefLead): GardenBriefLead {
  if (
    lead.budgetPressure &&
    lead.budgetGuidance &&
    lead.withinBudgetDesignMemory?.plantingPalette
  ) {
    return lead;
  }

  const fit = calculateBudgetFit({
    budgetBand: lead.budgetBand,
    gardenSize: lead.gardenSize,
    mustHaves: lead.mustHaves ?? [],
    niceToHaves: lead.niceToHaves ?? [],
  });

  const leadWithBudget = {
    ...lead,
    proposalStatus: lead.proposalStatus ?? "Brief Received",
    approvedMustHaves: fit.approvedMustHaves,
    cautionMustHaves: fit.cautionMustHaves,
    excludedMustHaves: fit.excludedMustHaves,
    approvedNiceToHaves: fit.approvedNiceToHaves,
    excludedNiceToHaves: fit.excludedNiceToHaves,
    withinBudgetFeatures: fit.withinBudgetFeatures,
    enhancedDesignFeatures: fit.enhancedDesignFeatures,
    dreamVersionFeatures: fit.dreamVersionFeatures,
    budgetGuidance: fit.budgetGuidance,
    budgetPressure: fit.estimatedBudgetPressure,
  };

  const designMemories = createVersionDesignMemories(leadWithBudget);

  return {
    ...leadWithBudget,
    ...designMemories,
    designMemory: designMemories.withinBudgetDesignMemory,
  };
}

function StatusBadge({ children }: { children: string }) {
  return <span className="status-badge">{children}</span>;
}

function formatList(items: string[] | undefined) {
  return items?.length ? items.join(", ") : "None selected";
}

function formatSubmittedDate(value: string | undefined) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getImageStatusSummary(lead: GardenBriefLead) {
  const images = lead.proposalImages;

  if (!images) {
    return "No concept images added";
  }

  const statuses = [
    images.withinBudget?.imageStatus,
    images.enhancedDesign?.imageStatus,
    images.dreamVersion?.imageStatus,
  ].filter(Boolean);

  return statuses.length ? statuses.join(" / ") : "No concept images added";
}
