"use client";

import { useRef } from "react";
import { RoomData } from "./types";

interface Props {
  roomName: string;
  onNameChange: (name: string) => void;
  onExport: () => void;
  onImport: (data: RoomData) => void;
  mode: "map" | "table" | "view";
  onToggleMode: (newMode: "map" | "table" | "view") => void;
}

export default function HeaderBar({
  roomName,
  onNameChange,
  onExport,
  onImport,
  mode,
  onToggleMode,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as RoomData;
        onImport(data);
      } catch {
        alert("Invalid room file.");
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-imported
    e.target.value = "";
  };

  return (
    <header className="flex min-h-12 shrink-0 flex-wrap items-center gap-3 border-b border-[#1e2535] bg-[#080b11] px-4 py-2">
      {/* Logo mark */}
      <div className="flex items-center gap-2 mr-2">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="1" y="1" width="18" height="18" rx="3" stroke="#4a9eff" strokeWidth="1.5" />
          <rect x="4" y="7" width="5" height="5" fill="#4a9eff" opacity="0.5" rx="1" />
          <rect x="11" y="7" width="5" height="5" fill="#4a9eff" opacity="0.5" rx="1" />
          <rect x="4" y="14" width="12" height="2" fill="#4a9eff" opacity="0.3" rx="1" />
        </svg>
        <span className="text-[11px] font-semibold tracking-widest text-[#4a9eff] uppercase">
          RoomMap
        </span>
      </div>

      {/* Room name */}
      <span className="min-w-0 truncate text-sm text-white">{roomName}</span>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => onToggleMode("map")}
          className={mode === "map" ? "header-btn header-btn-primary" : "header-btn"}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onToggleMode("view")}
          className={mode === "view" ? "header-btn header-btn-primary" : "header-btn"}
        >
          View
        </button>

        {/* Import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="header-btn"
        >
          Import JSON
        </button>

        {/* Export */}
        <button onClick={onExport} className="header-btn header-btn-primary">
          Export JSON
        </button>
      </div>

      <style jsx>{`
        :global(.header-btn) {
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.03em;
          border: 1px solid #1e2535;
          background: #111827;
          color: #8a9bb0;
          cursor: pointer;
          transition: all 0.15s;
        }
        :global(.header-btn:hover) {
          border-color: #4a9eff;
          color: #4a9eff;
        }
        :global(.header-btn-primary) {
          background: #0d2140;
          border-color: #4a9eff;
          color: #4a9eff;
        }
        :global(.header-btn-primary:hover) {
          background: #1a3a60;
        }
        :global(.header-btn[data-active="true"]) {
          background: #0d2140;
          border-color: #4a9eff;
          color: #4a9eff;
        }
      `}</style>
    </header>
  );
}