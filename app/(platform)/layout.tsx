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
      <div className="flex flex-col w-screen min-h-full overflow-y-auto overflow-x-hidden">
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </div>
    </div>
  );
}
