"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qt-admin min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-neutral-950 text-white p-16">
        <Link href="/" className="qt-wordmark">
          QUARTZ<span className="qt-wordmark-dot">.</span>
          <span className="qt-wordmark-second">TIMES</span>
        </Link>
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-400">
            Behind the collection
          </p>
          <h2 className="text-6xl font-semibold tracking-tighter leading-tight mt-6">
            Good finds.
            <br />
            Thoughtfully managed.
          </h2>
        </div>
        <p className="text-sm text-neutral-500">
          Quartz Times · Store management
        </p>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="qt-wordmark mb-12 lg:hidden">
            QUARTZ<span className="qt-wordmark-dot">.</span>
            <span className="qt-wordmark-second">TIMES</span>
          </Link>
          <p className="qt-eyebrow qt-muted">Store management</p>
          <h1 className="text-4xl font-semibold tracking-tighter mt-4 mb-3">
            Welcome back.
          </h1>
          <p className="qt-muted text-sm mb-10">
            Sign in to manage your collection and inquiries.
          </p>
          {error && (
            <div role="alert" className="text-sm text-rose-600 mb-6 flex gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="admin-email" className="block text-sm mb-2">
                Email address
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded border border-[var(--qt-line)] bg-[var(--qt-bg)] px-4 py-3"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-sm mb-2">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded border border-[var(--qt-line)] bg-[var(--qt-bg)] px-4 py-3"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="qt-button w-full"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ArrowRight size={18} />
              )}{" "}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <Link href="/products" className="qt-text-link qt-muted mt-8">
            Back to the collection
          </Link>
        </div>
      </div>
    </div>
  );
}
