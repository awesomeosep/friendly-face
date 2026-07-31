"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { supabaseClient } from "@/lib/auth-client";
import { UserRound } from "lucide-react";

export default function NavigationMenuDemo() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const authListener = supabaseClient.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        setLoggedIn(true);
      } else if (event === "SIGNED_OUT") {
        setLoggedIn(false);
      }
    });
    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="absolute pt-4 z-5 w-full flex items-center justify-center drop-shadow-lg">
      <Menubar className="mt-6 bg-white max-w-full absolute z-5">
        <MenubarMenu>
          <MenubarTrigger onClick={() => router.push("/")}>Home</MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger onClick={() => router.push("/about")}>
            About
          </MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger onClick={() => router.push("/location/find")}>
            Find Location
          </MenubarTrigger>
        </MenubarMenu>
        {loggedIn ? (
          <MenubarMenu>
            <MenubarTrigger>
              <UserRound />
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => router.push("/dashboard")}>
                Dashboard
              </MenubarItem>
              <MenubarItem onClick={() => router.push("/account")}>
                Account
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={() => {
                supabaseClient.auth.signOut();
                router.push("/login");
              }}>
                Logout
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        ) : (
          <MenubarMenu>
            <MenubarTrigger onClick={() => router.push("/login")}>
              Login
            </MenubarTrigger>
          </MenubarMenu>
        )}
      </Menubar>
    </div>
  );
}
