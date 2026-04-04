"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { HiOutlineMagnifyingGlass, HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Modal } from "@/components/ui/Modal";
import { TableShell, Td, Th } from "@/components/ui/TableShell";
import { useData } from "@/context/data-context";
import { nextNumericId } from "@/lib/ids";
import type { Semester } from "@/lib/types";

export default function SemestersPage() {
  const { semesters, setSemesters, log } = useData();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Semester | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return semesters;
    return semesters.filter(
      (x) =>
        x.semester_id.toLowerCase().includes(s) ||
        x.semester_name.toLowerCase().includes(s),
    );
  }, [semesters, q]);

  function remove(id: string) {
    if (!confirm("Delete this semester?")) return;
    setSemesters((prev) => prev.filter((x) => x.semester_id !== id));
    log(`Semester ${id} deleted`, "delete");
  }

  return (
    <RoleGuard moduleKey="semesters">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search semester…"
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
            Add semester
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
                <Th>Start</Th>
                <Th>End</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((x) => (
                <tr key={x.semester_id} className="hover:bg-white/[0.02]">
                  <Td className="font-mono text-xs text-sky-300/90">{x.semester_id}</Td>
                  <Td className="font-medium text-slate-100">{x.semester_name}</Td>
                  <Td className="text-xs">{x.start_date}</Td>
                  <Td className="text-xs">{x.end_date}</Td>
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
                      onClick={() => remove(x.semester_id)}
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

      <SemesterModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing}
        semesters={semesters}
        setSemesters={setSemesters}
        log={log}
      />
    </RoleGuard>
  );
}

function SemesterModal({
  open,
  onClose,
  initial,
  semesters,
  setSemesters,
  log,
}: {
  open: boolean;
  onClose: () => void;
  initial: Semester | null;
  semesters: Semester[];
  setSemesters: React.Dispatch<React.SetStateAction<Semester[]>>;
  log: (l: string, t?: "create" | "update" | "delete" | "info") => void;
}) {
  const [form, setForm] = useState<Semester>({
    semester_id: "",
    semester_name: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm(
      initial ?? {
        semester_id: nextNumericId("SEM", semesters.map((s) => s.semester_id)),
        semester_name: "",
        start_date: "",
        end_date: "",
      },
    );
  }, [initial, open, semesters]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (initial) {
      setSemesters((prev) =>
        prev.map((x) => (x.semester_id === form.semester_id ? form : x)),
      );
      log(`Semester ${form.semester_id} updated`, "update");
    } else {
      setSemesters((prev) => [...prev, form]);
      log(`Semester ${form.semester_id} created`, "create");
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit semester" : "New semester"}>
      <form onSubmit={save} className="space-y-4">
        <label className="text-xs text-slate-500">
          Semester ID
          <input
            required
            disabled={!!initial}
            value={form.semester_id}
            onChange={(e) => setForm({ ...form, semester_id: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm disabled:opacity-60"
          />
        </label>
        <label className="text-xs text-slate-500">
          Name
          <input
            required
            value={form.semester_name}
            onChange={(e) => setForm({ ...form, semester_name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-slate-500">
          Start date
          <input
            type="date"
            required
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-slate-500">
          End date
          <input
            type="date"
            required
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
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
