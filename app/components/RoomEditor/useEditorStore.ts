import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import {
  Fixture,
  FixtureType,
  RoomData,
  FIXTURE_DEFAULTS,
  TableData,
} from "./types";

interface EditorState {
  room: RoomData;
  selectedId: string | null;

  // Fixture actions
  addFixture: (type: FixtureType, x: number, y: number) => void;
  updateFixture: (id: string, changes: Partial<Fixture>) => void;
  updateTableData: (id: string, changes: Partial<TableData>) => void;
  updateRoom: (changes: Partial<RoomData>) => void;
  deleteFixture: (id: string) => void;
  selectFixture: (id: string | null) => void;

  // Room actions
  setRoomName: (name: string) => void;
  importRoom: (data: RoomData) => void;
  exportRoom: () => RoomData;
}

const DEFAULT_ROOM: RoomData = {
  id: uuidv4(),
  name: "New Room",
  occupancy: 100,
  canvasWidth: 1000,
  canvasHeight: 700,
  fixtures: [],
  tableData: [],
  updatedAt: new Date().toISOString(),
};

export const useEditorStore = create<EditorState>((set, get) => ({
  room: DEFAULT_ROOM,
  selectedId: null,

  addFixture: (type, x, y) => {
    const defaults = FIXTURE_DEFAULTS[type];
    const fixture: Fixture = {
      id: uuidv4(),
      type,
      x,
      y,
      width: defaults.width,
      height: defaults.height,
      rotation: 0,
      label: defaults.label,
      meta: {},
    };
    set((s) => ({
      room: {
        ...s.room,
        fixtures: [...s.room.fixtures, fixture],
        updatedAt: new Date().toISOString(),
      },
      selectedId: fixture.id,
    }));
    if (fixture.type.startsWith("table")) {
      const tableData: TableData = {
        id: fixture.id,
        seats: 8,
        seatsFilled: 0,
        open: true,
        interests: "",
        other: {},
      };
      set((s) => ({
        room: {
          ...s.room,
          tableData: [...s.room.tableData, tableData],
          updatedAt: new Date().toISOString(),
        },
      }));
    }
  },

  updateFixture: (id, changes) => {
    set((s) => ({
      room: {
        ...s.room,
        fixtures: s.room.fixtures.map((f) =>
          f.id === id ? { ...f, ...changes } : f,
        ),
        updatedAt: new Date().toISOString(),
      },
    }));
  },

  updateTableData: (id, changes) => {
    set((s) => ({
      room: {
        ...s.room,
        tableData: s.room.tableData.map((t) =>
          t.id === id ? { ...t, ...changes } : t,
        ),
        updatedAt: new Date().toISOString(),
      },
    }));
  },

  updateRoom: (changes) => {
    set((s) => ({
      room: {
        ...s.room,
        ...changes,
        updatedAt: new Date().toISOString(),
      },
    }));
  },

  deleteFixture: (id) => {
    set((s) => ({
      room: {
        ...s.room,
        fixtures: s.room.fixtures.filter((f) => f.id !== id),
        updatedAt: new Date().toISOString(),
      },
      selectedId: s.selectedId === id ? null : s.selectedId,
    }));
  },

  selectFixture: (id) => set({ selectedId: id }),

  setRoomName: (name) =>
    set((s) => ({
      room: { ...s.room, name, updatedAt: new Date().toISOString() },
    })),

  importRoom: (data) => set({ room: data, selectedId: null }),

  exportRoom: () => get().room,
}));
