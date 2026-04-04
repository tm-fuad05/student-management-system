"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { HiOutlineMagnifyingGlass, HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Modal } from "@/components/ui/Modal";
import { TableShell, Td, Th } from "@/components/ui/TableShell";
import { useData } from "@/context/data-context";
import { gradeFromMarks } from "@/lib/grade";
import { nextNumericId } from "@/lib/ids";
import type { Enrollment, Result } from "@/lib/types";

export default function ResultsPage() {
  const { results, enrollments, students, sections, courses, setResults, log } =
    useData();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Result | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return results;
    return results.filter((r) => {
      const en = enrollments.find((e) => e.enrollment_id === r.enrollment_id);
      const st = en
        ? students.find((x) => x.student_id === en.student_id)
        : undefined;
      return (
        r.result_id.toLowerCase().includes(s) ||
        (st?.student_name.toLowerCase().includes(s) ?? false)
      );
    });
  }, [results, enrollments, students, q]);

  function enrollLabel(eid: string) {
    const en = enrollments.find((e) => e.enrollment_id === eid);
    if (!en) return eid;
    const st = students.find((s) => s.student_id === en.student_id);
    const sec = sections.find((x) => x.section_id === en.section_id);
    const c = sec ? courses.find((co) => co.course_id === sec.course_id) : undefined;
    return `${st?.student_name ?? en.student_id} · ${c?.course_code ?? ""}`;
  }

  function remove(id: string) {
    if (!confirm("Delete this result?")) return;
    const r = results.find((x) => x.result_id === id);
    const sid = r
      ? enrollments.find((e) => e.enrollment_id === r.enrollment_id)?.student_id
      : undefined;
    setResults((prev) => prev.filter((x) => x.result_id !== id));
    log(`Result ${id} deleted`, "delete", sid ? { student_id: sid } : undefined);
  }

  return (
    <RoleGuard moduleKey="results">
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          Each enrollment maps to at most one result (1:1). Grades auto-update from marks
          (demo rule).
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by student…"
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
            Enter result
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
                <Th>Enrollment</Th>
                <Th>Marks</Th>
                <Th>Grade</Th>
                <Th>Published</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.result_id} className="hover:bg-white/[0.02]">
                  <Td className="font-mono text-xs text-sky-300/90">{r.result_id}</Td>
                  <Td className="max-w-[280px] truncate">{enrollLabel(r.enrollment_id)}</Td>
                  <Td className="tabular-nums">{r.marks}</Td>
                  <Td className="font-medium text-violet-300">{r.grade}</Td>
                  <Td className="text-xs">{r.result_publish_date}</Td>
                  <Td className="text-right">
                    <button
                      type="button"
                      className="mr-2 inline-flex rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-sky-300"
                      onClick={() => {
                        setEditing(r);
                        setOpen(true);
                      }}
                    >
                      <HiOutlinePencilSquare className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-300"
                      onClick={() => remove(r.result_id)}
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

      <ResultModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing}
        results={results}
        enrollments={enrollments}
        setResults={setResults}
        log={log}
      />
    </RoleGuard>
  );
}

function ResultModal({
  open,
  onClose,
  initial,
  results,
  enrollments,
  setResults,
  log,
}: {
  open: boolean;
  onClose: () => void;
  initial: Result | null;
  results: Result[];
  enrollments: Enrollment[];
  setResults: React.Dispatch<React.SetStateAction<Result[]>>;
  log: (
    l: string,
    t?: "create" | "update" | "delete" | "info",
    meta?: { student_id?: string },
  ) => void;
}) {
  const [form, setForm] = useState<Result>({
    result_id: "",
    marks: 0,
    grade: "A",
    result_publish_date: "",
    enrollment_id: enrollments[0]?.enrollment_id ?? "",
  });

  useEffect(() => {
    if (!open) return;
    setForm(
      initial ?? {
        result_id: nextNumericId("R", results.map((r) => r.result_id)),
        marks: 85,
        grade: gradeFromMarks(85),
        result_publish_date: new Date().toISOString().slice(0, 10),
        enrollment_id: enrollments[0]?.enrollment_id ?? "",
      },
    );
  }, [initial, open, results, enrollments]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    const g = gradeFromMarks(form.marks);
    const row = { ...form, grade: g };
    const duplicateEnrollment = results.some(
      (r) =>
        r.enrollment_id === row.enrollment_id && r.result_id !== row.result_id,
    );
    if (duplicateEnrollment) {
      alert("A result for this enrollment already exists (1:1).");
      return;
    }
    const sid = enrollments.find((e) => e.enrollment_id === row.enrollment_id)
      ?.student_id;
    if (initial) {
      setResults((prev) =>
        prev.map((r) => (r.result_id === row.result_id ? row : r)),
      );
      log(`Result ${row.result_id} updated`, "update", sid ? { student_id: sid } : undefined);
    } else {
      setResults((prev) => [...prev, row]);
      log(`Result ${row.result_id} published`, "create", sid ? { student_id: sid } : undefined);
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit result" : "Enter result"}>
      <form onSubmit={save} className="space-y-4">
        <label className="text-xs text-slate-500">
          Result ID
          <input
            required
            disabled={!!initial}
            value={form.result_id}
            onChange={(e) => setForm({ ...form, result_id: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm disabled:opacity-60"
          />
        </label>
        <label className="text-xs text-slate-500">
          Enrollment
          <select
            required
            disabled={!!initial}
            value={form.enrollment_id}
            onChange={(e) =>
              setForm({ ...form, enrollment_id: e.target.value })
            }
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm disabled:opacity-60"
          >
            {enrollments.map((e) => (
              <option key={e.enrollment_id} value={e.enrollment_id}>
                {e.enrollment_id}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-500">
          Marks
          <input
            type="number"
            min={0}
            max={100}
            required
            value={form.marks}
            onChange={(e) => {
              const m = Number.parseInt(e.target.value, 10);
              setForm({
                ...form,
                marks: m,
                grade: gradeFromMarks(m),
              });
            }}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </label>
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
          <span className="text-xs text-slate-500">Computed grade</span>
          <p className="text-lg font-semibold text-violet-300">{form.grade}</p>
        </div>
        <label className="text-xs text-slate-500">
          Publish date
          <input
            type="date"
            required
            value={form.result_publish_date}
            onChange={(e) =>
              setForm({ ...form, result_publish_date: e.target.value })
            }
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
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
