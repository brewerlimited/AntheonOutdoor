# Supabase Setup

1. Open your Supabase project.
2. Go to SQL Editor and run `supabase/schema.sql`.
   This creates:
   - `leads`
   - `lead_photos`
   - `design_memories`
   - `proposal_packs`
   - `proposal_images`
   - `garden-brief-photos` Storage bucket
   - `proposal-concept-images` Storage bucket
3. Copy `.env.example` to `.env.local`.
4. Add your project URL and anon public key:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
NEXT_PUBLIC_ADMIN_EMAIL=you@example.com
```

5. In Supabase Auth, create an admin user for that same email address.
6. In Supabase SQL Editor, add your admin email to the allowlist:

```sql
insert into public.admin_users (email)
values ('you@example.com')
on conflict (email) do nothing;
```

7. Restart the dev server with `npm run dev`.

The app now uses Supabase when those environment variables are present. Customer
garden photos upload to `garden-brief-photos`; admin proposal visuals upload to
`proposal-concept-images`; lead details, budget rules, design memory, proposal
packs and image metadata are synced into structured tables.

Admin pages are protected in the frontend by Supabase Auth and in the database
by RLS policies that check the signed-in email against `public.admin_users`.

If environment variables are missing, it falls back to the existing localStorage
flow so the MVP still runs locally.

## MVP Security Note

Anonymous users can submit garden briefs and upload garden photos. Reading and
updating leads, design memory, proposal packs and proposal images requires the
authenticated admin email in `public.admin_users`.
