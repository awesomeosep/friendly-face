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
import { LaughIcon, SmileIcon, UserRound } from "lucide-react";

export default function NavigationMenuDemo() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    const syncAuthState = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (isMounted) {
        setLoggedIn(Boolean(user));
      }
    };

    void syncAuthState();

    const authListener = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) {
          return;
        }

        if (event === "SIGNED_OUT") {
          setLoggedIn(false);
          return;
        }

        setLoggedIn(Boolean(session?.user));
      },
    );

    return () => {
      isMounted = false;
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="pointer-events-none absolute z-5 w-full flex items-start justify-center-safe drop-shadow-lg min-h-24 px-4 overflow-y-hidden">
      <Menubar className="pointer-events-auto mt-4 bg-white absolute z-7 overflow-x-auto max-w-full mx-4 overflow-y-hidden">
        <MenubarMenu>
          <MenubarTrigger onClick={() => router.push("/")}>
            <div className="flex flex-row items-center">
              <LaughIcon className="mr-2" />
              <p>FriendlyFace</p>
            </div>
          </MenubarTrigger>
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
        {loggedIn === null ? null : loggedIn ? (
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
              <MenubarItem
                onClick={() => {
                  supabaseClient.auth.signOut();
                  router.push("/login");
                }}
              >
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
