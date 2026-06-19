export type FixtureType =
  | "table_round"
  | "table_rect"
  | "door"
  | "wall"
  | "counter"
  | "label";

export interface Fixture {
  id: string;
  type: FixtureType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  label: string;
  meta: Record<string, unknown>;
}

export interface TableData {
  id: string;
  seats: number;
  seatsFilled: number;
  open: boolean;
  interests: string;
  other: Record<string, unknown>;
}

export interface RoomData {
  id: string;
  name: string;
  occupancy: number;
  canvasWidth: number;
  canvasHeight: number;
  fixtures: Fixture[];
  tableData: TableData[];
  updatedAt: string;
}

export const FIXTURE_DEFAULTS: Record<
  FixtureType,
  { width: number; height: number; label: string }
> = {
  table_round: { width: 80, height: 80, label: "Table" },
  table_rect: { width: 120, height: 70, label: "Table" },
  door: { width: 60, height: 12, label: "Door" },
  wall: { width: 160, height: 12, label: "Wall" },
  counter: { width: 160, height: 40, label: "Counter" },
  label: { width: 100, height: 30, label: "Label" },
};

export const FIXTURE_COLORS: Record<FixtureType, string> = {
  table_round: "#4a9eff",
  table_rect: "#4a9eff",
  door: "#f5a623",
  wall: "#8a9bb0",
  counter: "#b08a4a",
  label: "#ffffff",
};

export const FIXTURE_LABELS: Record<FixtureType, string> = {
  table_round: "Round Table",
  table_rect: "Rect Table",
  door: "Door",
  wall: "Wall",
  counter: "Counter",
  label: "Text Label",
};