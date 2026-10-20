"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

/** Native dialog supplies focus trapping, Escape dismissal, and focus restoration. */
export function Modal({
  title,
  onClose,
  children,
  className = "",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    dialog?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      className={`qt-dialog ${className}`}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="qt-dialog-content">
        <div className="qt-dialog-heading">
          <h2>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="icon-button"
            aria-label={`Close ${title.toLowerCase()}`}
          >
            <X size={22} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
