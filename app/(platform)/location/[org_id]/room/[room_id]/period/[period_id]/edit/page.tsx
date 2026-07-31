"use client";

import dynamic from "next/dynamic";

const RoomEditor = dynamic(() => import("../../../../../../../../components/RoomEditor/RoomEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <p className="text-sm uppercase">
        Loading editor...
      </p>
    </div>
  ),
});

export default function EditorPage() {
  return <RoomEditor mode="edit" />;
}