import { AdminLogin } from "@/components/AdminLogin";

export default function AdminLoginPage() {
  return (
    <main>
      <section className="page-hero compact">
        <p className="eyebrow">Admin login</p>
        <h1>Private workspace.</h1>
        <p>
          Sign in to review Anthēon garden briefs, layout preparation notes and
          proposal packs.
        </p>
      </section>
      <AdminLogin />
    </main>
  );
}
