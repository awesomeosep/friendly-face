"use client";

import { FixtureType, FIXTURE_LABELS, FIXTURE_COLORS } from "./types";

const FIXTURE_TYPES: FixtureType[] = [
  "table_round",
  "table_rect",
  "door",
  "wall",
  "counter",
  "label",
];

const FIXTURE_ICONS: Record<FixtureType, React.ReactNode> = {
  table_round: (
    <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="16" r="4" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  table_rect: (
    <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
      <rect x="4" y="9" width="24" height="14" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  door: (
    <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
      <rect x="4" y="6" width="14" height="22" stroke="currentColor" strokeWidth="2" />
      <path d="M18 6 Q28 6 28 28" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
    </svg>
  ),
  wall: (
    <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
      <rect x="3" y="13" width="26" height="6" fill="currentColor" opacity="0.4" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  counter: (
    <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
      <rect x="3" y="10" width="26" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <line x1="3" y1="16" x2="29" y2="16" stroke="currentColor" strokeWidth="1" />
    </svg>
  ),
  label: (
    <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
      <text x="4" y="22" fontSize="16" fill="currentColor" fontFamily="monospace" fontWeight="bold">T</text>
    </svg>
  ),
};

interface Props {
  onAdd: (type: FixtureType) => void;
  isMobile?: boolean;
}

export default function Toolbar({ onAdd, isMobile = false }: Props) {
  return (
    <aside className={isMobile ? "flex w-full flex-row items-stretch gap-2 overflow-x-auto border-b border-[#1e2535] bg-[#0a0d14] px-3 py-2 lg:w-[72px] lg:flex-col lg:items-center lg:overflow-visible lg:border-b-0 lg:border-r lg:px-0 lg:py-4" : "w-[72px] bg-[#0a0d14] border-r border-[#1e2535] flex flex-col items-center py-4 gap-2"}>
      <span className={isMobile ? "hidden text-[9px] uppercase tracking-widest text-[#3a4a60] mb-2 lg:block" : "text-[9px] uppercase tracking-widest text-[#3a4a60] mb-2"}>
        Add
      </span>
      {FIXTURE_TYPES.map((type) => (
        <button
          key={type}
          title={FIXTURE_LABELS[type]}
          onClick={() => onAdd(type)}
          style={{ color: FIXTURE_COLORS[type] }}
          className={isMobile ? "h-12 min-w-20 rounded-lg flex flex-col items-center justify-center gap-1 bg-[#111827] hover:bg-[#1a2436] border border-[#1e2535] hover:border-current transition-all group shrink-0 lg:w-12" : "w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-1 bg-[#111827] hover:bg-[#1a2436] border border-[#1e2535] hover:border-current transition-all group"}
        >
          {FIXTURE_ICONS[type]}
          <span className="text-[8px] text-[#4a5568] group-hover:text-current transition-colors leading-none">
            {FIXTURE_LABELS[type].split(" ")[0]}
          </span>
        </button>
      ))}
    </aside>
  );
}