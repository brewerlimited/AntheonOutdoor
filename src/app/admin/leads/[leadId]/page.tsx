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
        <h1>Design Studio.</h1>
        <p>
          Prepare the existing plan, scale, layout concepts, final masterplan
          and one hero render for the customer consultation pack.
        </p>
      </section>
      <AdminAuthGate>
        <AdminLeadDetail leadId={leadId} />
      </AdminAuthGate>
    </main>
  );
}
