"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { HiOutlineMagnifyingGlass, HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/auth-context";
import { canWritePayments } from "@/lib/permissions";
import { Modal } from "@/components/ui/Modal";
import { TableShell, Td, Th } from "@/components/ui/TableShell";
import { useData } from "@/context/data-context";
import { nextNumericId } from "@/lib/ids";
import type { Payment, PaymentRecordStatus, PaymentType } from "@/lib/types";

export default function PaymentsPage() {
  const { user } = useAuth();
  const { payments, students, setPayments, log } = useData();
  const canWrite = user ? canWritePayments(user.role) : false;
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return payments;
    return payments.filter((p) => {
      const st = students.find((x) => x.student_id === p.student_id);
      return (
        p.payment_id.toLowerCase().includes(s) ||
        (st?.student_name.toLowerCase().includes(s) ?? false)
      );
    });
  }, [payments, students, q]);

  function remove(id: string) {
    if (!canWrite) return;
    if (!confirm("Delete this payment record?")) return;
    const p = payments.find((x) => x.payment_id === id);
    setPayments((prev) => prev.filter((x) => x.payment_id !== id));
    log(`Payment ${id} deleted`, "delete", p ? { student_id: p.student_id } : undefined);
  }

  return (
    <RoleGuard moduleKey="payments">
      <div className="space-y-4">
        {!canWrite && (
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95">
            <strong className="font-semibold">View only.</strong> Academic staff can review
            payment records; only admins may add, edit, or delete payment entries.
          </p>
        )}
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
          {canWrite && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
              className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950"
            >
              Add payment
            </button>
          )}
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
                <Th>Date</Th>
                <Th>Amount</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.payment_id} className="hover:bg-white/[0.02]">
                  <Td className="font-mono text-xs text-sky-300/90">{p.payment_id}</Td>
                  <Td>
                    {students.find((s) => s.student_id === p.student_id)?.student_name ??
                      p.student_id}
                  </Td>
                  <Td className="text-xs">{p.payment_date}</Td>
                  <Td className="tabular-nums">${p.amount.toLocaleString()}</Td>
                  <Td className="text-xs">{p.payment_type}</Td>
                  <Td>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ring-1 ${
                        p.payment_status === "Paid"
                          ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
                          : p.payment_status === "Pending"
                            ? "bg-amber-500/15 text-amber-200 ring-amber-500/30"
                            : "bg-sky-500/15 text-sky-200 ring-sky-500/30"
                      }`}
                    >
                      {p.payment_status}
                    </span>
                  </Td>
                  <Td className="text-right">
                    {canWrite && (
                      <>
                        <button
                          type="button"
                          className="mr-2 inline-flex rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-sky-300"
                          onClick={() => {
                            setEditing(p);
                            setOpen(true);
                          }}
                        >
                          <HiOutlinePencilSquare className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-300"
                          onClick={() => remove(p.payment_id)}
                        >
                          <HiOutlineTrash className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    {!canWrite && <span className="text-xs text-slate-600">—</span>}
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </motion.div>
      </div>

      {canWrite && (
        <PaymentModal
          open={open}
          onClose={() => setOpen(false)}
          initial={editing}
          payments={payments}
          students={students}
          setPayments={setPayments}
          log={log}
        />
      )}
    </RoleGuard>
  );
}

function PaymentModal({
  open,
  onClose,
  initial,
  payments,
  students,
  setPayments,
  log,
}: {
  open: boolean;
  onClose: () => void;
  initial: Payment | null;
  payments: Payment[];
  students: { student_id: string; student_name: string }[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  log: (
    l: string,
    t?: "create" | "update" | "delete" | "info",
    meta?: { student_id?: string },
  ) => void;
}) {
  const [form, setForm] = useState<Payment>({
    payment_id: "",
    payment_date: "",
    amount: 0,
    payment_type: "Tuition Fee",
    payment_status: "Paid",
    student_id: students[0]?.student_id ?? "",
  });

  useEffect(() => {
    if (!open) return;
    setForm(
      initial ?? {
        payment_id: nextNumericId("P", payments.map((p) => p.payment_id)),
        payment_date: new Date().toISOString().slice(0, 10),
        amount: 1000,
        payment_type: "Tuition Fee",
        payment_status: "Pending",
        student_id: students[0]?.student_id ?? "",
      },
    );
  }, [initial, open, payments, students]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (initial) {
      setPayments((prev) =>
        prev.map((p) => (p.payment_id === form.payment_id ? form : p)),
      );
      log(`Payment ${form.payment_id} updated`, "update", {
        student_id: form.student_id,
      });
    } else {
      setPayments((prev) => [...prev, form]);
      log(`Payment ${form.payment_id} recorded`, "create", {
        student_id: form.student_id,
      });
    }
    onClose();
  }

  const types: PaymentType[] = ["Tuition Fee", "Registration Fee", "Lab Fee"];
  const statuses: PaymentRecordStatus[] = ["Paid", "Pending", "Partial"];

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit payment" : "New payment"}>
      <form onSubmit={save} className="space-y-4">
        <label className="text-xs text-slate-500">
          Payment ID
          <input
            required
            disabled={!!initial}
            value={form.payment_id}
            onChange={(e) => setForm({ ...form, payment_id: e.target.value })}
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
          Payment date
          <input
            type="date"
            required
            value={form.payment_date}
            onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-slate-500">
          Amount
          <input
            type="number"
            min={0}
            step={50}
            required
            value={form.amount}
            onChange={(e) =>
              setForm({ ...form, amount: Number.parseFloat(e.target.value) })
            }
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-slate-500">
          Type
          <select
            value={form.payment_type}
            onChange={(e) =>
              setForm({ ...form, payment_type: e.target.value as PaymentType })
            }
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-500">
          Status
          <select
            value={form.payment_status}
            onChange={(e) =>
              setForm({
                ...form,
                payment_status: e.target.value as PaymentRecordStatus,
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
