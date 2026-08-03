"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col w-screen max-w-screen items-center py-16 pb-24 pt-24">
      <div className="flex flex-col w-full gap-4 max-w-md px-8">
        <div className="flex flex-col max-w-full gap-4">
          <div className="flex flex-row gap-4">
            <h1 className="text-3xl font-heading">Welcome to FriendlyFace</h1>
          </div>
          <p>{"Making lunch what it should be, for everyone—the best period of the day."}</p>
          <Button
            onClick={() => {
              router.push("/location/find");
            }}
          >
            Find a Location
          </Button>
        </div>
      </div>
    </div>
  );
}
