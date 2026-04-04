"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { HiOutlineMagnifyingGlass, HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Modal } from "@/components/ui/Modal";
import { TableShell, Td, Th } from "@/components/ui/TableShell";
import { useData } from "@/context/data-context";
import { nextNumericId } from "@/lib/ids";
import type { Enrollment, EnrollmentStatus } from "@/lib/types";

export default function EnrollmentsPage() {
  const { enrollments, students, sections, courses, setEnrollments, log } =
    useData();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Enrollment | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return enrollments;
    return enrollments.filter((e) => {
      const st = students.find((x) => x.student_id === e.student_id);
      const sec = sections.find((x) => x.section_id === e.section_id);
      const cn = sec
        ? courses.find((c) => c.course_id === sec.course_id)?.course_code
        : "";
      return (
        e.enrollment_id.toLowerCase().includes(s) ||
        (st?.student_name.toLowerCase().includes(s) ?? false) ||
        (cn?.toLowerCase().includes(s) ?? false)
      );
    });
  }, [enrollments, students, sections, courses, q]);

  function labelSection(sectionId: string) {
    const sec = sections.find((x) => x.section_id === sectionId);
    if (!sec) return sectionId;
    const c = courses.find((x) => x.course_id === sec.course_id);
    return `${sec.section_name} · ${c?.course_code ?? ""}`;
  }

  function remove(id: string) {
    if (!confirm("Remove this enrollment?")) return;
    setEnrollments((prev) => prev.filter((e) => e.enrollment_id !== id));
    log(`Enrollment ${id} removed`, "delete");
  }

  return (
    <RoleGuard moduleKey="enrollments">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by student or course…"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm outline-none ring-sky-500/30 focus:ring-2"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950"
          >
            Enroll student
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-4"
        >
          <TableShell>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Student</Th>
                <Th>Section</Th>
                <Th>Date</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.enrollment_id} className="hover:bg-white/[0.02]">
                  <Td className="font-mono text-xs text-sky-300/90">{e.enrollment_id}</Td>
                  <Td>
                    {students.find((s) => s.student_id === e.student_id)?.student_name ??
                      e.student_id}
                  </Td>
                  <Td>{labelSection(e.section_id)}</Td>
                  <Td className="text-xs">{e.enroll_date}</Td>
                  <Td>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ring-1 ${
                        e.status === "Active"
                          ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
                          : e.status === "Dropped"
                            ? "bg-rose-500/15 text-rose-300 ring-rose-500/30"
                            : "bg-sky-500/15 text-sky-200 ring-sky-500/30"
                      }`}
                    >
                      {e.status}
                    </span>
                  </Td>
                  <Td className="text-right">
                    <button
                      type="button"
                      className="mr-2 inline-flex rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-sky-300"
                      onClick={() => {
                        setEditing(e);
                        setOpen(true);
                      }}
                    >
                      <HiOutlinePencilSquare className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-300"
                      onClick={() => remove(e.enrollment_id)}
                    >
                      <HiOutlineTrash className="h-5 w-5" />
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </motion.div>
      </div>

      <EnrollmentModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing}
        enrollments={enrollments}
        students={students}
        sections={sections}
        setEnrollments={setEnrollments}
        log={log}
      />
    </RoleGuard>
  );
}

function EnrollmentModal({
  open,
  onClose,
  initial,
  enrollments,
  students,
  sections,
  setEnrollments,
  log,
}: {
  open: boolean;
  onClose: () => void;
  initial: Enrollment | null;
  enrollments: Enrollment[];
  students: { student_id: string; student_name: string }[];
  sections: { section_id: string; section_name: string }[];
  setEnrollments: React.Dispatch<React.SetStateAction<Enrollment[]>>;
  log: (l: string, t?: "create" | "update" | "delete" | "info") => void;
}) {
  const [form, setForm] = useState<Enrollment>({
    enrollment_id: "",
    enroll_date: "",
    status: "Active",
    student_id: students[0]?.student_id ?? "",
    section_id: sections[0]?.section_id ?? "",
  });

  useEffect(() => {
    if (!open) return;
    setForm(
      initial ?? {
        enrollment_id: nextNumericId("E", enrollments.map((e) => e.enrollment_id)),
        enroll_date: new Date().toISOString().slice(0, 10),
        status: "Active",
        student_id: students[0]?.student_id ?? "",
        section_id: sections[0]?.section_id ?? "",
      },
    );
  }, [initial, open, enrollments, students, sections]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (initial) {
      setEnrollments((prev) =>
        prev.map((x) => (x.enrollment_id === form.enrollment_id ? form : x)),
      );
      log(`Enrollment ${form.enrollment_id} updated`, "update");
    } else {
      setEnrollments((prev) => [...prev, form]);
      log(`Enrollment ${form.enrollment_id} created`, "create");
    }
    onClose();
  }

  const statuses: EnrollmentStatus[] = ["Active", "Dropped", "Completed"];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Update enrollment" : "New enrollment"}
    >
      <form onSubmit={save} className="space-y-4">
        <label className="text-xs text-slate-500">
          Enrollment ID
          <input
            required
            disabled={!!initial}
            value={form.enrollment_id}
            onChange={(e) => setForm({ ...form, enrollment_id: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm disabled:opacity-60"
          />
        </label>
        <label className="text-xs text-slate-500">
          Student
          <select
            required
            value={form.student_id}
            onChange={(e) => setForm({ ...form, student_id: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          >
            {students.map((s) => (
              <option key={s.student_id} value={s.student_id}>
                {s.student_name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-500">
          Section
          <select
            required
            value={form.section_id}
            onChange={(e) => setForm({ ...form, section_id: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          >
            {sections.map((x) => (
              <option key={x.section_id} value={x.section_id}>
                {x.section_name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-500">
          Enroll date
          <input
            type="date"
            required
            value={form.enroll_date}
            onChange={(e) => setForm({ ...form, enroll_date: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-slate-500">
          Status
          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as EnrollmentStatus })
            }
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          >
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}
