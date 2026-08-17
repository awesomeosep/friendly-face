"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
import { useEditorStore } from "./useEditorStore";
import { FixtureType, FIXTURE_DEFAULTS, RoomData } from "./types";
import Toolbar from "./Toolbar";
import FixtureShape from "./FixtureShape";
import PropertiesPanel from "./PropertiesPanel";
import ViewPropertiesPanel from "./ViewPropertiesPanel";
import { client, orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { ORPCError } from "@orpc/client";
import { useParams } from "next/navigation";
import { LayoutDataSchema } from "@/lib/schema";

const GRID_SIZE = 20;
const MIN_SCALE = 0.45;
const MAX_SCALE = 8;

type ParamsType = {
  org_id: string;
  room_id: string;
  period_id: string;
};

Konva.hitOnDragEnabled = true;

export default function RoomEditor(props: { mode: "edit" | "view" }) {
  const orgId = parseInt(useParams<ParamsType>().org_id);
  const roomId = parseInt(useParams<ParamsType>().room_id);
  const periodId = parseInt(useParams<ParamsType>().period_id);

  const stageRef = useRef<Konva.Stage>(null);
  // const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState<{
    width: number | null;
    height: number | null;
  }>({ width: null, height: null });
  const [viewport, setViewport] = useState({ scale: 1, x: 0, y: 0 });
  const [pendingFixture, setPendingFixture] = useState<FixtureType | null>(
    null,
  );
  const pinchStateRef = useRef<{
    lastCenter: { x: number; y: number };
    lastDistance: number;
  } | null>(null);
  const pinchFrameRef = useRef<number | null>(null);
  const pinchViewportRef = useRef<{
    scale: number;
    x: number;
    y: number;
  } | null>(null);
  const [loadingSave, setLoadingSave] = useState(false);
  const [containerElement, setContainerElement] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    return () => {
      if (pinchFrameRef.current !== null) {
        window.cancelAnimationFrame(pinchFrameRef.current);
      }
    };
  }, []);

  // useEffect(() => {
  //   const updateSize = () => {
  //     if (containerElement) {
  //       console.log("width", containerElement.clientWidth);
  //       console.log("height", containerElement.clientHeight);
  //       setStageSize({
  //         width: containerElement.clientWidth,
  //         height: containerElement.clientHeight,
  //       });
  //     }
  //   };

  //   console.log("size effect");
  //   updateSize();

  // }, [containerRef]);

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
    setRoomUpdatedAt,
  } = useEditorStore();

  const {
    isPending: roomDataLoading,
    data: roomData,
    isSuccess: roomDataSuccess,
  } = useQuery(
    orpc.org.findRoomDataByRoomPeriod.queryOptions({
      staleTime: Infinity,
      cacheTime: Infinity,
      input: {
        org_id: orgId.toString(),
        room_id: roomId.toString(),
        period_id: periodId.toString(),
      },
      onError: (error: ORPCError<string, unknown>) => {
        console.error("Error fetching organization:", error);
      },
    }),
  );

  const hasExecuted = useRef(false);

  useEffect(() => {
    if (roomDataSuccess && !hasExecuted.current) {
      console.log("Query succeeded! Data:", roomData);

      const parsedLayoutData = LayoutDataSchema.safeParse(
        roomData?.layout_data,
      );
      if (roomData) {
        const newRoomData: RoomData = {
          id: roomData.id,
          name: roomData.label,
          occupancy: parsedLayoutData.success
            ? parsedLayoutData.data.occupancy
            : 100,
          canvasWidth: parsedLayoutData.success
            ? parsedLayoutData.data.canvasWidth
            : 1000,
          canvasHeight: parsedLayoutData.success
            ? parsedLayoutData.data.canvasHeight
            : 700,
          fixtures: parsedLayoutData.success
            ? parsedLayoutData.data.fixtures.map((item) => {
                const { meta, ...rest } = item;
                return {
                  ...rest,
                  meta: meta ?? {},
                };
              })
            : [],
          tableData: parsedLayoutData.success
            ? parsedLayoutData.data.tableData.map((item) => {
                const { other, ...rest } = item;
                return {
                  ...rest,
                  other: other ?? {},
                };
              })
            : [],
          updatedAt:
            roomData.updated_at?.toISOString() ?? new Date().toISOString(),
        };
        importRoom(newRoomData);
      }
      hasExecuted.current = true;
    }
  }, [roomDataSuccess, roomData]);

  const selectedFixture =
    room.fixtures.find((f) => f.id === selectedId) ?? null;
  const selectedTableData =
    room.tableData.find((f) => f.id === selectedId) ?? null;
  const [isMobile, setIsMobile] = useState<boolean>(
    stageSize.width ? stageSize.width < 900 : false,
  );

  const clampScale = useCallback(
    (value: number) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, value)),
    [],
  );

  const getStageSize = useCallback(() => {
    const stage = stageRef.current;
    if (stage) {
      return {
        width: Math.max(1, stage.width()),
        height: Math.max(1, stage.height()),
      };
    }

    return {
      width: Math.max(1, stageSize.width ?? 1000),
      height: Math.max(1, stageSize.height ?? 800),
    };
  }, [stageSize.height, stageSize.width]);

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
    const { width: stageWidth, height: stageHeight } = getStageSize();
    const padding = 48;
    const availableWidth = Math.max(1, stageWidth - padding);
    const availableHeight = Math.max(1, stageHeight - padding);
    const scale = clampScale(
      Math.min(availableWidth / canvasWidth, availableHeight / canvasHeight),
    );
    const setViewportFn = (scale: number, stageWidth: number, canvasWidth: number, stageHeight: number, canvasHeight: number) => {
      setViewport({
        scale,
        x: (stageWidth - canvasWidth * scale) / 2,
        y: (stageHeight - canvasHeight * scale) / 2,
      });
    };
    setViewportFn(scale, stageWidth, canvasWidth, stageHeight, canvasHeight);
  }, [clampScale, getStageSize, room.canvasHeight, room.canvasWidth]);

  const containerRef = useCallback((node: HTMLElement | null) => {
    const updateSize = (node: HTMLElement | null) => {
      console.log("update size");
      if (node) {
        console.log("width", node.clientWidth);
        console.log("height", node.clientHeight);
        setStageSize({
          width: node.clientWidth,
          height: node.clientHeight,
        });
        setIsMobile(node.clientWidth < 900);
        fitViewport();
      }
    };

    if (node !== null) {
      setContainerElement(node);
      updateSize(node);
    }

    window.removeEventListener("resize", () => updateSize(containerElement));
    window.addEventListener("resize", () => updateSize(containerElement));
  }, []);

  // Resize canvas to fill container
  useEffect(() => {
    const el = containerElement;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setStageSize({ width: el.clientWidth, height: el.clientHeight });
    });
    ro.observe(el);
    const setSizeFn = (clientWidth: number, clientHeight: number) => {
      setStageSize({ width: clientWidth, height: clientHeight });
    };
    setSizeFn(el.clientWidth, el.clientHeight);
    return () => ro.disconnect();
  }, [containerElement]);

  useEffect(() => {
    if ((stageSize.width ?? 0) <= 0 || (stageSize.height ?? 0) <= 0) return;
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
          stroke="#9dadd2"
          strokeWidth={1}
        />,
      );
    }
    for (let y = 0; y <= h; y += GRID_SIZE) {
      lines.push(
        <Line
          key={`h${y}`}
          points={[0, y, w, y]}
          stroke="#9dadd2"
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
    [pendingFixture, addFixture, selectFixture],
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

      const stage = stageRef.current;
      if (!stage) return;
      stage.draggable(false);

      const [firstTouch, secondTouch] = Array.from(e.evt.touches);
      const container = stage.container().getBoundingClientRect();
      const center = {
        x: (firstTouch.clientX + secondTouch.clientX) / 2 - container.left,
        y: (firstTouch.clientY + secondTouch.clientY) / 2 - container.top,
      };
      const distance = Math.hypot(
        firstTouch.clientX - secondTouch.clientX,
        firstTouch.clientY - secondTouch.clientY,
      );
      pinchStateRef.current = { lastCenter: center, lastDistance: distance };
    },
    [],
  );

  const handleTouchMove = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      if (e.evt.touches.length !== 2 || !pinchStateRef.current) return;
      e.evt.preventDefault();

      const stage = stageRef.current;
      if (!stage) return;
      if (stage.isDragging()) {
        stage.stopDrag();
      }

      const [firstTouch, secondTouch] = Array.from(e.evt.touches);
      const distance = Math.hypot(
        firstTouch.clientX - secondTouch.clientX,
        firstTouch.clientY - secondTouch.clientY,
      );
      const container = stage.container().getBoundingClientRect();
      if (!container) return;

      const center = {
        x: (firstTouch.clientX + secondTouch.clientX) / 2 - container.left,
        y: (firstTouch.clientY + secondTouch.clientY) / 2 - container.top,
      };

      const scaleBy = distance / pinchStateRef.current.lastDistance;
      const currentScale = stage.scaleX();
      const nextScale = clampScale(currentScale * scaleBy);
      const worldPoint = {
        x: (center.x - stage.x()) / currentScale,
        y: (center.y - stage.y()) / currentScale,
      };
      const centerDelta = {
        x: center.x - pinchStateRef.current.lastCenter.x,
        y: center.y - pinchStateRef.current.lastCenter.y,
      };

      const nextViewport = {
        scale: nextScale,
        x: center.x - worldPoint.x * nextScale + centerDelta.x,
        y: center.y - worldPoint.y * nextScale + centerDelta.y,
      };

      stage.scale({ x: nextViewport.scale, y: nextViewport.scale });
      stage.position({ x: nextViewport.x, y: nextViewport.y });
      stage.batchDraw();

      pinchViewportRef.current = nextViewport;
      if (pinchFrameRef.current === null) {
        pinchFrameRef.current = window.requestAnimationFrame(() => {
          pinchFrameRef.current = null;
          const pendingViewport = pinchViewportRef.current;
          if (pendingViewport) {
            setViewport(pendingViewport);
          }
        });
      }

      pinchStateRef.current = { lastCenter: center, lastDistance: distance };
    },
    [clampScale],
  );

  const handleTouchEnd = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      if (e.evt.touches.length < 2) {
        pinchStateRef.current = null;
        const stage = stageRef.current;
        if (stage) {
          stage.draggable(true);
          setViewport({
            scale: stage.scaleX(),
            x: stage.x(),
            y: stage.y(),
          });
        }
      }
    },
    [],
  );

  const handleTouchCancel = useCallback(() => {
    pinchStateRef.current = null;
    const stage = stageRef.current;
    if (stage) {
      stage.draggable(true);
      setViewport({
        scale: stage.scaleX(),
        x: stage.x(),
        y: stage.y(),
      });
    }
    if (pinchFrameRef.current !== null) {
      window.cancelAnimationFrame(pinchFrameRef.current);
      pinchFrameRef.current = null;
    }
  }, []);

  const handleCanvasDragMove = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    setViewport((current) => {
      const nextViewport = { ...current, x: stage.x(), y: stage.y() };
      return nextViewport;
    });
  }, []);

  const handleZoomIn = () => {
    const { width, height } = getStageSize();
    zoomToPoint({ x: width / 2, y: height / 2 }, viewport.scale * 1.2);
  };

  const handleZoomOut = () => {
    const { width, height } = getStageSize();
    zoomToPoint({ x: width / 2, y: height / 2 }, viewport.scale / 1.2);
  };

  const handleToolbarAdd = (type: FixtureType) => {
    if (props.mode !== "edit") return;
    setPendingFixture(type);
  };

  // const handleToggleMode = (newMode: "map" | "table" | "view") => {
  //   const oldMode = mode;
  //   setMode(newMode);
  //   if (newMode != oldMode) {
  //     setPendingFixture(null);
  //     selectFixture(null);
  //   }
  // };

  const saveDataToServer = async () => {
    setLoadingSave(true);
    try {
      const roomData = exportRoom();
      const { id, name, updatedAt, ...submitData } = roomData;
      console.log(JSON.stringify(submitData));
      console.log("id: ", id);

      const response = await client.org.updateRoomLayout({
        id,
        label: name,
        layout_data: JSON.stringify(submitData),
        organization_id: orgId,
      });
      if (!response) {
        toast.error("Error saving room data.");
      } else {
        setRoomUpdatedAt(new Date().toISOString());
        toast.success("Room data saved.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error saving room data.");
    } finally {
      setLoadingSave(false);
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
    <div className="flex h-full flex-col overflow-hidden">
      {/* <HeaderBar
        roomName={room.name}
        onNameChange={setRoomName}
        onExport={handleExport}
        onImport={importRoom}
        mode={mode}
        onToggleMode={handleToggleMode}
      /> */}
      {roomDataLoading ? (
        <div className="flex flex-col w-screen max-w-screen items-center py-16 pb-24 pt-24 h-full">
          <div className="flex flex-col w-full gap-4 max-w-md px-8">
            <div className="flex flex-col max-w-full gap-4">Loading...</div>
          </div>
        </div>
      ) : !roomData ? (
        <div className="flex flex-col w-screen max-w-screen items-center py-16 pb-24 pt-24 h-full">
          <div className="flex flex-col w-full gap-4 max-w-md px-8">
            <div className="flex flex-col max-w-full gap-4">
              <p>Room layout not found.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full h-full">
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden">
            {props.mode === "edit" && (
              <Toolbar onAdd={handleToolbarAdd} isMobile={isMobile} />
            )}

            {/* Canvas */}
            <div
              ref={containerRef}
              className="relative flex-1 lg:min-h-0 overflow-hidden touch-none"
              style={{
                cursor: pendingFixture ? "crosshair" : "default",
              }}
            >
              <div
                className={`absolute right-3 md:top-3 top-16 z-20 flex items-center gap-2 rounded-full border px-2 py-1 backdrop-blur drop-shadow-lg`}
              >
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="canvas-control-btn"
                  aria-label="Zoom out"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={fitViewport}
                  className="canvas-control-btn text-sm"
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
                <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full border backdrop-blur px-3 py-1.5 text-xs font-medium pointer-events-none">
                  Tap to place - drag to pan - pinch to zoom
                </div>
              )}
              {stageSize.width && stageSize.height ? (
                <Stage
                  ref={stageRef}
                  width={stageSize.width ?? 1000}
                  height={stageSize.height ?? 800}
                  onClick={handleStageClick}
                  onWheel={handleWheel}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchCancel}
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
                          props.mode === "view"
                            ? fixture.type.startsWith("table") &&
                              room.tableData.find((t) => t.id === fixture.id)
                                ?.open
                            : true
                        }
                        isEditable={props.mode === "edit"}
                        onSelect={() => {
                          selectFixture(fixture.id);
                        }}
                        onChange={(changes) =>
                          updateFixture(fixture.id, changes)
                        }
                        tableActiveColor={
                          props.mode !== "edit" &&
                          fixture.type.startsWith("table")
                            ? room.tableData.find((t) => t.id === fixture.id)
                                ?.open
                              ? undefined
                              : "#8a9bb0"
                            : undefined
                        }
                      />
                    ))}
                  </Layer>
                </Stage>
              ) : (
                <div className="flex flex-col w-full h-full items-center justify-center gap-4">
                  <p>Loading map...</p>
                </div>
              )}
            </div>

            {props.mode === "edit" && (
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
                onSaveData={saveDataToServer}
                loadingSave={loadingSave}
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

            {props.mode === "view" && (
              <ViewPropertiesPanel
                fixture={selectedFixture}
                tableData={selectedTableData}
                isMobile={isMobile}
              />
            )}
          </div>

          {/* Status bar */}
          {props.mode == "edit" && (
            <div className="h-6  border-t  flex items-center px-4 gap-4">
              <span className="text-[10px] text-[#3a4a60]">
                {room.fixtures.length} fixture
                {room.fixtures.length !== 1 ? "s" : ""}
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
          )}

          {/* Esc cancels placement */}
          {pendingFixture && (
            <EscListener onEsc={() => setPendingFixture(null)} />
          )}
        </div>
      )}
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
