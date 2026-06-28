"use client";

import { Fixture, FIXTURE_LABELS, RoomData, TableData } from "./types";

interface Props {
  fixture: Fixture | null;
  room: RoomData;
  isMobile?: boolean;
  onChange: (changes: Partial<Fixture>) => void;
  onChangeRoom: (changes: Partial<RoomData>) => void;
  onChangeTableData: (changes: Partial<TableData>) => void;
  onDelete: () => void;
  panel: "map" | "data";
  onChangePanel: (panel: "map" | "data") => void;
}

export default function PropertiesPanel({
  fixture,
  room,
  isMobile = false,
  onChange,
  onChangeRoom,
  onChangeTableData,
  onDelete,
  panel,
  onChangePanel,
}: Props) {
  const tableData = fixture?.type.startsWith("table")
    ? room.tableData.find((t) => t.id === fixture.id) || null
    : null;
  if (!fixture) {
    return (
      <aside
        className={
          isMobile
            ? "w-full max-h-[36vh] border-t border-[#1e2535] bg-[#0a0d14] flex flex-col p-3 gap-4 overflow-y-auto lg:w-[220px] lg:max-h-none lg:border-t-0 lg:border-l"
            : "w-[220px] bg-[#0a0d14] border-l border-[#1e2535] flex flex-col p-4 gap-5 overflow-y-auto"
        }
      >
        <Field label="Room Name">
          <input
            type="text"
            value={room.name}
            onChange={(e) => onChangeRoom({ name: e.target.value })}
            className="input-field"
          />
        </Field>
        <Field label="Room Occupancy">
          <input
            type="number"
            value={room.occupancy}
            onChange={(e) =>
              onChangeRoom({ occupancy: Number(e.target.value) })
            }
            className="input-field"
          />
        </Field>
        <Field label="Room Width">
          <input
            type="number"
            value={room.canvasWidth}
            onChange={(e) =>
              onChangeRoom({ canvasWidth: Number(e.target.value) })
            }
            className="input-field"
          />
        </Field>
        <Field label="Room Height">
          <input
            type="number"
            value={room.canvasHeight}
            onChange={(e) =>
              onChangeRoom({ canvasHeight: Number(e.target.value) })
            }
            className="input-field"
          />
        </Field>
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
      {fixture.type.startsWith("table") && (
        <div className="w-full flex gap-2">
          <button
            className={
              panel === "map"
                ? "w-full header-btn header-btn-primary"
                : "w-full header-btn"
            }
            onClick={() => onChangePanel("map")}
          >
            Map
          </button>
          <button
            className={
              panel === "data"
                ? "w-full header-btn header-btn-primary"
                : "w-full header-btn"
            }
            onClick={() => onChangePanel("data")}
          >
            Data
          </button>
        </div>
      )}
      <div>
        <div className="text-[9px] uppercase tracking-widest text-[#3a4a60] mb-1">
          Type
        </div>
        <div className="text-sm text-white font-medium">
          {FIXTURE_LABELS[fixture.type]}
        </div>
        <div className="text-[10px] text-[#3a4a60] mt-0.5 font-mono">
          {fixture.id.slice(0, 8)}...
        </div>
      </div>
      {panel === "map" ? (
        <div className="flex flex-col gap-3">
          <Field label="Label">
            <input
              type="text"
              value={fixture.label}
              onChange={(e) => onChange({ label: e.target.value })}
              className="input-field"
            />
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field label="X">
              <input
                type="number"
                value={Math.round(fixture.x)}
                onChange={(e) => onChange({ x: Number(e.target.value) })}
                className="input-field"
              />
            </Field>
            <Field label="Y">
              <input
                type="number"
                value={Math.round(fixture.y)}
                onChange={(e) => onChange({ y: Number(e.target.value) })}
                className="input-field"
              />
            </Field>
            <Field label="W">
              <input
                type="number"
                value={Math.round(fixture.width)}
                onChange={(e) => onChange({ width: Number(e.target.value) })}
                className="input-field"
              />
            </Field>
            <Field label="H">
              <input
                type="number"
                value={Math.round(fixture.height)}
                onChange={(e) => onChange({ height: Number(e.target.value) })}
                className="input-field"
              />
            </Field>
          </div>

          <Field label="Rotation (deg)">
            <input
              type="number"
              value={Math.round(fixture.rotation)}
              onChange={(e) => onChange({ rotation: Number(e.target.value) })}
              className="input-field"
            />
          </Field>

          <button
            onClick={onDelete}
            className="mt-auto w-full py-2 rounded-lg text-xs font-medium tracking-wide bg-[#2a1515] text-[#ff6b6b] border border-[#3a1e1e] hover:bg-[#3a1818] hover:border-[#ff6b6b] transition-all"
          >
            Delete fixture
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Field label="Seats">
            <input
              type="number"
              value={Math.round(tableData?.seats ?? 0)}
              onChange={(e) =>
                onChangeTableData({ seats: Number(e.target.value) })
              }
              className="input-field"
            />
          </Field>

          <Field label="Seats filled">
            <input
              type="number"
              value={Math.round(tableData?.seatsFilled ?? 0)}
              onChange={(e) =>
                onChangeTableData({ seatsFilled: Number(e.target.value) })
              }
              className="input-field"
            />
          </Field>

          <Field label="Open to more people?">
            <div className="grid grid-cols-2 gap-2">
              <button
                className={
                  tableData?.open
                    ? "header-btn header-btn-primary"
                    : "header-btn"
                }
                onClick={() => onChangeTableData({ open: true })}
              >
                Yes
              </button>
              <button
                className={
                  !tableData?.open
                    ? "header-btn header-btn-primary"
                    : "header-btn"
                }
                onClick={() => onChangeTableData({ open: false })}
              >
                No
              </button>
            </div>
          </Field>

          {tableData?.open && (
            <Field label="Interests (comma-separated)">
              <input
                type="text"
                value={tableData?.interests ?? ""}
                onChange={(e) =>
                  onChangeTableData({ interests: e.target.value })
                }
                className="input-field"
              />
            </Field>
          )}
        </div>
      )}

      {/* Extra metadata -- extend this per fixture type */}
      {/* {(fixture.type === "table_round" || fixture.type === "table_rect") && (
        <Field label="Seats">
          <input
            type="number"
            value={(fixture.meta.seats as number) ?? ""}
            onChange={(e) =>
              onChange({
                meta: { ...fixture.meta, seats: Number(e.target.value) },
              })
            }
            className="input-field"
            placeholder="e.g. 4"
          />
        </Field>
      )} */}

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
