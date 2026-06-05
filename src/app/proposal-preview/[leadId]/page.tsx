import { ProposalPreview } from "@/components/ProposalPreview";

export default async function ProposalPreviewPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;

  return <ProposalPreview leadId={leadId} />;
}
