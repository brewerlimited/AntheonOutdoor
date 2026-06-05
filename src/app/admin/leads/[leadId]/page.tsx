import { AdminAuthGate } from "@/components/AdminAuthGate";
import { AdminLeadDetail } from "@/components/AdminLeadDetail";

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;

  return (
    <main>
      <section className="page-hero compact">
        <p className="eyebrow">Admin review</p>
        <h1>Design Memory.</h1>
        <p>
          Design Memory controls feature placement across all visual concepts
          and prevents duplicated features between views.
        </p>
      </section>
      <AdminAuthGate>
        <AdminLeadDetail leadId={leadId} />
      </AdminAuthGate>
    </main>
  );
}
