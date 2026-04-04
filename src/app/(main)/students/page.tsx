"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  HiOutlineIdentification,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { StudentProfileModal } from "@/components/students/StudentProfileModal";
import { Modal } from "@/components/ui/Modal";
import { TableShell, Td, Th } from "@/components/ui/TableShell";
import { useData } from "@/context/data-context";
import { nextNumericId } from "@/lib/ids";
import type { Student } from "@/lib/types";

export default function StudentsPage() {
  const { students, departments, setStudents, log } = useData();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [profile, setProfile] = useState<Student | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return students;
    return students.filter(
      (x) =>
        x.student_id.toLowerCase().includes(s) ||
        x.student_name.toLowerCase().includes(s) ||
        x.email.toLowerCase().includes(s),
    );
  }, [students, q]);

  function deptName(id: string) {
    return departments.find((d) => d.dept_id === id)?.dept_name ?? id;
  }

  function remove(id: string) {
    if (!confirm("Delete this student?")) return;
    setStudents((prev) => prev.filter((x) => x.student_id !== id));
    log(`Student ${id} deleted`, "delete", { student_id: id });
  }

  return (
    <RoleGuard moduleKey="students">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by ID, name, or email…"
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
            Register student
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
                <Th>Gender</Th>
                <Th>Email</Th>
                <Th>Department</Th>
                <Th>Admission</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((x) => (
                <tr key={x.student_id} className="hover:bg-white/[0.02]">
                  <Td className="font-mono text-xs text-sky-300/90">{x.student_id}</Td>
                  <Td className="font-medium text-slate-100">{x.student_name}</Td>
                  <Td>{x.gender}</Td>
                  <Td className="max-w-[200px] truncate">{x.email}</Td>
                  <Td>{deptName(x.dept_id)}</Td>
                  <Td className="whitespace-nowrap text-xs">{x.admission_date}</Td>
                  <Td className="text-right">
                    <button
                      type="button"
                      className="mr-2 inline-flex rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-violet-300"
                      title="Profile & history"
                      onClick={() => setProfile(x)}
                    >
                      <HiOutlineIdentification className="h-5 w-5" />
                    </button>
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
                      onClick={() => remove(x.student_id)}
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

      <StudentModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing}
        students={students}
        departments={departments}
        setStudents={setStudents}
        log={log}
      />

      <StudentProfileModal
        open={!!profile}
        student={profile}
        onClose={() => setProfile(null)}
      />
    </RoleGuard>
  );
}

function StudentModal({
  open,
  onClose,
  initial,
  students,
  departments,
  setStudents,
  log,
}: {
  open: boolean;
  onClose: () => void;
  initial: Student | null;
  students: Student[];
  departments: { dept_id: string; dept_name: string }[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  log: (
    l: string,
    t?: "create" | "update" | "delete" | "info",
    meta?: { student_id?: string },
  ) => void;
}) {
  const [form, setForm] = useState<Student>({
    student_id: "",
    student_name: "",
    gender: "Female",
    date_of_birth: "",
    phone: "",
    email: "",
    address: "",
    admission_date: "",
    dept_id: departments[0]?.dept_id ?? "",
  });

  useEffect(() => {
    if (!open) return;
    setForm(
      initial ?? {
        student_id: nextNumericId("S", students.map((s) => s.student_id)),
        student_name: "",
        gender: "Female",
        date_of_birth: "2004-01-01",
        phone: "",
        email: "",
        address: "",
        admission_date: new Date().toISOString().slice(0, 10),
        dept_id: departments[0]?.dept_id ?? "",
      },
    );
  }, [initial, open, students, departments]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (initial) {
      setStudents((prev) =>
        prev.map((s) => (s.student_id === form.student_id ? form : s)),
      );
      log(`Student ${form.student_id} updated`, "update", {
        student_id: form.student_id,
      });
    } else {
      setStudents((prev) => [...prev, form]);
      log(`Student ${form.student_id} registered`, "create", {
        student_id: form.student_id,
      });
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit student" : "Register student"} wide>
      <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs text-slate-500 sm:col-span-2">
          Student ID
          <input
            required
            disabled={!!initial}
            value={form.student_id}
            onChange={(e) => setForm({ ...form, student_id: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm disabled:opacity-60"
          />
        </label>
        <label className="text-xs text-slate-500">
          Name
          <input
            required
            value={form.student_name}
            onChange={(e) => setForm({ ...form, student_name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-slate-500">
          Gender
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          >
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
          </select>
        </label>
        <label className="text-xs text-slate-500">
          Date of birth
          <input
            type="date"
            required
            value={form.date_of_birth}
            onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
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
        <label className="text-xs text-slate-500 sm:col-span-2">
          Address
          <input
            required
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-slate-500">
          Admission date
          <input
            type="date"
            required
            value={form.admission_date}
            onChange={(e) => setForm({ ...form, admission_date: e.target.value })}
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
