"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { TableShell, Td, Th } from "@/components/ui/TableShell";
import { useData } from "@/context/data-context";

type ReportTab =
  | "students"
  | "teachers"
  | "courses"
  | "sections"
  | "enrollments"
  | "attendance"
  | "results"
  | "payments";

const TABS: { id: ReportTab; label: string }[] = [
  { id: "students", label: "Students" },
  { id: "teachers", label: "Teachers by dept" },
  { id: "courses", label: "Courses by dept" },
  { id: "sections", label: "Sections" },
  { id: "enrollments", label: "Enrollments" },
  { id: "attendance", label: "Attendance" },
  { id: "results", label: "Results" },
  { id: "payments", label: "Payments" },
];

export default function ReportsPage() {
  const data = useData();
  const [tab, setTab] = useState<ReportTab>("students");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    const match = (vals: (string | undefined)[]) =>
      !s || vals.some((v) => (v ?? "").toLowerCase().includes(s));

    switch (tab) {
      case "students":
        return data.students
          .filter((x) => match([x.student_id, x.student_name, x.email]))
          .map((x) => ({
            cols: [
              x.student_id,
              x.student_name,
              data.departments.find((d) => d.dept_id === x.dept_id)?.dept_name ??
                x.dept_id,
              x.email,
            ],
          }));
      case "teachers":
        return data.teachers
          .filter((t) =>
            match([
              t.teacher_name,
              data.departments.find((d) => d.dept_id === t.dept_id)?.dept_name,
            ]),
          )
          .map((t) => ({
            cols: [
              t.teacher_id,
              t.teacher_name,
              data.departments.find((d) => d.dept_id === t.dept_id)?.dept_name ??
                t.dept_id,
              t.designation,
            ],
          }));
      case "courses":
        return data.courses
          .filter((c) =>
            match([
              c.course_code,
              c.course_title,
              data.departments.find((d) => d.dept_id === c.dept_id)?.dept_name,
            ]),
          )
          .map((c) => ({
            cols: [
              c.course_id,
              c.course_code,
              c.course_title,
              String(c.credit),
              data.departments.find((d) => d.dept_id === c.dept_id)?.dept_name ??
                c.dept_id,
            ],
          }));
      case "sections":
        return data.sections
          .filter((sec) => {
            const c = data.courses.find((x) => x.course_id === sec.course_id);
            const t = data.teachers.find((x) => x.teacher_id === sec.teacher_id);
            return match([sec.section_name, c?.course_code, t?.teacher_name]);
          })
          .map((sec) => ({
            cols: [
              sec.section_id,
              sec.section_name,
              data.courses.find((c) => c.course_id === sec.course_id)?.course_code ??
                "",
              data.teachers.find((t) => t.teacher_id === sec.teacher_id)
                ?.teacher_name ?? "",
              sec.room_no,
            ],
          }));
      case "enrollments":
        return data.enrollments
          .filter((e) => {
            const st = data.students.find((x) => x.student_id === e.student_id);
            return match([e.enrollment_id, st?.student_name]);
          })
          .map((e) => ({
            cols: [
              e.enrollment_id,
              data.students.find((s) => s.student_id === e.student_id)?.student_name ??
                "",
              e.section_id,
              e.enroll_date,
              e.status,
            ],
          }));
      case "attendance":
        return data.attendance
          .filter((a) => {
            const en = data.enrollments.find((x) => x.enrollment_id === a.enrollment_id);
            const st = en
              ? data.students.find((x) => x.student_id === en.student_id)
              : undefined;
            return match([a.attendance_date, st?.student_name, a.attendance_status]);
          })
          .map((a) => ({
            cols: [
              a.attendance_id,
              a.enrollment_id,
              a.attendance_date,
              a.attendance_status,
            ],
          }));
      case "results":
        return data.results
          .filter((r) => {
            const en = data.enrollments.find((x) => x.enrollment_id === r.enrollment_id);
            const st = en
              ? data.students.find((x) => x.student_id === en.student_id)
              : undefined;
            return match([st?.student_name, r.grade]);
          })
          .map((r) => ({
            cols: [
              r.result_id,
              r.enrollment_id,
              String(r.marks),
              r.grade,
              r.result_publish_date,
            ],
          }));
      case "payments":
        return data.payments
          .filter((p) => {
            const st = data.students.find((x) => x.student_id === p.student_id);
            return match([st?.student_name, p.payment_type, p.payment_status]);
          })
          .map((p) => ({
            cols: [
              p.payment_id,
              data.students.find((s) => s.student_id === p.student_id)?.student_name ??
                "",
              p.payment_date,
              String(p.amount),
              p.payment_type,
              p.payment_status,
            ],
          }));
      default:
        return [];
    }
  }, [data, tab, q]);

  const headers = useMemo(() => {
    switch (tab) {
      case "students":
        return ["ID", "Name", "Department", "Email"];
      case "teachers":
        return ["ID", "Name", "Department", "Designation"];
      case "courses":
        return ["ID", "Code", "Title", "Credit", "Department"];
      case "sections":
        return ["ID", "Section", "Course", "Teacher", "Room"];
      case "enrollments":
        return ["ID", "Student", "Section", "Date", "Status"];
      case "attendance":
        return ["ID", "Enrollment", "Date", "Status"];
      case "results":
        return ["ID", "Enrollment", "Marks", "Grade", "Published"];
      case "payments":
        return ["ID", "Student", "Date", "Amount", "Type", "Status"];
      default:
        return [];
    }
  }, [tab]);

  return (
    <RoleGuard moduleKey="reports">
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          Cross-module search for viva/demo reports. Results render as read-only tables.
        </p>

        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition sm:text-sm ${
                tab === t.id
                  ? "bg-sky-500/20 text-sky-100 ring-sky-500/40"
                  : "bg-white/5 text-slate-400 ring-white/10 hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-md">
          <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter current results…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm outline-none ring-sky-500/30 focus:ring-2"
          />
        </div>

        <motion.div
          key={tab + q}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-4"
        >
          <p className="mb-3 text-xs text-slate-500">
            {rows.length} row{rows.length === 1 ? "" : "s"}
          </p>
          <TableShell>
            <thead>
              <tr>
                {headers.map((h) => (
                  <Th key={h}>{h}</Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  {r.cols.map((c, j) => (
                    <Td key={j}>{c}</Td>
                  ))}
                </tr>
              ))}
            </tbody>
          </TableShell>
        </motion.div>
      </div>
    </RoleGuard>
  );
}
