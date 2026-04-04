"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/departments": "Department Management",
  "/students": "Student Management",
  "/teachers": "Teacher Management",
  "/courses": "Course Management",
  "/semesters": "Semester Management",
  "/sections": "Section Management",
  "/enrollments": "Enrollment Management",
  "/attendance": "Attendance Management",
  "/results": "Result Management",
  "/payments": "Payment Management",
  "/reports": "Search & Reporting",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "Student Management System";

  return (
    <div className="flex min-h-screen gap-4 p-3 md:p-6 lg:p-8">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={title} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
