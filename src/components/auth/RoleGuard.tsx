"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { canAccessModule } from "@/lib/permissions";
import type { ModuleKey } from "@/lib/types";

export function RoleGuard({
  moduleKey,
  children,
}: {
  moduleKey: ModuleKey;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!user || !canAccessModule(user.role, moduleKey)) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center">
        <p className="text-slate-300">You don&apos;t have access to this module.</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-sky-400 underline-offset-4 hover:underline"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}
