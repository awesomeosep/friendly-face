// TODO: view basic details of org, like name; select room & period to view layout

"use client";

import { orpc } from "@/lib/orpc";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ORPCError } from "@orpc/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";

type ParamsType = {
  org_id: string;
};

export default function ViewOrgPage() {
  const orgId = parseInt(useParams<ParamsType>().org_id);
  const router = useRouter();
  const { isPending: orgLoading, data: organization } = useQuery(
    orpc.org.findById.queryOptions({
      staleTime: Infinity,
      cacheTime: Infinity,
      input: { id: orgId },
      retry: 2,
      refetchOnWindowFocus: false,
      onError: (error: ORPCError<string, unknown>) => {
        console.error("Error fetching organization:", error);
      },
    }),
  );

  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [loadingViewRoom, setLoadingViewRoom] = useState(false);

  return (
    <div className="flex flex-col w-screen max-w-screen items-center py-16 pt-24">
      <div className="flex flex-col w-full gap-4 max-w-md px-8">
        <div className="flex flex-col max-w-full">
          {!orgLoading ? (
            organization ? (
              <div>
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-heading">{organization.name}</h1>
                  <p>Code: {organization.code}</p>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <p>Select a room:</p>
                  <div className="flex flex-col gap-4">
                    {organization.rooms.map((room) => (
                      <Item key={room.id} variant="outline">
                        <ItemActions>
                          <Checkbox
                            checked={selectedRoom == room.id}
                            onCheckedChange={() => {
                              setSelectedRoom(
                                selectedRoom === room.id ? null : room.id,
                              );
                            }}
                          ></Checkbox>
                        </ItemActions>
                        <ItemContent>
                          <ItemTitle>{room.label}</ItemTitle>
                        </ItemContent>
                      </Item>
                      // <Card key={room.id} className="py-4">
                      //   <div className="flex flex-row gap-4 px-4 items-center">
                      //     <Checkbox
                      //       checked={selectedRoom == room.id}
                      //       onCheckedChange={() => {
                      //         setSelectedRoom(
                      //           selectedRoom === room.id ? null : room.id,
                      //         );
                      //       }}
                      //     />
                      //     <span>{room.label}</span>
                      //   </div>
                      // </Card>
                      // <div key={room.id} className="flex flex-col gap-2">
                      //   <h2 className="text-xl text-rose-500 dark:text-rose-400 font-heading">
                      //     Room: {room.label}
                      //   </h2>
                      //   <div className="flex flex-row gap-2">
                      //     {organization.periods.map((period) => (
                      //       <button
                      //         key={period.id}
                      //         className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-1 px-2 rounded"
                      //         onClick={() => {
                      //           router.push(
                      //             `/location/${organization.id}/view/room/${room.id}?periodId=${period.id}`,
                      //           );
                      //         }}
                      //       >
                      //         {period.label}
                      //       </button>
                      //     ))}
                      //   </div>
                      // </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-2">
                  <p>Select a period:</p>
                  <div className="flex flex-col gap-4">
                    {organization.periods.map((period) => (
                      <Item key={period.id} variant="outline">
                        <ItemActions>
                          <Checkbox
                            checked={selectedPeriod == period.id}
                            onCheckedChange={() => {
                              setSelectedPeriod(
                                selectedPeriod === period.id ? null : period.id,
                              );
                            }}
                          ></Checkbox>
                        </ItemActions>
                        <ItemContent>
                          <ItemTitle>{period.label}</ItemTitle>
                          <ItemDescription>{period.start_time.split(":").slice(0, 2).join(":")} - {period.end_time.split(":").slice(0, 2).join(":")}</ItemDescription>
                        </ItemContent>
                      </Item>
                    ))}
                    {/* <Card key={period.id} className="py-4">
                        <div className="flex flex-row gap-4 px-4 items-center">
                          <Checkbox
                            checked={selectedPeriod == period.id}
                            onCheckedChange={() => {
                              setSelectedPeriod(
                                selectedPeriod === period.id ? null : period.id,
                              );
                            }}
                          />
                          <span>{period.label}</span>
                        </div>
                      </Card> */}
                  </div>
                </div>
                <Button
                  disabled={!selectedRoom || !selectedPeriod || loadingViewRoom}
                  className="mt-6 gap-2"
                  onClick={() => {
                    setLoadingViewRoom(true);
                    if (selectedRoom && selectedPeriod) {
                      router.push(
                        `/location/${organization.id}/room/${selectedRoom}/period/${selectedPeriod}/view`,
                      );
                    }
                  }}
                >
                  {loadingViewRoom && <Spinner />}
                  View Room
                </Button>
              </div>
            ) : (
              <p>Organization not found</p>
            )
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}
