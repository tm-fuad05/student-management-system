"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HiOutlineLockClosed, HiOutlineUser } from "react-icons/hi2";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const { login, user, ready } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("demo.admin");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      login(username, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.15),_transparent_50%)]" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="glass-panel relative w-full max-w-md rounded-3xl p-8 shadow-[0_0_80px_-20px_var(--glow)]"
      >
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400/90">
            Nexus Campus
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gradient">
            Student Management
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in with your campus account. Demo:{" "}
            <span className="text-slate-400">demo.admin</span> /{" "}
            <span className="text-slate-400">password</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-slate-100 outline-none ring-sky-500/40 placeholder:text-slate-600 focus:ring-2"
                placeholder="you@campus.edu"
                autoComplete="username"
                required
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
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-slate-100 outline-none ring-sky-500/40 placeholder:text-slate-600 focus:ring-2"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25"
          >
            Sign in
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New here?{" "}
          <Link
            href="/signup"
            className="font-medium text-sky-400 hover:text-sky-300 hover:underline"
          >
            Create an account
          </Link>
        </p>

       
      </motion.div>
    </div>
  );
}
