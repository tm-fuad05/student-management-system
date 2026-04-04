"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { HiOutlineMagnifyingGlass, HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Modal } from "@/components/ui/Modal";
import { TableShell, Td, Th } from "@/components/ui/TableShell";
import { useData } from "@/context/data-context";
import { nextNumericId } from "@/lib/ids";
import type { Teacher } from "@/lib/types";

export default function TeachersPage() {
  const { teachers, departments, setTeachers, log } = useData();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return teachers;
    return teachers.filter((t) => {
      const dn = departments.find((d) => d.dept_id === t.dept_id)?.dept_name ?? "";
      return (
        t.teacher_name.toLowerCase().includes(s) ||
        dn.toLowerCase().includes(s) ||
        t.teacher_id.toLowerCase().includes(s)
      );
    });
  }, [teachers, departments, q]);

  function deptName(id: string) {
    return departments.find((d) => d.dept_id === id)?.dept_name ?? id;
  }

  function remove(id: string) {
    if (!confirm("Delete this teacher?")) return;
    setTeachers((prev) => prev.filter((t) => t.teacher_id !== id));
    log(`Teacher ${id} deleted`, "delete");
  }

  return (
    <RoleGuard moduleKey="teachers">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or department…"
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
            Add teacher
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
                <Th>Name</Th>
                <Th>Designation</Th>
                <Th>Department</Th>
                <Th>Email</Th>
                <Th>Hire date</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.teacher_id} className="hover:bg-white/[0.02]">
                  <Td className="font-mono text-xs text-sky-300/90">{t.teacher_id}</Td>
                  <Td className="font-medium text-slate-100">{t.teacher_name}</Td>
                  <Td>{t.designation}</Td>
                  <Td>{deptName(t.dept_id)}</Td>
                  <Td className="max-w-[200px] truncate">{t.email}</Td>
                  <Td className="text-xs">{t.hire_date}</Td>
                  <Td className="text-right">
                    <button
                      type="button"
                      className="mr-2 inline-flex rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-sky-300"
                      onClick={() => {
                        setEditing(t);
                        setOpen(true);
                      }}
                    >
                      <HiOutlinePencilSquare className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-300"
                      onClick={() => remove(t.teacher_id)}
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

      <TeacherModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing}
        teachers={teachers}
        departments={departments}
        setTeachers={setTeachers}
        log={log}
      />
    </RoleGuard>
  );
}

function TeacherModal({
  open,
  onClose,
  initial,
  teachers,
  departments,
  setTeachers,
  log,
}: {
  open: boolean;
  onClose: () => void;
  initial: Teacher | null;
  teachers: Teacher[];
  departments: { dept_id: string; dept_name: string }[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  log: (l: string, t?: "create" | "update" | "delete" | "info") => void;
}) {
  const [form, setForm] = useState<Teacher>({
    teacher_id: "",
    teacher_name: "",
    designation: "Lecturer",
    phone: "",
    email: "",
    hire_date: "",
    dept_id: departments[0]?.dept_id ?? "",
  });

  useEffect(() => {
    if (!open) return;
    setForm(
      initial ?? {
        teacher_id: nextNumericId("T", teachers.map((t) => t.teacher_id)),
        teacher_name: "",
        designation: "Lecturer",
        phone: "",
        email: "",
        hire_date: new Date().toISOString().slice(0, 10),
        dept_id: departments[0]?.dept_id ?? "",
      },
    );
  }, [initial, open, teachers, departments]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (initial) {
      setTeachers((prev) =>
        prev.map((t) => (t.teacher_id === form.teacher_id ? form : t)),
      );
      log(`Teacher ${form.teacher_id} updated`, "update");
    } else {
      setTeachers((prev) => [...prev, form]);
      log(`Teacher ${form.teacher_id} added`, "create");
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit teacher" : "New teacher"} wide>
      <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs text-slate-500">
          Teacher ID
          <input
            required
            disabled={!!initial}
            value={form.teacher_id}
            onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm disabled:opacity-60"
          />
        </label>
        <label className="text-xs text-slate-500">
          Name
          <input
            required
            value={form.teacher_name}
            onChange={(e) => setForm({ ...form, teacher_name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-slate-500">
          Designation
          <input
            required
            value={form.designation}
            onChange={(e) => setForm({ ...form, designation: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-slate-500">
          Phone
          <input
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-slate-500 sm:col-span-2">
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-slate-500">
          Hire date
          <input
            type="date"
            required
            value={form.hire_date}
            onChange={(e) => setForm({ ...form, hire_date: e.target.value })}
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
