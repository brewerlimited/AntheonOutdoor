import { AdminAuthGate } from "@/components/AdminAuthGate";
import { AdminProposalPack } from "@/components/AdminProposalPack";

export default async function AdminProposalPackPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;

  return (
    <main>
      <section className="page-hero compact">
        <p className="eyebrow">Proposal pack</p>
        <h1>Five-minute proposal review.</h1>
        <p>
          Review the structured proposal versions before sharing the customer
          preview. No final pricing or construction-ready design is implied.
        </p>
      </section>
      <AdminAuthGate>
        <AdminProposalPack leadId={leadId} />
      </AdminAuthGate>
    </main>
  );
}
