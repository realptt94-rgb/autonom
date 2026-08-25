import { useEffect, useRef, useState, type ReactNode } from "react";

type IconProps = { className?: string };

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function LogoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <path d="M12 2.4 20.6 7.2v9.6L12 21.6 3.4 16.8V7.2Z" />
      <path d="M12 7.6v8.8M8.2 9.8l7.6 4.4M15.8 9.8l-7.6 4.4" opacity="0.55" />
      <circle cx="12" cy="12" r="2.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BoltIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <path d="M13.2 2.8 5.6 13.4h5l-1.4 7.8 8.2-11.2h-5.2Z" />
    </svg>
  );
}

export function BranchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <circle cx="6.2" cy="5.4" r="2.1" />
      <circle cx="6.2" cy="18.6" r="2.1" />
      <circle cx="17.8" cy="7" r="2.1" />
      <path d="M6.2 7.5v9M17.8 9.1c0 4.8-6.8 4.2-9.5 7.6" />
    </svg>
  );
}

export function TermIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <rect x="3" y="4.2" width="18" height="15.6" rx="2" />
      <path d="m7 9 3.2 3L7 15M12.6 15.2H17" />
    </svg>
  );
}

export function CopyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5.5 14.5H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 2 2v.5" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <path d="m5 12.8 4.4 4.4L19 7.4" />
    </svg>
  );
}

export function CrossIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </svg>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M8.2 5.4v13.2L19 12Z" fill="currentColor" />
    </svg>
  );
}

export function StopIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <rect x="6.6" y="6.6" width="10.8" height="10.8" rx="1.6" fill="currentColor" />
    </svg>
  );
}

export function RefreshIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <path d="M4.4 12a7.6 7.6 0 0 1 13-5.3M19.6 12a7.6 7.6 0 0 1-13 5.3" />
      <path d="M17.6 3.4v3.4h-3.4M6.4 20.6v-3.4h3.4" />
    </svg>
  );
}

export function DiskIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <ellipse cx="12" cy="5.4" rx="7" ry="2.6" />
      <path d="M5 5.4v13.2c0 1.44 3.13 2.6 7 2.6s7-1.16 7-2.6V5.4" />
      <path d="M5 12c0 1.44 3.13 2.6 7 2.6s7-1.16 7-2.6" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <path d="M12 3.2 19 6v5.2c0 4.6-3 7.6-7 9.4-4-1.8-7-4.8-7-9.4V6Z" />
      <path d="m9 11.6 2.2 2.2 4-4.4" />
    </svg>
  );
}

export function BoxIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <path d="M12 3 3.6 7.6v8.8L12 21l8.4-4.6V7.6Z" />
      <path d="M3.6 7.6 12 12.2l8.4-4.6M12 12.2V21" />
    </svg>
  );
}

export function FilterIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <path d="M4 5.4h16l-6.2 7.2v5l-3.6 2v-7Z" />
    </svg>
  );
}

export function ArrowIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <path d="M4.5 12h15M13.5 6l6 6-6 6" />
    </svg>
  );
}

export function SpinnerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" />
    </svg>
  );
}

export function TildeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <path d="M4.5 13.2c1.8-2.8 3.8-2.8 5.6 0s3.8 2.8 5.6 0 3.4-2.6 3.8-1.2" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${on ? "on" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function Toast({ toast }: { toast: { id: number; msg: string } | null }) {
  if (!toast) return null;
  return (
    <div key={toast.id} className="pointer-events-none fixed bottom-6 right-6 z-50">
      <div className="flex items-center gap-2.5 rounded-lg border border-teal/40 bg-panel2/95 px-4 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-teal/15 text-teal">
          <CheckIcon className="h-3.5 w-3.5" />
        </span>
        <span className="font-mono text-[12.5px] text-ink">{toast.msg}</span>
      </div>
    </div>
  );
}
