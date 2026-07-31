"use client";

import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";
import { supabaseClient } from "@/lib/auth-client";
import { orpc } from "@/lib/orpc";
import { ORPCError } from "@orpc/client";
import { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { PencilIcon, SettingsIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const response = await supabaseClient.auth.getUser();
      setUser(response.data.user);
    };

    fetchUser();
  }, []);
  const { isPending: orgsLoading, data: organizations } = useQuery(
    orpc.org.findMany.queryOptions({
      staleTime: Infinity,
      cacheTime: Infinity,
      input: null,
      onError: (error: ORPCError<string, unknown>) => {
        console.error("Error fetching organization:", error);
      },
    }),
  );

  return (
    <div className="flex flex-col w-screen max-w-screen items-center py-16 pb-24 pt-24">
      <div className="flex flex-col w-full gap-4 max-w-md px-8">
        {!user && (
          <div>
            <p>Unauthorized.</p>
          </div>
        )}
        {user && (
          <div className="flex flex-col max-w-full gap-4">
            <div className="flex flex-row gap-4">
              <h1 className="text-3xl">Dashboard</h1>
            </div>
            {orgsLoading && <p>Loading...</p>}
            {!orgsLoading && (
              <div>
                <p className="mb-2">Your organizations:</p>
                {!organizations || organizations.length === 0 ? (
                  <p>No organizations found.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {organizations?.map((org) => (
                      <Item key={org.id} variant="outline">
                        <ItemContent>
                          <ItemTitle>{org.name}</ItemTitle>
                        </ItemContent>
                        <ItemActions>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              router.push(`/location/${org.id}/edit`);
                            }}
                          >
                            <PencilIcon />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              router.push(`/location/${org.id}/settings`);
                            }}
                          >
                            <SettingsIcon />
                          </Button>
                        </ItemActions>
                      </Item>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
