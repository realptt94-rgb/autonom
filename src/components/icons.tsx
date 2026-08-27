type P = { className?: string };

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function LogoIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        d="M12 2.6 20.2 7.3v9.4L12 21.4 3.8 16.7V7.3Z"
        fill="currentColor"
        opacity="0.14"
      />
      <path d="M12 2.6 20.2 7.3v9.4L12 21.4 3.8 16.7V7.3Z" {...S} />
      <path d="M13.1 6.8 9.4 12.6h3.1l-1.6 4.6 4.7-6.4h-3.2Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PlugIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <path d="M9 3.4v4.4M15 3.4v4.4" />
      <path d="M6.8 7.8h10.4v2.6a5.2 5.2 0 0 1-10.4 0Z" />
      <path d="M12 15.6v2.6c0 1.6-1.2 2.4-2.8 2.4H7" />
    </svg>
  );
}

export function ChipIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <rect x="6.4" y="6.4" width="11.2" height="11.2" rx="1.8" />
      <rect x="10" y="10" width="4" height="4" rx="0.8" fill="currentColor" stroke="none" opacity="0.5" />
      <path d="M9 6.4V3.2M15 6.4V3.2M9 20.8v-3.2M15 20.8v-3.2M6.4 9H3.2M6.4 15H3.2M20.8 9h-3.2M20.8 15h-3.2" />
    </svg>
  );
}

export function LockIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <rect x="5.4" y="10.2" width="13.2" height="10" rx="2" />
      <path d="M8.4 10.2V7.8a3.6 3.6 0 0 1 7.2 0v2.4" />
      <circle cx="12" cy="15" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PlaneIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <path d="M20.8 3.2c.7-.2 1.3.4 1.1 1.1L17.2 19c-.3 1-1.6 1.2-2.2.3l-3.4-4.9-5.4-1.6c-.9-.3-1-1.5-.2-1.9Z" />
      <path d="M11.6 14.4 20.5 4.6" opacity="0.55" />
      <path d="m11.6 14.4-.9 4.6c-.2.9-1.4 1-1.7.1L7.7 14" opacity="0.55" />
    </svg>
  );
}

export function GaugeIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <path d="M4.6 17.8a8.6 8.6 0 1 1 14.8 0" />
      <path d="m12 14.4 3.6-4.8" />
      <circle cx="12" cy="14.6" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function EuroIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <path d="M17.4 6.4A7 7 0 0 0 6.8 8.6a7.2 7.2 0 0 0 0 6.8 7 7 0 0 0 10.6 2.2" />
      <path d="M4.4 10.6h8M4.4 13.4h7.2" />
    </svg>
  );
}

export function CoinSlashIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M15 9.2a3.9 3.9 0 0 0-6.6 2.8 3.9 3.9 0 0 0 6.6 2.8M7.2 11.2h4M7.2 12.8h3.6" />
    </svg>
  );
}

export function QuillIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <path d="M19.6 4.4c-6.8.6-11 3.4-12.8 9.6l-1.6 5.6 5.6-1.6c6.2-1.8 9-6 9.6-12.8Z" />
      <path d="M5.6 18.4 15.4 8.6" />
    </svg>
  );
}

export function RadarIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <circle cx="12" cy="12" r="8.4" />
      <circle cx="12" cy="12" r="4.6" opacity="0.6" />
      <path d="M12 12 18 6.6" />
      <circle cx="15" cy="14.6" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TableIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <rect x="3.8" y="4.8" width="16.4" height="14.4" rx="1.6" />
      <path d="M3.8 9.6h16.4M9.6 9.6v9.6M15.2 9.6v9.6" />
    </svg>
  );
}

export function CodeIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <path d="m8.4 7.6-4.6 4.4 4.6 4.4M15.6 7.6l4.6 4.4-4.6 4.4" />
      <path d="M13.4 5.4 10.6 18.6" opacity="0.6" />
    </svg>
  );
}

export function ArrowIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <path d="M4.6 12h14.8M13.6 6.2l5.8 5.8-5.8 5.8" />
    </svg>
  );
}

export function CopyIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5.5 14.5H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 2 2v.5" />
    </svg>
  );
}

export function CheckIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <path d="m5 12.8 4.4 4.4L19 7.4" />
    </svg>
  );
}

export function PlusIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function SpinnerIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={`${className ?? ""} anim-spin`} {...S}>
      <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" />
    </svg>
  );
}

export function HouseIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <path d="m4 10.6 8-6.8 8 6.8v9a1.4 1.4 0 0 1-1.4 1.4H5.4A1.4 1.4 0 0 1 4 19.6Z" />
      <path d="M9.6 21v-6h4.8v6" />
    </svg>
  );
}

export function InfinityIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...S}>
      <path d="M12 12c-1.8-2.6-3-3.9-4.9-3.9a3.9 3.9 0 0 0 0 7.8c1.9 0 3.1-1.3 4.9-3.9Zm0 0c1.8 2.6 3 3.9 4.9 3.9a3.9 3.9 0 0 0 0-7.8c-1.9 0-3.1 1.3-4.9 3.9Z" />
    </svg>
  );
}
