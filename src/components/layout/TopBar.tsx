"use client";

import { motion } from "framer-motion";
import { HiOutlineBars3 } from "react-icons/hi2";
import { useState } from "react";
import { Sidebar } from "./Sidebar";

export function TopBar({ title }: { title: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="glass-panel mb-4 flex items-center justify-between gap-4 rounded-2xl px-4 py-3 md:mb-6 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 md:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <HiOutlineBars3 className="h-6 w-6" />
          </button>
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-w-0"
          >
            <h2 className="truncate text-lg font-semibold text-slate-100 md:text-xl">
              {title}
            </h2>
          </motion.div>
        </div>
        <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300 ring-1 ring-emerald-500/25">
            Frontend demo
          </span>
        </div>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm md:hidden"
          role="dialog"
          aria-modal
        >
          <div className="flex h-full w-[min(100%,20rem)] flex-col p-3">
            <Sidebar />
            <button
              type="button"
              className="mt-2 rounded-xl bg-white/5 py-2 text-sm text-slate-300"
              onClick={() => setOpen(false)}
            >
              Close menu
            </button>
          </div>
          <button
            type="button"
            className="flex-1 cursor-default"
            aria-label="Close overlay"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </>
  );
}
