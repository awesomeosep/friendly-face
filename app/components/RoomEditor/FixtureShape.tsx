"use client";

import React, { useRef, useEffect } from "react";
import { Rect, Circle, Text, Group, Transformer, Ellipse } from "react-konva";
import Konva from "konva";
import { Fixture, FIXTURE_COLORS } from "./types";

interface Props {
  fixture: Fixture;
  isSelected: boolean;
  isSelectable?: boolean;
  isEditable?: boolean;
  onSelect: () => void;
  onChange: (changes: Partial<Fixture>) => void;
  tableActiveColor?: string;
}

export default function FixtureShape({
  fixture,
  isSelected,
  isSelectable = true,
  isEditable = true,
  onSelect,
  onChange,
  tableActiveColor,
}: Props) {
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const color = tableActiveColor || FIXTURE_COLORS[fixture.type];
  const isLabel = fixture.type === "label";

  useEffect(() => {
    if (
      isSelectable &&
      isSelected &&
      transformerRef.current &&
      groupRef.current
    ) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.forceUpdate();
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [
    isSelectable,
    isSelected,
    fixture.x,
    fixture.y,
    fixture.width,
    fixture.height,
    fixture.rotation,
  ]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({ x: e.target.x(), y: e.target.y() });
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    onChange({
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      width: Math.max(20, fixture.width * scaleX),
      height: Math.max(20, fixture.height * scaleY),
    });
  };

  const renderShape = () => {
    if (fixture.type === "table_round") {
      const rX = fixture.width / 2;
      const rY = fixture.height / 2;
      return (
        <>
          <Ellipse
            x={rX}
            y={rY}
            radiusX={rX}
            radiusY={rY}
            fill={color + "22"}
            stroke={color}
            strokeWidth={2}
          />
          <Text
            x={0}
            y={rY - 8}
            width={fixture.width}
            text={fixture.label}
            fontSize={12}
            fill="#000000"
            align="center"
          />
        </>
      );
    }

    if (isLabel) {
      return (
        <Text
          x={0}
          y={0}
          width={fixture.width}
          text={fixture.label}
          fontSize={14}
          fontStyle="bold"
          fill="#000000"
          align="center"
        />
      );
    }

    // door, wall, counter, table_rect -- all use Rect
    return (
      <>
        <Rect
          width={fixture.width}
          height={fixture.height}
          fill={color + "22"}
          stroke={color}
          strokeWidth={fixture.type === "wall" ? 3 : 2}
          cornerRadius={fixture.type === "counter" ? 4 : 0}
          dash={fixture.type === "door" ? [8, 4] : undefined}
        />
        {fixture.type !== "wall" && (
          <Text
            x={0}
            y={fixture.height / 2 - 7}
            width={fixture.width}
            text={fixture.label}
            fontSize={12}
            fill="#000000"
            align="center"
          />
        )}
      </>
    );
  };


  return (
    <>
      <Group
        ref={groupRef}
        x={fixture.x}
        y={fixture.y}
        rotation={fixture.rotation}
        draggable={isEditable}
        onClick={isSelectable ? onSelect : undefined}
        onTap={isSelectable ? onSelect : undefined}
        onDragEnd={isEditable ? handleDragEnd : undefined}
        onTransformEnd={isEditable ? handleTransformEnd : undefined}
      >
        {renderShape()}
      </Group>

      {isEditable && isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled
          keepRatio={fixture.type === "table_round"}
          boundBoxFunc={(oldBox, newBox) =>
            newBox.width < 20 || newBox.height < 20 ? oldBox : newBox
          }
        />
      )}

      {isSelectable && !isEditable && isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            return oldBox;
          }}
          enabledAnchors={[]}
          borderDash={[5, 5]}
          ignoreStroke={true}
        />
      )}
    </>
  );
}
