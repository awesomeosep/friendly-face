"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col w-screen items-center pt-30 pb-10">
      <div className="flex flex-col min-w-md max-w-md gap-4 px-8">
        <div className="flex flex-row gap-4">
          <h1 className="text-3xl text-rose-500 dark:text-rose-400 font-heading">
            Welcome to Open Lunch
          </h1>
        </div>
        <p>{"Making lunch what it should be—the best period of the day."}</p>
        <button
          type="button"
          className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            console.log("Find an Organization button clicked");
            router.push("/org/find");
          }}
        >
          Find an Organization
        </button>
      </div>
    </div>
  );
}
