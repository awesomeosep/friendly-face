// TODO: edit room layout

"use client";

import dynamic from "next/dynamic";

const RoomEditor = dynamic(() => import("../../../../../../../../components/RoomEditor/RoomEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-[#0f1117] text-[#4a9eff]">
      <span className="text-sm tracking-widest uppercase opacity-60">
        Loading editor...
      </span>
    </div>
  ),
});

export default function EditorPage() {
  return <RoomEditor />;
}