"use client";

import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Fixture, FIXTURE_LABELS, RoomData, TableData } from "./types";
import { Button } from "../ui/button";
import { CheckIcon, CopyIcon, FilePenIcon, SaveIcon } from "lucide-react";
import { Spinner } from "../ui/spinner";
import { Field, FieldLabel } from "../ui/field";
import { Badge } from "../ui/badge";

interface Props {
  fixture: Fixture | null;
  room: RoomData;
  userRole: string | null;
  isMobile?: boolean;
  onChange: (changes: Partial<Fixture>) => void;
  onChangeRoom: (changes: Partial<RoomData>) => void;
  onChangeTableData: (changes: Partial<TableData>) => void;
  onDelete: () => void;
  onSaveData: () => void;
  loadingSave: boolean;
  loadingApproveLayout: boolean;
  onApproveLayout: () => void;
}

export default function PropertiesPanel({
  fixture,
  room,
  userRole,
  isMobile = false,
  onChange,
  onChangeRoom,
  onChangeTableData,
  onDelete,
  onSaveData,
  loadingSave,
  loadingApproveLayout,
  onApproveLayout,
}: Props) {
  const tableData = fixture?.type.startsWith("table")
    ? room.tableData.find((t) => t.id === fixture.id) || null
    : null;
  const [panel, setPanel] = useState<"map" | "data">("map");
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const copyRoomDataToClipboard = () => {
    const roomDataString = JSON.stringify(room, null, 2);
    navigator.clipboard.writeText(roomDataString).then(
      () => {
        setCopiedToClipboard(true);
        setTimeout(() => setCopiedToClipboard(false), 2000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
      },
    );
  };

  if (!fixture) {
    return (
      <aside
        className={
          isMobile
            ? "w-full max-h-[36vh] border-t flex flex-col p-3 gap-4 overflow-y-auto lg:w-[220px] lg:max-h-none lg:border-t-0 lg:border-l"
            : "w-[220px] border-l flex flex-col p-4 gap-4 overflow-y-auto"
        }
      >
        <div className="flex flex-col gap-2">
          <p>{room.name}</p>
          <div className="flex flex-row items-center justify-start gap-2">
            <p className="text-sm font-medium">Version:</p>
            <Badge variant="secondary">
              {room.approvedAt ? "Published" : "Staged"}
            </Badge>
          </div>
        </div>
        {/* <Field>
          <FieldLabel>Room Label</FieldLabel>
          <Input
            type="text"
            value={room.name}
            onChange={(e) => onChangeRoom({ name: e.target.value })}
          />
        </Field> */}
        {userRole === "approver" && room.approvedAt === null && (
          <div className="flex flex-col gap-2">
            <hr className="mb-2"></hr>
            <p>This staged version is pending approval.</p>
            <Button disabled={loadingApproveLayout} onClick={onApproveLayout}>
              {loadingApproveLayout ? <Spinner /> : <CheckIcon />}
              Approve
            </Button>
          </div>
        )}
        {room.approvedAt === null && (
          <div className="flex flex-col gap-2">
            <hr className="mb-2"></hr>
            <Field>
              <FieldLabel>Room Occupancy</FieldLabel>
              <Input
                type="number"
                value={room.occupancy}
                onChange={(e) =>
                  onChangeRoom({ occupancy: Number(e.target.value) })
                }
              />
            </Field>
            <Field>
              <FieldLabel>Room Width</FieldLabel>
              <Input
                type="number"
                value={room.canvasWidth}
                onChange={(e) =>
                  onChangeRoom({ canvasWidth: Number(e.target.value) })
                }
              />
            </Field>
            <Field>
              <FieldLabel>Room Height</FieldLabel>
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
              Save Staged
            </Button>
            <Button
              disabled={loadingSave}
              onClick={copyRoomDataToClipboard}
              variant="outline"
            >
              {copiedToClipboard ? <CheckIcon /> : <CopyIcon />}
              Copy layout data
            </Button>
          </div>
        )}
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
            <Field>
              <FieldLabel>Type</FieldLabel>
              <p className="text-sm font-medium">
                {FIXTURE_LABELS[fixture.type]}
              </p>
              <p className="text-xs font-light">{fixture.id.slice(0, 8)}...</p>
            </Field>
          </div>
          <div className="flex flex-col gap-3">
            <Field>
              <FieldLabel>Label</FieldLabel>
              <Input
                type="text"
                value={fixture.label}
                onChange={(e) => onChange({ label: e.target.value })}
              />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field>
                <FieldLabel>X</FieldLabel>
                <Input
                  type="number"
                  value={Math.round(fixture.x)}
                  onChange={(e) => onChange({ x: Number(e.target.value) })}
                />
              </Field>
              <Field>
                <FieldLabel>Y</FieldLabel>
                <Input
                  type="number"
                  value={Math.round(fixture.y)}
                  onChange={(e) => onChange({ y: Number(e.target.value) })}
                />
              </Field>
              <Field>
                <FieldLabel>W</FieldLabel>
                <Input
                  type="number"
                  value={Math.round(fixture.width)}
                  onChange={(e) => onChange({ width: Number(e.target.value) })}
                />
              </Field>
              <Field>
                <FieldLabel>H</FieldLabel>
                <Input
                  type="number"
                  value={Math.round(fixture.height)}
                  onChange={(e) => onChange({ height: Number(e.target.value) })}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel>Rotation (deg)</FieldLabel>
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
            {/* <Field>
              <FieldLabel>Seats</FieldLabel>
              <Input
                type="number"
                value={Math.round(tableData?.seats ?? 0)}
                onChange={(e) =>
                  onChangeTableData({ seats: Number(e.target.value) })
                }
              />
            </Field>
            <Field>
              <FieldLabel>Seats Occupied</FieldLabel>
              <Input
                type="number"
                value={Math.round(tableData?.seatsFilled ?? 0)}
                onChange={(e) =>
                  onChangeTableData({ seatsFilled: Number(e.target.value) })
                }
              />
            </Field> */}
            <Field>
              <FieldLabel>Open to more people?</FieldLabel>
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
              <Field>
                <FieldLabel>Interests (comma-separated)</FieldLabel>
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

function Field2({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </Field>
    // <div className="flex flex-col gap-1">
    //   <label className="text-[9px] uppercase tracking-widest text-[#3a4a60]">
    //     {label}
    //   </label>
    //   {children}
    // </div>
  );
}
