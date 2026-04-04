"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { HiOutlineMagnifyingGlass, HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Modal } from "@/components/ui/Modal";
import { TableShell, Td, Th } from "@/components/ui/TableShell";
import { useData } from "@/context/data-context";
import { nextNumericId } from "@/lib/ids";
import type { Course } from "@/lib/types";

export default function CoursesPage() {
  const { courses, departments, setCourses, log } = useData();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return courses;
    return courses.filter(
      (c) =>
        c.course_code.toLowerCase().includes(s) ||
        c.course_title.toLowerCase().includes(s) ||
        c.course_id.toLowerCase().includes(s),
    );
  }, [courses, q]);

  function deptName(id: string) {
    return departments.find((d) => d.dept_id === id)?.dept_name ?? id;
  }

  function remove(id: string) {
    if (!confirm("Delete this course?")) return;
    setCourses((prev) => prev.filter((c) => c.course_id !== id));
    log(`Course ${id} deleted`, "delete");
  }

  return (
    <RoleGuard moduleKey="courses">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by code or title…"
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
            Add course
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
                <Th>Code</Th>
                <Th>Title</Th>
                <Th>Credit</Th>
                <Th>Department</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.course_id} className="hover:bg-white/[0.02]">
                  <Td className="font-mono text-xs text-sky-300/90">{c.course_id}</Td>
                  <Td className="font-medium text-slate-100">{c.course_code}</Td>
                  <Td>{c.course_title}</Td>
                  <Td>{c.credit}</Td>
                  <Td>{deptName(c.dept_id)}</Td>
                  <Td className="text-right">
                    <button
                      type="button"
                      className="mr-2 inline-flex rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-sky-300"
                      onClick={() => {
                        setEditing(c);
                        setOpen(true);
                      }}
                    >
                      <HiOutlinePencilSquare className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-300"
                      onClick={() => remove(c.course_id)}
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

      <CourseModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing}
        courses={courses}
        departments={departments}
        setCourses={setCourses}
        log={log}
      />
    </RoleGuard>
  );
}

function CourseModal({
  open,
  onClose,
  initial,
  courses,
  departments,
  setCourses,
  log,
}: {
  open: boolean;
  onClose: () => void;
  initial: Course | null;
  courses: Course[];
  departments: { dept_id: string; dept_name: string }[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  log: (l: string, t?: "create" | "update" | "delete" | "info") => void;
}) {
  const [form, setForm] = useState<Course>({
    course_id: "",
    course_code: "",
    course_title: "",
    credit: 3,
    dept_id: departments[0]?.dept_id ?? "",
  });

  useEffect(() => {
    if (!open) return;
    setForm(
      initial ?? {
        course_id: nextNumericId("C", courses.map((c) => c.course_id)),
        course_code: "",
        course_title: "",
        credit: 3,
        dept_id: departments[0]?.dept_id ?? "",
      },
    );
  }, [initial, open, courses, departments]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (initial) {
      setCourses((prev) =>
        prev.map((c) => (c.course_id === form.course_id ? form : c)),
      );
      log(`Course ${form.course_id} updated`, "update");
    } else {
      setCourses((prev) => [...prev, form]);
      log(`Course ${form.course_id} created`, "create");
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit course" : "New course"}>
      <form onSubmit={save} className="space-y-4">
        <label className="text-xs text-slate-500">
          Course ID
          <input
            required
            disabled={!!initial}
            value={form.course_id}
            onChange={(e) => setForm({ ...form, course_id: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm disabled:opacity-60"
          />
        </label>
        <label className="text-xs text-slate-500">
          Course code
          <input
            required
            value={form.course_code}
            onChange={(e) => setForm({ ...form, course_code: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-slate-500">
          Title
          <input
            required
            value={form.course_title}
            onChange={(e) => setForm({ ...form, course_title: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-slate-500">
          Credit
          <input
            type="number"
            min={1}
            max={10}
            required
            value={form.credit}
            onChange={(e) =>
              setForm({ ...form, credit: Number.parseInt(e.target.value, 10) })
            }
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-slate-500">
          Department
          <select
            required
            value={form.dept_id}
            onChange={(e) => setForm({ ...form, dept_id: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          >
            {departments.map((d) => (
              <option key={d.dept_id} value={d.dept_id}>
                {d.dept_name}
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
