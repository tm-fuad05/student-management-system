"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { HiOutlineArrowRightOnRectangle } from "react-icons/hi2";
import { useAuth } from "@/context/auth-context";
import { APP_NAV } from "@/lib/nav";
import { canAccessModule } from "@/lib/permissions";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="glass-panel flex h-full w-64 shrink-0 flex-col rounded-2xl p-3 md:w-72">
      <div className="mb-6 px-2 pt-2">
        <p className="text-xs font-medium uppercase tracking-widest text-sky-400/90">
          Nexus Campus
        </p>
        <h1 className="mt-1 font-semibold text-slate-100">Student MS</h1>
        <p className="mt-1 truncate text-xs text-slate-500">
          {user?.username} · {user?.role.replace("_", " ")}
        </p>
      </div>
      <nav className="scrollbar-thin flex flex-1 flex-col gap-0.5 overflow-y-auto pr-1">
        {APP_NAV.filter((item) =>
          user ? canAccessModule(user.role, item.key) : false,
        ).map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.Icon;
          return (
            <Link key={item.href} href={item.href} className="block">
              <motion.span
                whileHover={{ x: 2 }}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-sky-500/15 text-sky-100 ring-1 ring-sky-500/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
                {item.label}
              </motion.span>
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={() => logout()}
        className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-rose-300/90 transition hover:bg-rose-500/10"
      >
        <HiOutlineArrowRightOnRectangle className="h-5 w-5" />
        Logout
      </button>
    </aside>
  );
}
