"use client";

import { Fixture, FIXTURE_LABELS, TableData } from "./types";

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
  if (!fixture) {
    return (
      <aside
        className={
          isMobile
            ? "items-center justify-center w-full max-h-[36vh] border-t flex flex-col p-3 gap-4 overflow-y-auto lg:w-[220px] lg:max-h-none lg:border-t-0 lg:border-l"
            : "items-center justify-center w-[220px] border-l flex flex-col p-4 gap-5 overflow-y-auto"
        }
      >
        <p>Select a table to view</p>
      </aside>
    );
  }

  return (
    <aside
      className={
        isMobile
          ? "w-full max-h-[40vh] border-t flex flex-col p-3 gap-4 overflow-y-auto lg:w-[220px] lg:max-h-none lg:border-t-0 lg:border-l"
          : "w-[220px] border-l flex flex-col p-4 gap-4 overflow-y-auto"
      }
    >
      <div>
        <Field label="">
          <p className="font-medium">{fixture.label}</p>
          <p className="text-xs font-light">{FIXTURE_LABELS[fixture.type]}</p>
        </Field>
      </div>
      <p>This table is welcoming new people!</p>
      {/* {false && (
        <Field label="Seats Open">
          <p>
            {(tableData?.seats ?? 0) - (tableData?.seatsFilled ?? 0)}/
            {tableData?.seats ?? 0}
            
          </p>
        </Field>
      )} */}
      <Field label="Interests">
        <p>{tableData?.interests || "---"}</p>
      </Field>
      <style jsx>{`
        :global(.input-field) {
          width: 100%;
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
