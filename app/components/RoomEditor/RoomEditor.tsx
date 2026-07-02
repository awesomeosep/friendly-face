"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
import { useEditorStore } from "./useEditorStore";
import { FixtureType, FIXTURE_DEFAULTS } from "./types";
// import FixtureShape from "./FixtureShape";
// import Toolbar from "./Toolbar";
// import PropertiesPanel from "./PropertiesPanel";
import HeaderBar from "./HeaderBar";
import Toolbar from "./Toolbar";
import FixtureShape from "./FixtureShape";
import PropertiesPanel from "./PropertiesPanel";
import ViewPropertiesPanel from "./ViewPropertiesPanel";
import { client } from "@/lib/orpc";

const GRID_SIZE = 20;
const MIN_SCALE = 0.45;
const MAX_SCALE = 2.5;

export default function RoomEditor() {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [viewport, setViewport] = useState({ scale: 1, x: 0, y: 0 });
  const [mode, setMode] = useState<"map" | "table" | "view">("map");
  const [propertiesPanel, setPropertiesPanel] = useState<"map" | "data">("map");
  const [pendingFixture, setPendingFixture] = useState<FixtureType | null>(
    null,
  );
  const pinchStateRef = useRef<{ distance: number; scale: number } | null>(
    null,
  );

  const {
    room,
    selectedId,
    addFixture,
    updateFixture,
    updateTableData,
    updateRoom,
    deleteFixture,
    selectFixture,
    setRoomName,
    importRoom,
    exportRoom,
  } = useEditorStore();

  const selectedFixture =
    room.fixtures.find((f) => f.id === selectedId) ?? null;
  const selectedTableData =
    room.tableData.find((f) => f.id === selectedId) ?? null;
  const isMobile = stageSize.width < 900;

  const clampScale = useCallback(
    (value: number) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, value)),
    [],
  );

  const zoomToPoint = useCallback(
    (point: { x: number; y: number }, nextScale: number) => {
      setViewport((current) => {
        const scale = clampScale(nextScale);
        const worldPoint = {
          x: (point.x - current.x) / current.scale,
          y: (point.y - current.y) / current.scale,
        };

        return {
          scale,
          x: point.x - worldPoint.x * scale,
          y: point.y - worldPoint.y * scale,
        };
      });
    },
    [clampScale],
  );

  const fitViewport = useCallback(() => {
    const canvasWidth = Math.max(1, room.canvasWidth);
    const canvasHeight = Math.max(1, room.canvasHeight);
    const availableWidth = Math.max(1, stageSize.width - 48);
    const availableHeight = Math.max(1, stageSize.height - 48);
    const scale = clampScale(
      Math.min(availableWidth / canvasWidth, availableHeight / canvasHeight, 1),
    );

    setViewport({
      scale,
      x: (stageSize.width - canvasWidth * scale) / 2,
      y: (stageSize.height - canvasHeight * scale) / 2,
    });
  }, [
    clampScale,
    room.canvasHeight,
    room.canvasWidth,
    stageSize.height,
    stageSize.width,
  ]);

  // Resize canvas to fill container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setStageSize({ width: el.clientWidth, height: el.clientHeight });
    });
    ro.observe(el);
    setStageSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (stageSize.width <= 0 || stageSize.height <= 0) return;
    if (viewport.scale === 1 && viewport.x === 0 && viewport.y === 0) {
      fitViewport();
    }
  }, [
    fitViewport,
    stageSize.height,
    stageSize.width,
    viewport.scale,
    viewport.x,
    viewport.y,
  ]);

  // Grid lines
  const gridLines = () => {
    const lines: React.ReactNode[] = [];
    const w = room.canvasWidth;
    const h = room.canvasHeight;
    for (let x = 0; x <= w; x += GRID_SIZE) {
      lines.push(
        <Line
          key={`v${x}`}
          points={[x, 0, x, h]}
          stroke="#1a2235"
          strokeWidth={1}
        />,
      );
    }
    for (let y = 0; y <= h; y += GRID_SIZE) {
      lines.push(
        <Line
          key={`h${y}`}
          points={[0, y, w, y]}
          stroke="#1a2235"
          strokeWidth={1}
        />,
      );
    }
    return lines;
  };

  const snapToGrid = (val: number) => Math.round(val / GRID_SIZE) * GRID_SIZE;

  const getWorldPointFromStage = (stage: Konva.Stage) => {
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return null;
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    return transform.point(pointerPosition);
  };

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // if (mode === "view") {
      //   selectFixture(null);
      //   return;
      // }
      // Click on empty stage
      if (e.target === e.target.getStage()) {
        selectFixture(null);

        if (pendingFixture) {
          const pos = getWorldPointFromStage(e.target.getStage()!);
          if (!pos) return;
          const defaults = FIXTURE_DEFAULTS[pendingFixture];
          addFixture(
            pendingFixture,
            snapToGrid(pos.x - defaults.width / 2),
            snapToGrid(pos.y - defaults.height / 2),
          );
          setPendingFixture(null);
        }
      }
    },
    [mode, pendingFixture, addFixture, selectFixture],
  );

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      const pointerPosition = stage?.getPointerPosition();
      if (!stage || !pointerPosition) return;

      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const nextScale = viewport.scale * (direction > 0 ? 1.08 : 1 / 1.08);
      zoomToPoint(pointerPosition, nextScale);
    },
    [viewport.scale, zoomToPoint],
  );

  const handleTouchStart = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      if (e.evt.touches.length !== 2) return;
      const [firstTouch, secondTouch] = Array.from(e.evt.touches);
      const distance = Math.hypot(
        firstTouch.clientX - secondTouch.clientX,
        firstTouch.clientY - secondTouch.clientY,
      );
      pinchStateRef.current = { distance, scale: viewport.scale };
    },
    [viewport.scale],
  );

  const handleTouchMove = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      if (e.evt.touches.length !== 2 || !pinchStateRef.current) return;
      e.evt.preventDefault();

      const [firstTouch, secondTouch] = Array.from(e.evt.touches);
      const distance = Math.hypot(
        firstTouch.clientX - secondTouch.clientX,
        firstTouch.clientY - secondTouch.clientY,
      );
      const container = containerRef.current?.getBoundingClientRect();
      if (!container) return;

      const center = {
        x: (firstTouch.clientX + secondTouch.clientX) / 2 - container.left,
        y: (firstTouch.clientY + secondTouch.clientY) / 2 - container.top,
      };
      const nextScale = clampScale(
        pinchStateRef.current.scale *
          (distance / pinchStateRef.current.distance),
      );

      zoomToPoint(center, nextScale);
      pinchStateRef.current = { distance, scale: nextScale };
    },
    [clampScale, zoomToPoint],
  );

  const handleTouchEnd = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      if (e.evt.touches.length < 2) {
        pinchStateRef.current = null;
      }
    },
    [],
  );

  const handleCanvasDragMove = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    setViewport((current) => {
      const nextViewport = { ...current, x: stage.x(), y: stage.y() };
      return nextViewport;
    });
  }, []);

  const handleZoomIn = () => {
    zoomToPoint(
      { x: stageSize.width / 2, y: stageSize.height / 2 },
      viewport.scale * 1.2,
    );
  };

  const handleZoomOut = () => {
    zoomToPoint(
      { x: stageSize.width / 2, y: stageSize.height / 2 },
      viewport.scale / 1.2,
    );
  };

  const handleToolbarAdd = (type: FixtureType) => {
    if (mode !== "map") return;
    setPendingFixture(type);
  };

  const handleToggleMode = (newMode: "map" | "table" | "view") => {
    const oldMode = mode;
    setMode(newMode);
    if (newMode != oldMode) {
      setPendingFixture(null);
      selectFixture(null);
    }
  };

  const handleExport = () => {
    const data = exportRoom();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${room.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-[100dvh] h-[100dvh] flex-col bg-[#0f1117] text-white overflow-hidden">
      <HeaderBar
        roomName={room.name}
        onNameChange={setRoomName}
        onExport={handleExport}
        onImport={importRoom}
        mode={mode}
        onToggleMode={handleToggleMode}
      />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden">
        {mode === "map" && (
          <Toolbar onAdd={handleToolbarAdd} isMobile={isMobile} />
        )}

        {/* Canvas */}
        <div
          ref={containerRef}
          className="relative flex-1 min-h-[44vh] lg:min-h-0 overflow-hidden touch-none"
          style={{
            cursor: pendingFixture ? "crosshair" : "default",
          }}
        >
          <div className="absolute right-3 top-3 z-20 flex items-center gap-2 rounded-full border border-[#1e2535] bg-[#0a0d14]/90 px-2 py-1 backdrop-blur">
            <button
              type="button"
              onClick={handleZoomOut}
              className="canvas-control-btn"
              aria-label="Zoom out"
            >
              -
            </button>
            <button onClick={async () => {
              const results = await client.org.findMany();
              console.log(results);
            }}>hello</button>
            <button
              type="button"
              onClick={fitViewport}
              className="canvas-control-btn"
              aria-label="Fit to screen"
            >
              Fit
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="canvas-control-btn"
              aria-label="Zoom in"
            >
              +
            </button>
          </div>

          {pendingFixture && (
            <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full border border-[#4a9eff] bg-[#0d2140] px-3 py-1.5 text-xs font-medium text-[#4a9eff] pointer-events-none">
              Tap to place - drag to pan - pinch to zoom
            </div>
          )}

          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            onClick={handleStageClick}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDragMove={handleCanvasDragMove}
            draggable={true}
            x={viewport.x}
            y={viewport.y}
            scaleX={viewport.scale}
            scaleY={viewport.scale}
          >
            <Layer>{gridLines()}</Layer>
            <Layer>
              {room.fixtures.map((fixture) => (
                <FixtureShape
                  key={fixture.id}
                  fixture={fixture}
                  isSelected={fixture.id === selectedId}
                  isSelectable={
                    mode === "view"
                      ? fixture.type.startsWith("table") && room.tableData.find((t) => t.id === fixture.id)?.open
                      : true
                  }
                  isEditable={mode === "map"}
                  onSelect={() => {
                    setPropertiesPanel("map");
                    selectFixture(fixture.id);
                  }}
                  onChange={(changes) => updateFixture(fixture.id, changes)}
                  tableActiveColor={
                    mode !== "map" && fixture.type.startsWith("table")
                      ? room.tableData.find((t) => t.id === fixture.id)?.open
                        ? undefined
                        : "#8a9bb0"
                      : undefined
                  }
                />
              ))}
            </Layer>
          </Stage>
        </div>

        {mode === "map" && (
          <PropertiesPanel
            room={room}
            fixture={selectedFixture}
            isMobile={isMobile}
            onChange={(changes) =>
              selectedId && updateFixture(selectedId, changes)
            }
            onChangeRoom={(changes) => updateRoom(changes)}
            onChangeTableData={(changes) =>
              selectedId && updateTableData(selectedId, changes)
            }
            onDelete={() => selectedId && deleteFixture(selectedId)}
            panel={propertiesPanel}
            onChangePanel={setPropertiesPanel}
          />
        )}

        {/* {mode === "table" && (
          <TablePropertiesPanel
            fixture={selectedFixture}
            tableData={selectedTableData}
            isMobile={isMobile}
            onChange={(changes) =>
              selectedId && updateTableData(selectedId, changes)
            }
          />
        )} */}

        {mode === "view" && (
          <ViewPropertiesPanel
            fixture={selectedFixture}
            tableData={selectedTableData}
            isMobile={isMobile}
          />
        )}
      </div>

      {/* Status bar */}
      <div className="h-6 bg-[#080b11] border-t border-[#1e2535] flex items-center px-4 gap-4">
        <span className="text-[10px] text-[#3a4a60]">
          {room.fixtures.length} fixture{room.fixtures.length !== 1 ? "s" : ""}
        </span>
        {selectedFixture && (
          <span className="text-[10px] text-[#4a9eff]">
            {selectedFixture.type} x{Math.round(selectedFixture.x)} y
            {Math.round(selectedFixture.y)}
          </span>
        )}
        <span className="ml-auto text-[10px] text-[#2a3545]">
          Last saved: {new Date(room.updatedAt).toLocaleTimeString()}
        </span>
      </div>

      {/* Esc cancels placement */}
      {pendingFixture && <EscListener onEsc={() => setPendingFixture(null)} />}
    </div>
  );
}

function EscListener({ onEsc }: { onEsc: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEsc();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onEsc]);
  return null;
}
