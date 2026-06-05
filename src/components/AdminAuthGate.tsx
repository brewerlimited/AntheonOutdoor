"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase().trim();

export function isAllowedAdmin(user: User | null) {
  if (!user?.email || !adminEmail) {
    return false;
  }

  return user.email.toLowerCase() === adminEmail;
}

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const [loading, setLoading] = useState(configured);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!configured || !supabase) {
      return;
    }

    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setUser(data.user);
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [configured]);

  async function signOut() {
    await supabase?.auth.signOut();
    setUser(null);
  }

  if (!configured) {
    return (
      <section className="section">
        <div className="memory-panel">
          <p className="eyebrow">Admin login</p>
          <h2>Supabase is not configured yet.</h2>
          <p>
            Add your Supabase URL, anon key and admin email to `.env.local`,
            then restart the dev server.
          </p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="section">
        <div className="memory-panel">
          <p className="eyebrow">Admin login</p>
          <h2>Checking access.</h2>
        </div>
      </section>
    );
  }

  if (!adminEmail) {
    return (
      <section className="section">
        <div className="memory-panel">
          <p className="eyebrow">Admin login</p>
          <h2>Admin email is not set.</h2>
          <p>Add `NEXT_PUBLIC_ADMIN_EMAIL` to `.env.local`.</p>
        </div>
      </section>
    );
  }

  if (!isAllowedAdmin(user)) {
    return (
      <section className="section">
        <div className="memory-panel">
          <p className="eyebrow">Private admin</p>
          <h2>Admin access only.</h2>
          <p>
            Sign in with the Anthēon admin account to view leads, design memory
            and proposal packs.
          </p>
          <div className="button-row">
            <Link className="button button-primary" href="/admin/login">
              Admin login
            </Link>
            {user ? (
              <button className="button button-secondary" type="button" onClick={signOut}>
                Sign out {user.email}
              </button>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="admin-session-bar">
        <span>Signed in as {user?.email}</span>
        <button type="button" onClick={signOut}>
          Sign out
        </button>
      </div>
      {children}
    </>
  );
}
