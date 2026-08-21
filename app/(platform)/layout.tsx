"use client";

import NavBar from "@/components/NavBar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-dvh w-screen flex flex-col z-0 relative overflow-hidden">
      <NavBar></NavBar>
      <div className="flex flex-col w-screen min-h-full max-h-full max-h-screen">
        <div className="flex flex-col h-full max-h-full overflow-y-auto overflow-x-hidden">
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </div>
        <div className="border-t border-black h-fit p-2 flex flex-row border-black">
          <p className="text-xs text-muted-foreground">
            Friendly Face is currently being piloted. Exercise judgement when finding a table. If you encounter issues or
            any form of unacceptable behavior, report to your school counselor
            or administrators.
          </p>
        </div>
      </div>
    </div>
  );
}
