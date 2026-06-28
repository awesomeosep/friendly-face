"use client";

import { Fixture, TableData } from "./types";

interface Props {
  fixture: Fixture | null;
  tableData: TableData | null;
  isMobile?: boolean;
}

export default function PropertiesPanel({
  fixture,
  tableData,
  isMobile = false,
}: Props) {

  // const apps = getAppointments()

  // apps.
  if (!fixture) {
    return (
      <aside
        className={
          isMobile
            ? "items-center justify-center w-full max-h-[36vh] border-t border-[#1e2535] bg-[#0a0d14] flex flex-col p-3 gap-4 overflow-y-auto lg:w-[220px] lg:max-h-none lg:border-t-0 lg:border-l"
            : "items-center justify-center w-[220px] bg-[#0a0d14] border-l border-[#1e2535] flex flex-col p-4 gap-5 overflow-y-auto"
        }
      >
        <span className="text-[10px] text-[#3a4a60]">
          Select a table to view
        </span>
      </aside>
    );
  }

  return (
    <aside
      className={
        isMobile
          ? "w-full max-h-[40vh] border-t border-[#1e2535] bg-[#0a0d14] flex flex-col p-3 gap-4 overflow-y-auto lg:w-[220px] lg:max-h-none lg:border-t-0 lg:border-l"
          : "w-[220px] bg-[#0a0d14] border-l border-[#1e2535] flex flex-col p-4 gap-5 overflow-y-auto"
      }
    >
      <div>
        <div className="text-sm text-white font-medium">{fixture.label}</div>
        <div className="text-[10px] text-[#3a4a60] mt-0.5 font-mono">
          {fixture.id.slice(0, 8)}...
        </div>
      </div>

      <span>This table is welcoming new people!</span>

      <Field label="Seats Open">
        <span>{(tableData?.seats ?? 0) - (tableData?.seatsFilled ?? 0)}/{tableData?.seats ?? 0}</span>
      </Field>

      <Field label="Interests">
        <span>{tableData?.interests ?? "No interests entered"}</span>
      </Field>

      <style jsx>{`
        :global(.input-field) {
          width: 100%;
          background: #111827;
          border: 1px solid #1e2535;
          border-radius: 6px;
          padding: 5px 8px;
          font-size: 12px;
          color: #e2e8f0;
          outline: none;
          transition: border-color 0.15s;
        }
        :global(.input-field:focus) {
          border-color: #4a9eff;
        }
      `}</style>
    </aside>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] uppercase tracking-widest text-[#3a4a60]">
        {label}
      </label>
      {children}
    </div>
  );
}
