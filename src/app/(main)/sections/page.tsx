"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { HiOutlineMagnifyingGlass, HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Modal } from "@/components/ui/Modal";
import { TableShell, Td, Th } from "@/components/ui/TableShell";
import { useData } from "@/context/data-context";
import { nextNumericId } from "@/lib/ids";
import type { Section } from "@/lib/types";

export default function SectionsPage() {
  const { sections, courses, teachers, semesters, setSections, log } = useData();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Section | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return sections;
    return sections.filter((x) => {
      const cn =
        courses.find((c) => c.course_id === x.course_id)?.course_title ?? "";
      const tn =
        teachers.find((t) => t.teacher_id === x.teacher_id)?.teacher_name ?? "";
      return (
        x.section_name.toLowerCase().includes(s) ||
        cn.toLowerCase().includes(s) ||
        tn.toLowerCase().includes(s) ||
        x.section_id.toLowerCase().includes(s)
      );
    });
  }, [sections, courses, teachers, q]);

  function remove(id: string) {
    if (!confirm("Delete this section?")) return;
    setSections((prev) => prev.filter((x) => x.section_id !== id));
    log(`Section ${id} deleted`, "delete");
  }

  return (
    <RoleGuard moduleKey="sections">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by course or teacher…"
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
            Create section
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
                <Th>Section</Th>
                <Th>Course</Th>
                <Th>Teacher</Th>
                <Th>Semester</Th>
                <Th>Room</Th>
                <Th>Schedule</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((x) => (
                <tr key={x.section_id} className="hover:bg-white/[0.02]">
                  <Td className="font-mono text-xs text-sky-300/90">{x.section_id}</Td>
                  <Td className="font-medium text-slate-100">{x.section_name}</Td>
                  <Td>
                    {courses.find((c) => c.course_id === x.course_id)?.course_code ??
                      x.course_id}
                  </Td>
                  <Td>
                    {teachers.find((t) => t.teacher_id === x.teacher_id)?.teacher_name ??
                      x.teacher_id}
                  </Td>
                  <Td>
                    {semesters.find((s) => s.semester_id === x.semester_id)
                      ?.semester_name ?? x.semester_id}
                  </Td>
                  <Td>{x.room_no}</Td>
                  <Td className="max-w-[140px] text-xs">{x.schedule_time}</Td>
                  <Td className="text-right">
                    <button
                      type="button"
                      className="mr-2 inline-flex rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-sky-300"
                      onClick={() => {
                        setEditing(x);
                        setOpen(true);
                      }}
                    >
                      <HiOutlinePencilSquare className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-300"
                      onClick={() => remove(x.section_id)}
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

      <SectionModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing}
        sections={sections}
        courses={courses}
        teachers={teachers}
        semesters={semesters}
        setSections={setSections}
        log={log}
      />
    </RoleGuard>
  );
}

function SectionModal({
  open,
  onClose,
  initial,
  sections,
  courses,
  teachers,
  semesters,
  setSections,
  log,
}: {
  open: boolean;
  onClose: () => void;
  initial: Section | null;
  sections: Section[];
  courses: { course_id: string; course_code: string; course_title: string }[];
  teachers: { teacher_id: string; teacher_name: string }[];
  semesters: { semester_id: string; semester_name: string }[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  log: (l: string, t?: "create" | "update" | "delete" | "info") => void;
}) {
  const [form, setForm] = useState<Section>({
    section_id: "",
    section_name: "",
    room_no: "",
    schedule_time: "",
    course_id: courses[0]?.course_id ?? "",
    teacher_id: teachers[0]?.teacher_id ?? "",
    semester_id: semesters[0]?.semester_id ?? "",
  });

  useEffect(() => {
    if (!open) return;
    setForm(
      initial ?? {
        section_id: nextNumericId("SEC", sections.map((s) => s.section_id)),
        section_name: "",
        room_no: "",
        schedule_time: "Mon/Wed 10:00–11:30",
        course_id: courses[0]?.course_id ?? "",
        teacher_id: teachers[0]?.teacher_id ?? "",
        semester_id: semesters[0]?.semester_id ?? "",
      },
    );
  }, [initial, open, sections, courses, teachers, semesters]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (initial) {
      setSections((prev) =>
        prev.map((x) => (x.section_id === form.section_id ? form : x)),
      );
      log(`Section ${form.section_id} updated`, "update");
    } else {
      setSections((prev) => [...prev, form]);
      log(`Section ${form.section_id} created`, "create");
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit section" : "New section"} wide>
      <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs text-slate-500">
          Section ID
          <input
            required
            disabled={!!initial}
            value={form.section_id}
            onChange={(e) => setForm({ ...form, section_id: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm disabled:opacity-60"
          />
        </label>
        <label className="text-xs text-slate-500">
          Section name
          <input
            required
            value={form.section_name}
            onChange={(e) => setForm({ ...form, section_name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-slate-500">
          Course
          <select
            required
            value={form.course_id}
            onChange={(e) => setForm({ ...form, course_id: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          >
            {courses.map((c) => (
              <option key={c.course_id} value={c.course_id}>
                {c.course_code} — {c.course_title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-500">
          Teacher
          <select
            required
            value={form.teacher_id}
            onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          >
            {teachers.map((t) => (
              <option key={t.teacher_id} value={t.teacher_id}>
                {t.teacher_name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-500">
          Semester
          <select
            required
            value={form.semester_id}
            onChange={(e) => setForm({ ...form, semester_id: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          >
            {semesters.map((s) => (
              <option key={s.semester_id} value={s.semester_id}>
                {s.semester_name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-500">
          Room
          <input
            required
            value={form.room_no}
            onChange={(e) => setForm({ ...form, room_no: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-slate-500 sm:col-span-2">
          Schedule time
          <input
            required
            value={form.schedule_time}
            onChange={(e) => setForm({ ...form, schedule_time: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </label>
        <div className="flex justify-end gap-2 sm:col-span-2">
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
