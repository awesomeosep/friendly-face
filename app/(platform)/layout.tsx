"use client"

import { NavBar } from "@/components/NavBar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen h-full w-screen flex flex-col overflow-y-auto">
      <NavBar></NavBar>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </div>
  );
}
