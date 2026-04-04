"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo } from "react";
import {
  HiArrowRight,
  HiOutlineAcademicCap,
  HiOutlineBanknotes,
  HiOutlineBookOpen,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import { useAuth } from "@/context/auth-context";
import { useData } from "@/context/data-context";
import { APP_NAV } from "@/lib/nav";
import { canAccessModule } from "@/lib/permissions";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { students, teachers, courses, payments, activities } = useData();
  const { user } = useAuth();

  const paymentStats = useMemo(() => {
    const paid = payments.filter((p) => p.payment_status === "Paid");
    const pending = payments.filter((p) => p.payment_status === "Pending");
    const total = paid.reduce((s, p) => s + p.amount, 0);
    return { total, pendingCount: pending.length, count: payments.length };
  }, [payments]);

  const navItems = useMemo(() => {
    if (!user) return [];
    return APP_NAV.filter(
      (n) => n.key !== "dashboard" && canAccessModule(user.role, n.key),
    );
  }, [user]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div
        variants={item}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <Stat
          label="Students"
          value={students.length}
          icon={HiOutlineAcademicCap}
          tone="sky"
        />
        <Stat
          label="Teachers"
          value={teachers.length}
          icon={HiOutlineUserGroup}
          tone="violet"
        />
        <Stat
          label="Courses"
          value={courses.length}
          icon={HiOutlineBookOpen}
          tone="emerald"
        />
        <div className="glass-panel relative overflow-hidden rounded-2xl p-5 ring-1 ring-amber-500/20">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Payment summary
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-100">
                ${paymentStats.total.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {paymentStats.pendingCount} pending · {paymentStats.count}{" "}
                records
              </p>
            </div>
            <span className="rounded-xl bg-amber-500/15 p-2 text-amber-300 ring-1 ring-amber-500/25">
              <HiOutlineBanknotes className="h-6 w-6" />
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={item} className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">
              Quick navigation
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {navItems.map((n) => (
              <Link key={n.href} href={n.href}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="glass-panel group flex items-center justify-between gap-3 rounded-2xl p-4 transition hover:ring-1 hover:ring-sky-500/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-white/5 p-2 text-sky-300 ring-1 ring-white/10">
                      <n.Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium text-slate-200">
                      {n.label}
                    </span>
                  </div>
                  <HiArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-sky-400" />
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item}>
          <h3 className="mb-3 text-sm font-semibold text-slate-200">
            Recent activity
          </h3>
          <div className="glass-panel max-h-[420px] space-y-3 overflow-y-auto rounded-2xl p-4 scrollbar-thin">
            {activities.slice(0, 12).map((a) => (
              <div
                key={a.id}
                className="border-b border-white/5 pb-3 last:border-0 last:pb-0"
              >
                <p className="text-sm text-slate-300">{a.label}</p>
                <p className="mt-1 text-[11px] text-slate-600">
                  {new Date(a.time).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof HiOutlineAcademicCap;
  tone: "sky" | "violet" | "emerald";
}) {
  const ring =
    tone === "sky"
      ? "ring-sky-500/25"
      : tone === "violet"
        ? "ring-violet-500/25"
        : "ring-emerald-500/25";
  const bg =
    tone === "sky"
      ? "bg-sky-500/15 text-sky-300"
      : tone === "violet"
        ? "bg-violet-500/15 text-violet-300"
        : "bg-emerald-500/15 text-emerald-300";

  return (
    <div className={`glass-panel rounded-2xl p-5 ring-1 ${ring}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-100">
            {value}
          </p>
        </div>
        <span className={`rounded-xl p-2 ring-1 ring-white/10 ${bg}`}>
          <Icon className="h-6 w-6" />
        </span>
      </div>
    </div>
  );
}
