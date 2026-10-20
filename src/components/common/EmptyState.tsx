import Link from "next/link";
import { Search, RotateCcw } from "lucide-react";
export interface EmptyStateProps {
  title?: string;
  description?: string;
  resetUrl?: string;
  resetLabel?: string;
  onReset?: () => void;
}
export const EmptyState = ({
  title = "No matches just yet.",
  description = "Try a different search or remove a few filters to explore more products.",
  resetUrl = "/products",
  resetLabel = "Reset filters",
  onReset,
}: EmptyStateProps) => (
  <div className="flex flex-col items-center text-center py-20 px-6">
    <Search size={36} strokeWidth={1} className="qt-muted mb-6" />
    <h2 className="text-2xl tracking-tight mb-3">{title}</h2>
    <p className="qt-muted max-w-sm text-sm leading-7 mb-7">{description}</p>
    {onReset ? (
      <button onClick={onReset} className="qt-button qt-button-secondary">
        <RotateCcw size={16} />
        {resetLabel}
      </button>
    ) : (
      <Link href={resetUrl} className="qt-button qt-button-secondary">
        <RotateCcw size={16} />
        {resetLabel}
      </Link>
    )}
  </div>
);
