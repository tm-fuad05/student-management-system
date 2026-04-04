"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineXMark } from "react-icons/hi2";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
};

export function Modal({ open, title, onClose, children, wide }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Close"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className={`glass-panel relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl p-5 sm:rounded-2xl ${
              wide ? "max-w-3xl" : "max-w-lg"
            }`}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                aria-label="Close dialog"
              >
                <HiOutlineXMark className="h-6 w-6" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
