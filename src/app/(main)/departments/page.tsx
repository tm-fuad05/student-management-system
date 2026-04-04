"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { HiOutlineMagnifyingGlass, HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Modal } from "@/components/ui/Modal";
import { TableShell, Td, Th } from "@/components/ui/TableShell";
import { useData } from "@/context/data-context";
import { nextNumericId } from "@/lib/ids";
import type { Department } from "@/lib/types";

export default function DepartmentsPage() {
  const { departments, setDepartments, log } = useData();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return departments;
    return departments.filter(
      (d) =>
        d.dept_id.toLowerCase().includes(s) ||
        d.dept_name.toLowerCase().includes(s) ||
        d.office_room.toLowerCase().includes(s),
    );
  }, [departments, q]);

  function remove(id: string) {
    if (!confirm("Delete this department?")) return;
    setDepartments((prev) => prev.filter((d) => d.dept_id !== id));
    log(`Department ${id} deleted`, "delete");
  }

  return (
    <RoleGuard moduleKey="departments">
      <div className="space-y-4">
        <Toolbar
          onAdd={() => {
            setEditing(null);
            setOpen(true);
          }}
          q={q}
          onSearch={setQ}
        />

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
                <Th>Office</Th>
                <Th>Phone</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.dept_id} className="hover:bg-white/[0.02]">
                  <Td className="font-mono text-xs text-sky-300/90">{d.dept_id}</Td>
                  <Td className="font-medium text-slate-100">{d.dept_name}</Td>
                  <Td>{d.office_room}</Td>
                  <Td>{d.phone}</Td>
                  <Td className="text-right">
                    <button
                      type="button"
                      className="mr-2 inline-flex rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-sky-300"
                      onClick={() => {
                        setEditing(d);
                        setOpen(true);
                      }}
                      aria-label="Edit"
                    >
                      <HiOutlinePencilSquare className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-300"
                      onClick={() => remove(d.dept_id)}
                      aria-label="Delete"
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

      <DeptModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing}
        departments={departments}
        setDepartments={setDepartments}
        log={log}
      />
    </RoleGuard>
  );
}

function Toolbar({
  q,
  onSearch,
  onAdd,
}: {
  q: string;
  onSearch: (v: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative max-w-md flex-1">
        <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
        <input
          value={q}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by ID, name, or office…"
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm outline-none ring-sky-500/30 focus:ring-2"
        />
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/20"
      >
        Add department
      </button>
    </div>
  );
}

function DeptModal({
  open,
  onClose,
  initial,
  departments,
  setDepartments,
  log,
}: {
  open: boolean;
  onClose: () => void;
  initial: Department | null;
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  log: (l: string, t?: "create" | "update" | "delete" | "info") => void;
}) {
  const [form, setForm] = useState<Department>({
    dept_id: "",
    dept_name: "",
    office_room: "",
    phone: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm(
      initial ?? {
        dept_id: nextNumericId("D", departments.map((d) => d.dept_id)),
        dept_name: "",
        office_room: "",
        phone: "",
      },
    );
  }, [initial, open, departments]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (initial) {
      setDepartments((prev) =>
        prev.map((d) => (d.dept_id === form.dept_id ? form : d)),
      );
      log(`Department ${form.dept_id} updated`, "update");
    } else {
      setDepartments((prev) => [...prev, form]);
      log(`Department ${form.dept_id} created`, "create");
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit department" : "New department"}
    >
      <form onSubmit={save} className="space-y-4">
        <Field label="Department ID">
          <input
            required
            disabled={!!initial}
            value={form.dept_id}
            onChange={(e) => setForm({ ...form, dept_id: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm disabled:opacity-60"
          />
        </Field>
        <Field label="Name">
          <input
            required
            value={form.dept_name}
            onChange={(e) => setForm({ ...form, dept_name: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Office room">
          <input
            required
            value={form.office_room}
            onChange={(e) => setForm({ ...form, office_room: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Phone">
          <input
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </Field>
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      {children}
    </div>
  );
}
