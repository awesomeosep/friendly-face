"use client";

import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Fixture, FIXTURE_LABELS, RoomData, TableData } from "./types";
import { Button } from "../ui/button";
import { ButtonGroup } from "../ui/button-group";
import { SaveIcon } from "lucide-react";
import { Spinner } from "../ui/spinner";

interface Props {
  fixture: Fixture | null;
  room: RoomData;
  isMobile?: boolean;
  onChange: (changes: Partial<Fixture>) => void;
  onChangeRoom: (changes: Partial<RoomData>) => void;
  onChangeTableData: (changes: Partial<TableData>) => void;
  onDelete: () => void;
  onSaveData: () => void;
  loadingSave: boolean;
}

export default function PropertiesPanel({
  fixture,
  room,
  isMobile = false,
  onChange,
  onChangeRoom,
  onChangeTableData,
  onDelete,
  onSaveData,
  loadingSave,
}: Props) {
  const tableData = fixture?.type.startsWith("table")
    ? room.tableData.find((t) => t.id === fixture.id) || null
    : null;
  const [panel, setPanel] = useState<"map" | "data">("map");
  if (!fixture) {
    return (
      <aside
        className={
          isMobile
            ? "w-full max-h-[36vh] border-t flex flex-col p-3 gap-4 overflow-y-auto lg:w-[220px] lg:max-h-none lg:border-t-0 lg:border-l"
            : "w-[220px] border-l flex flex-col p-4 gap-5 overflow-y-auto"
        }
      >
        <Field label="Room Name">
          <Input
            type="text"
            value={room.name}
            onChange={(e) => onChangeRoom({ name: e.target.value })}
          />
        </Field>
        <Field label="Room Occupancy">
          <Input
            type="number"
            value={room.occupancy}
            onChange={(e) =>
              onChangeRoom({ occupancy: Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Room Width">
          <Input
            type="number"
            value={room.canvasWidth}
            onChange={(e) =>
              onChangeRoom({ canvasWidth: Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Room Height">
          <Input
            type="number"
            value={room.canvasHeight}
            onChange={(e) =>
              onChangeRoom({ canvasHeight: Number(e.target.value) })
            }
          />
        </Field>
        <Button disabled={loadingSave} onClick={onSaveData}>
          {loadingSave ? <Spinner /> : <SaveIcon />}
          Save Changes
        </Button>
      </aside>
    );
  }

  return (
    <aside
      className={
        isMobile
          ? "w-full max-h-[40vh] border-t flex flex-col p-3 gap-4 overflow-y-auto lg:w-[220px] lg:max-h-none lg:border-t-0 lg:border-l"
          : "w-[220px] border-l flex flex-col p-4 gap-5 overflow-y-auto"
      }
    >
      <Tabs defaultValue="map">
        <TabsList className="w-full">
          <TabsTrigger value="map">Map</TabsTrigger>
          {fixture.type.startsWith("table") && (
            <TabsTrigger value="data">Data</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="map">
          <div className="mb-4">
            <Field label="type">
              <p className="text-sm font-medium">
                {FIXTURE_LABELS[fixture.type]}
              </p>
              <p className="text-xs font-light">{fixture.id.slice(0, 8)}...</p>
            </Field>
          </div>
          <div className="flex flex-col gap-3">
            <Field label="Label">
              <Input
                type="text"
                value={fixture.label}
                onChange={(e) => onChange({ label: e.target.value })}
              />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="X">
                <Input
                  type="number"
                  value={Math.round(fixture.x)}
                  onChange={(e) => onChange({ x: Number(e.target.value) })}
                />
              </Field>
              <Field label="Y">
                <Input
                  type="number"
                  value={Math.round(fixture.y)}
                  onChange={(e) => onChange({ y: Number(e.target.value) })}
                />
              </Field>
              <Field label="W">
                <Input
                  type="number"
                  value={Math.round(fixture.width)}
                  onChange={(e) => onChange({ width: Number(e.target.value) })}
                />
              </Field>
              <Field label="H">
                <Input
                  type="number"
                  value={Math.round(fixture.height)}
                  onChange={(e) => onChange({ height: Number(e.target.value) })}
                />
              </Field>
            </div>

            <Field label="Rotation (deg)">
              <Input
                type="number"
                value={Math.round(fixture.rotation)}
                onChange={(e) => onChange({ rotation: Number(e.target.value) })}
              />
            </Field>

            <Button onClick={onDelete} className="mt-auto w-full py-2">
              Delete fixture
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="data">
          <div className="flex flex-col gap-3">
            <Field label="Seats">
              <Input
                type="number"
                value={Math.round(tableData?.seats ?? 0)}
                onChange={(e) =>
                  onChangeTableData({ seats: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Seats Occupied">
              <Input
                type="number"
                value={Math.round(tableData?.seatsFilled ?? 0)}
                onChange={(e) =>
                  onChangeTableData({ seatsFilled: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Open to more people?">
              <RadioGroup
                value={tableData?.open ? "yes" : "no"}
                onValueChange={(value) =>
                  onChangeTableData({ open: value === "yes" })
                }
                className="w-fit"
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="yes" id="r1" />
                  <Label htmlFor="r1">Yes</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="no" id="r2" />
                  <Label htmlFor="r2">No</Label>
                </div>
              </RadioGroup>
            </Field>
            {tableData?.open && (
              <Field label="Interests (comma-separated)">
                <Input
                  type="text"
                  value={tableData?.interests ?? ""}
                  onChange={(e) =>
                    onChangeTableData({ interests: e.target.value })
                  }
                />
              </Field>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* {panel === "map" ? (
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
      )} */}

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
          border-radius: 6px;
          padding: 5px 8px;
          font-size: 12px;
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
