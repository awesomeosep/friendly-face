"use client"

import { useRouter } from "next/navigation";

export function NavBar() {
  const router = useRouter();

  return (
    <div className="h-[48px] w-full border-b-[2px] border-gray-500 flex flex-row items-center justify-between px-4">
      <p>Open Lunch</p>
      <div className="flex flex-row gap-4">
        <button
          className="text-black hover:text-rose-500"
          onClick={() => {
            router.push("/org/find");
          }}
        >
          Find Location
        </button>
        <button
          className="text-black hover:text-rose-500"
          onClick={() => {
            router.push("/login");
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}