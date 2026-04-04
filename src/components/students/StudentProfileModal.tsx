"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { TableShell, Td, Th } from "@/components/ui/TableShell";
import { useData } from "@/context/data-context";
import {
  attendanceRowsForStudent,
  buildStudentTimeline,
  summarizePaymentsForStudent,
} from "@/lib/student-profile";
import type { Student } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  student: Student | null;
};

export function StudentProfileModal({ open, onClose, student }: Props) {
  const data = useData();

  const deptName = useMemo(() => {
    if (!student) return "";
    return (
      data.departments.find((d) => d.dept_id === student.dept_id)?.dept_name ??
      student.dept_id
    );
  }, [student, data.departments]);

  const paymentSummary = useMemo(() => {
    if (!student) return null;
    return summarizePaymentsForStudent(student.student_id, data.payments);
  }, [student, data.payments]);

  const attendanceRows = useMemo(() => {
    if (!student) return [];
    return attendanceRowsForStudent(
      student.student_id,
      data.enrollments,
      data.attendance,
      data.sections,
      data.courses,
    );
  }, [student, data]);

  const timeline = useMemo(() => {
    if (!student) return [];
    return buildStudentTimeline(
      student,
      data.enrollments,
      data.payments,
      data.attendance,
      data.results,
      data.sections,
      data.courses,
      data.semesters,
      data.activities,
    );
  }, [student, data]);

  const active = open && !!student;

  return (
    <Modal
      open={active}
      onClose={onClose}
      title={student ? `Profile · ${student.student_name}` : "Profile"}
      wide
    >
      {!student ? (
        <p className="text-sm text-slate-500">No student selected.</p>
      ) : (
      <div className="space-y-8">
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Record
          </h4>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">Student ID</dt>
              <dd className="font-mono text-sky-300/90">{student.student_id}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Department</dt>
              <dd className="text-slate-200">{deptName}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Email</dt>
              <dd className="break-all text-slate-300">{student.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Phone</dt>
              <dd className="text-slate-300">{student.phone}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-slate-500">Address</dt>
              <dd className="text-slate-300">{student.address}</dd>
            </div>
          </dl>
        </section>

        {paymentSummary != null && (
          <section>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Payment summary
            </h4>
            <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                label="Paid (total)"
                value={`$${paymentSummary.totalPaid.toLocaleString()}`}
                tone="emerald"
              />
              <SummaryCard
                label="Pending"
                value={`$${paymentSummary.totalPending.toLocaleString()}`}
                sub={`${paymentSummary.pendingCount} invoice(s)`}
                tone="amber"
              />
              <SummaryCard
                label="Partial"
                value={`$${paymentSummary.totalPartial.toLocaleString()}`}
                sub={`${paymentSummary.partialCount} record(s)`}
                tone="sky"
              />
              <SummaryCard
                label="Paid receipts"
                value={String(paymentSummary.paidCount)}
                sub="Successful postings"
                tone="violet"
              />
            </div>
            {Object.keys(paymentSummary.byType).length > 0 && (
              <p className="mb-2 text-xs text-slate-500">By fee type</p>
            )}
            <div className="flex flex-wrap gap-2">
              {Object.entries(paymentSummary.byType).map(([k, v]) => (
                <span
                  key={k}
                  className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300 ring-1 ring-white/10"
                >
                  {k}: ${v.toLocaleString()}
                </span>
              ))}
            </div>
          </section>
        )}

        <section>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Attendance history
          </h4>
          {attendanceRows.length === 0 ? (
            <p className="text-sm text-slate-500">No attendance rows yet.</p>
          ) : (
            <div className="max-h-64 overflow-y-auto scrollbar-thin rounded-xl border border-white/10">
              <TableShell>
                <thead>
                  <tr>
                    <Th>Date</Th>
                    <Th>Course / section</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRows.map((r) => (
                    <tr key={r.attendance_id} className="hover:bg-white/[0.02]">
                      <Td className="whitespace-nowrap text-xs">{r.date}</Td>
                      <Td className="max-w-[200px] text-xs">{r.courseLabel}</Td>
                      <Td>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ring-1 ${
                            r.status === "Present"
                              ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
                              : r.status === "Late"
                                ? "bg-amber-500/15 text-amber-200 ring-amber-500/30"
                                : "bg-rose-500/15 text-rose-300 ring-rose-500/30"
                          }`}
                        >
                          {r.status}
                        </span>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </TableShell>
            </div>
          )}
        </section>

        <section>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Profile & activity timeline
          </h4>
          <p className="mb-3 text-xs text-slate-600">
            Admissions, enrollments, payments, attendance, results, and tagged
            activity log entries for this student.
          </p>
          <ul className="space-y-3">
            {timeline.map((t, i) => (
              <motion.li
                key={`${t.sortKey}-${i}`}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className="flex gap-3 border-l-2 border-sky-500/30 pl-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-200">{t.label}</p>
                  <p className="text-xs text-slate-500">{t.detail}</p>
                </div>
                <span className="shrink-0 text-[10px] uppercase text-slate-600">
                  {t.kind}
                </span>
              </motion.li>
            ))}
          </ul>
        </section>
      </div>
      )}
    </Modal>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone: "emerald" | "amber" | "sky" | "violet";
}) {
  const ring =
    tone === "emerald"
      ? "ring-emerald-500/25"
      : tone === "amber"
        ? "ring-amber-500/25"
        : tone === "sky"
          ? "ring-sky-500/25"
          : "ring-violet-500/25";
  return (
    <div className={`rounded-xl border border-white/10 bg-white/[0.04] p-3 ring-1 ${ring}`}>
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-slate-100">{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-slate-500">{sub}</p>}
    </div>
  );
}
