// Brand-aligned SVG icon components
// Color: #FA6C18 (brand orange) or passed via className/color prop

type IconProps = { className?: string; color?: string };

export function IconForklift({ className = "w-6 h-6", color = "#FA6C18" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17V7l5-4h8v14" />
      <path d="M8 3v8H3" />
      <path d="M16 17V9" />
      <path d="M19 9h-3" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="19" r="2" />
      <path d="M8 19h8" />
    </svg>
  );
}

export function IconStacker({ className = "w-6 h-6", color = "#FA6C18" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="8" rx="1" />
      <path d="M12 10v12" />
      <path d="M7 19h10" />
      <path d="M9 22h6" />
      <path d="M5 6H3v8h2" />
      <path d="M19 6h2v8h-2" />
    </svg>
  );
}

export function IconPallet({ className = "w-6 h-6", color = "#FA6C18" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="14" width="20" height="3" rx="1" />
      <path d="M6 14v-4" />
      <path d="M12 14v-4" />
      <path d="M18 14v-4" />
      <rect x="4" y="7" width="16" height="3" rx="1" />
      <path d="M4 20h16" />
      <path d="M7 20v1" />
      <path d="M17 20v1" />
    </svg>
  );
}

export function IconGear({ className = "w-6 h-6", color = "#FA6C18" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function IconWarehouse({ className = "w-6 h-6", color = "#FA6C18" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function IconOutdoor({ className = "w-6 h-6", color = "#FA6C18" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

export function IconNarrowAisle({ className = "w-6 h-6", color = "#FA6C18" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3v18" />
      <path d="M16 3v18" />
      <path d="M11 8l2 0" />
      <path d="M11 12l2 0" />
      <path d="M11 16l2 0" />
      <path d="M3 3h18" />
      <path d="M3 21h18" />
    </svg>
  );
}

export function IconHeavyLoad({ className = "w-6 h-6", color = "#FA6C18" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

export function IconWeightSm({ className = "w-6 h-6", color = "#FA6C18" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2h4" />
      <path d="M12 2v3" />
      <path d="M5 8h14l-2 13H7z" />
      <path d="M9 11v5" />
      <path d="M12 11v5" />
      <path d="M15 11v5" />
    </svg>
  );
}

export function IconWeightMd({ className = "w-6 h-6", color = "#FA6C18" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      <line x1="12" y1="13" x2="12" y2="16" />
    </svg>
  );
}

export function IconWeightLg({ className = "w-6 h-6", color = "#FA6C18" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h18l-3 13H6z" />
      <path d="M8 8V5a4 4 0 0 1 8 0v3" />
      <path d="M9 12h6" />
      <path d="M9 15h6" />
    </svg>
  );
}

export function IconQuestion({ className = "w-6 h-6", color = "#FA6C18" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function IconTire({ className = "w-6 h-6", color = "#FA6C18" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="8" />
      <line x1="12" y1="16" x2="12" y2="22" />
      <line x1="2" y1="12" x2="8" y2="12" />
      <line x1="16" y1="12" x2="22" y2="12" />
    </svg>
  );
}

export function IconBattery({ className = "w-6 h-6", color = "#FA6C18" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="18" height="11" rx="2" />
      <path d="M20 11h2v4h-2" />
      <line x1="6" y1="11" x2="6" y2="15" />
      <line x1="10" y1="11" x2="10" y2="15" />
      <line x1="14" y1="11" x2="14" y2="15" />
    </svg>
  );
}

export function IconHydraulic({ className = "w-6 h-6", color = "#FA6C18" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10" />
      <path d="M12 2c0 4-2 6-2 10s2 6 2 10" />
      <path d="M2 12h20" />
      <path d="M16 7l4-4" />
      <path d="M16 3h4v4" />
    </svg>
  );
}

export function IconEngine({ className = "w-6 h-6", color = "#FA6C18" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="14" height="10" rx="2" />
      <path d="M17 12h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 8V6" />
      <path d="M11 8V6" />
      <path d="M3 12H1" />
      <path d="M7 19v1" />
      <path d="M11 19v1" />
    </svg>
  );
}

export function IconElectric({ className = "w-6 h-6", color = "#FA6C18" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export function IconChain({ className = "w-6 h-6", color = "#FA6C18" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function IconCrane({ className = "w-6 h-6", color = "#FA6C18" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h20" />
      <path d="M6 20V8" />
      <path d="M6 8h12" />
      <path d="M18 8v4" />
      <path d="M18 14v2" />
      <path d="M6 4l12 4" />
      <circle cx="18" cy="17" r="1" />
    </svg>
  );
}

export function IconHandshake({ className = "w-6 h-6", color = "#FA6C18" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
      <path d="M12 5.36 8.87 8.5a2.13 2.13 0 0 0 0 3 2.13 2.13 0 0 0 3.13 0l2.37-2.37a2.13 2.13 0 0 1 3.13 0l2.43 2.44" />
    </svg>
  );
}

export function IconClock({ className = "w-6 h-6", color = "#FA6C18" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function IconMap({ className = "w-6 h-6", color = "#FA6C18" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

export function IconWrench({ className = "w-6 h-6", color = "#FA6C18" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
