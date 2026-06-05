import { AdminAuthGate } from "@/components/AdminAuthGate";
import { AdminLeads } from "@/components/AdminLeads";

export default function AdminLeadsPage() {
  return (
    <main>
      <section className="page-hero compact">
        <p className="eyebrow">Admin workspace</p>
        <h1>Lead review.</h1>
        <p>Review submitted garden briefs, proposal status and uploaded concept visuals.</p>
      </section>
      <AdminAuthGate>
        <AdminLeads />
      </AdminAuthGate>
    </main>
  );
}
