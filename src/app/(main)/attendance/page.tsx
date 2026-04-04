"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { HiOutlineMagnifyingGlass, HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Modal } from "@/components/ui/Modal";
import { TableShell, Td, Th } from "@/components/ui/TableShell";
import { useData } from "@/context/data-context";
import { nextNumericId } from "@/lib/ids";
import type { Attendance, AttendanceStatus, Enrollment } from "@/lib/types";

export default function AttendancePage() {
  const { attendance, enrollments, students, sections, courses, setAttendance, log } =
    useData();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Attendance | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return attendance;
    return attendance.filter((a) => {
      const en = enrollments.find((e) => e.enrollment_id === a.enrollment_id);
      const st = en
        ? students.find((x) => x.student_id === en.student_id)
        : undefined;
      return (
        a.attendance_date.includes(s) ||
        (st?.student_name.toLowerCase().includes(s) ?? false) ||
        a.attendance_id.toLowerCase().includes(s)
      );
    });
  }, [attendance, enrollments, students, q]);

  function enrollLabel(eid: string) {
    const en = enrollments.find((e) => e.enrollment_id === eid);
    if (!en) return eid;
    const st = students.find((s) => s.student_id === en.student_id);
    const sec = sections.find((x) => x.section_id === en.section_id);
    const c = sec ? courses.find((co) => co.course_id === sec.course_id) : undefined;
    return `${st?.student_name ?? en.student_id} · ${c?.course_code ?? ""}`;
  }

  function remove(id: string) {
    if (!confirm("Delete this attendance row?")) return;
    const row = attendance.find((a) => a.attendance_id === id);
    const sid = row
      ? enrollments.find((e) => e.enrollment_id === row.enrollment_id)?.student_id
      : undefined;
    setAttendance((prev) => prev.filter((a) => a.attendance_id !== id));
    log(`Attendance ${id} deleted`, "delete", sid ? { student_id: sid } : undefined);
  }

  return (
    <RoleGuard moduleKey="attendance">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by student or date…"
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
            Record attendance
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
                <Th>Date</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.attendance_id} className="hover:bg-white/[0.02]">
                  <Td className="font-mono text-xs text-sky-300/90">{a.attendance_id}</Td>
                  <Td className="max-w-[280px] truncate">{enrollLabel(a.enrollment_id)}</Td>
                  <Td className="text-xs">{a.attendance_date}</Td>
                  <Td>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ring-1 ${
                        a.attendance_status === "Present"
                          ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
                          : a.attendance_status === "Late"
                            ? "bg-amber-500/15 text-amber-200 ring-amber-500/30"
                            : "bg-rose-500/15 text-rose-300 ring-rose-500/30"
                      }`}
                    >
                      {a.attendance_status}
                    </span>
                  </Td>
                  <Td className="text-right">
                    <button
                      type="button"
                      className="mr-2 inline-flex rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-sky-300"
                      onClick={() => {
                        setEditing(a);
                        setOpen(true);
                      }}
                    >
                      <HiOutlinePencilSquare className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-300"
                      onClick={() => remove(a.attendance_id)}
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

      <AttendanceModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing}
        attendance={attendance}
        enrollments={enrollments}
        setAttendance={setAttendance}
        log={log}
      />
    </RoleGuard>
  );
}

function AttendanceModal({
  open,
  onClose,
  initial,
  attendance,
  enrollments,
  setAttendance,
  log,
}: {
  open: boolean;
  onClose: () => void;
  initial: Attendance | null;
  attendance: Attendance[];
  enrollments: Enrollment[];
  setAttendance: React.Dispatch<React.SetStateAction<Attendance[]>>;
  log: (
    l: string,
    t?: "create" | "update" | "delete" | "info",
    meta?: { student_id?: string },
  ) => void;
}) {
  const [form, setForm] = useState<Attendance>({
    attendance_id: "",
    attendance_date: "",
    attendance_status: "Present",
    enrollment_id: enrollments[0]?.enrollment_id ?? "",
  });

  useEffect(() => {
    if (!open) return;
    setForm(
      initial ?? {
        attendance_id: nextNumericId("A", attendance.map((a) => a.attendance_id)),
        attendance_date: new Date().toISOString().slice(0, 10),
        attendance_status: "Present",
        enrollment_id: enrollments[0]?.enrollment_id ?? "",
      },
    );
  }, [initial, open, attendance, enrollments]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    const sid = enrollments.find((e) => e.enrollment_id === form.enrollment_id)
      ?.student_id;
    if (initial) {
      setAttendance((prev) =>
        prev.map((a) => (a.attendance_id === form.attendance_id ? form : a)),
      );
      log(`Attendance ${form.attendance_id} updated`, "update", sid ? { student_id: sid } : undefined);
    } else {
      setAttendance((prev) => [...prev, form]);
      log(`Attendance ${form.attendance_id} recorded`, "create", sid ? { student_id: sid } : undefined);
    }
    onClose();
  }

  const statuses: AttendanceStatus[] = ["Present", "Absent", "Late"];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit attendance" : "Record attendance"}
    >
      <form onSubmit={save} className="space-y-4">
        <label className="text-xs text-slate-500">
          Attendance ID
          <input
            required
            disabled={!!initial}
            value={form.attendance_id}
            onChange={(e) => setForm({ ...form, attendance_id: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm disabled:opacity-60"
          />
        </label>
        <label className="text-xs text-slate-500">
          Enrollment
          <select
            required
            value={form.enrollment_id}
            onChange={(e) =>
              setForm({ ...form, enrollment_id: e.target.value })
            }
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          >
            {enrollments.map((e) => (
              <option key={e.enrollment_id} value={e.enrollment_id}>
                {e.enrollment_id}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-500">
          Date
          <input
            type="date"
            required
            value={form.attendance_date}
            onChange={(e) =>
              setForm({ ...form, attendance_date: e.target.value })
            }
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-slate-500">
          Status
          <select
            value={form.attendance_status}
            onChange={(e) =>
              setForm({
                ...form,
                attendance_status: e.target.value as AttendanceStatus,
              })
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
