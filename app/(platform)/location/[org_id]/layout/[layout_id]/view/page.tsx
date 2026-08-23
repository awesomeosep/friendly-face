"use client";

import dynamic from "next/dynamic";

const RoomEditor = dynamic(
  () => import("../../../../../../components/RoomEditor/RoomEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col w-screen max-w-screen items-center py-16 pb-24 pt-24 h-full">
        <div className="flex flex-col w-full gap-4 max-w-md px-8">
          <div className="flex flex-col max-w-full gap-4">Loading...</div>
        </div>
      </div>
    ),
  },
);

export default function EditorPage() {
  return <RoomEditor mode="view" />;
}
