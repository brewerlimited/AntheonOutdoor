"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isAllowedAdmin } from "@/components/AdminAuthGate";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setIsSignedIn(isAllowedAdmin(data.user));
    });
  }, []);

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setMessage("Supabase is not configured yet.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (!isAllowedAdmin(data.user)) {
      await supabase.auth.signOut();
      setMessage("This account is not authorised for Anthēon admin access.");
      return;
    }

    setIsSignedIn(true);
    setMessage("Signed in. You can now open the admin workspace.");
  }

  if (!isSupabaseConfigured()) {
    return (
      <section className="section">
        <div className="brief-form admin-login-form">
          <p className="eyebrow">Admin login</p>
          <h2>Supabase is not configured yet.</h2>
          <p>Add your Supabase URL, anon key and admin email to `.env.local`.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section admin-login-section">
      <form className="brief-form admin-login-form" onSubmit={submitLogin}>
        <p className="eyebrow">Private admin</p>
        <h2>Sign in to Anthēon admin.</h2>
        <p>
          This area is only for the Anthēon admin account. Customer accounts can
          be added later as a separate flow.
        </p>
        <label>
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Password
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {message ? <p className="helper-text">{message}</p> : null}
        <div className="button-row">
          <button className="button button-primary" disabled={loading} type="submit">
            {loading ? "Signing in" : "Sign in"}
          </button>
          {isSignedIn ? (
            <Link className="button button-secondary" href="/admin/leads">
              Open admin workspace
            </Link>
          ) : null}
        </div>
      </form>
    </section>
  );
}
