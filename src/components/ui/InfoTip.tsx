import { useEffect, useRef, useState } from "react";
import { HelpCircle } from "lucide-react";

/**
 * Prominent, tap-friendly info tooltip. Uses a visible pill trigger
 * and a click-to-open popover so it works on touch devices (where the
 * native `title` attribute never fires).
 */
export function InfoTip({
  text,
  label = "More info",
  size = "sm",
}: {
  text: string;
  label?: string;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const dims = size === "md" ? "h-5 w-5" : "h-[18px] w-[18px]";
  const icon = size === "md" ? 13 : 11;

  return (
    <span ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={`${dims} inline-flex shrink-0 cursor-help items-center justify-center rounded-full border border-brand/40 bg-brand/10 text-brand ring-0 transition hover:bg-brand hover:text-brand-foreground focus:outline-none focus:ring-2 focus:ring-brand/40`}
      >
        <HelpCircle size={icon} strokeWidth={2.5} />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-full z-50 mt-2 w-64 max-w-[80vw] -translate-x-1/2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-normal leading-snug text-foreground shadow-xl"
        >
          {text}
        </span>
      )}
    </span>
  );
}