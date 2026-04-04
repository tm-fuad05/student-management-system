"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineUser,
} from "react-icons/hi2";
import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/lib/types";

const ROLES: { value: UserRole; label: string; hint: string }[] = [
  { value: "admin", label: "Admin", hint: "Full access to all modules" },
  {
    value: "academic_staff",
    label: "Academic Staff",
    hint: "Operational access across academics & finance",
  },
  {
    value: "teacher",
    label: "Teacher",
    hint: "Teaching workflows; sensitive admin modules hidden",
  },
];

export default function SignupPage() {
  const { signup, user, ready } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<UserRole>("academic_staff");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    try {
      signup(username, password, role, email.trim() || undefined);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.");
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.12),_transparent_55%)]" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="glass-panel relative w-full max-w-md rounded-3xl p-8 shadow-[0_0_80px_-24px_rgba(139,92,246,0.35)]"
      >
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400/90">
            Nexus Campus
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gradient">Create account</h1>
          <p className="mt-2 text-sm text-slate-500">
            Register for mock access. Credentials are stored in this browser only.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Username
            </label>
            <div className="relative">
              <HiOutlineUser className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-slate-100 outline-none ring-violet-500/35 placeholder:text-slate-600 focus:ring-2"
                placeholder="min. 3 characters"
                autoComplete="username"
                minLength={3}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Email <span className="text-slate-600">(optional)</span>
            </label>
            <div className="relative">
              <HiOutlineEnvelope className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-slate-100 outline-none ring-violet-500/35 placeholder:text-slate-600 focus:ring-2"
                placeholder="you@campus.edu"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Password
            </label>
            <div className="relative">
              <HiOutlineLockClosed className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-slate-100 outline-none ring-violet-500/35 placeholder:text-slate-600 focus:ring-2"
                placeholder="min. 6 characters"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Confirm password
            </label>
            <div className="relative">
              <HiOutlineLockClosed className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-slate-100 outline-none ring-violet-500/35 placeholder:text-slate-600 focus:ring-2"
                placeholder="repeat password"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Role
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                    role === r.value
                      ? "border-violet-500/50 bg-violet-500/15 text-violet-100"
                      : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20"
                  }`}
                >
                  <span className="block font-medium">{r.label}</span>
                  <span className="mt-0.5 block text-[10px] leading-tight text-slate-500">
                    {r.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-sky-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20"
          >
            Sign up & enter dashboard
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-sky-400 hover:text-sky-300 hover:underline"
          >
            Sign in
          </Link>
        </p>

       
      </motion.div>
    </div>
  );
}
