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
                  {organization.custom_message_visible && (
                    <div>
                      <p>{organization.custom_message}</p>
                    </div>
                  )}
                </div>
                {organization.layouts_disabled ? (
                  !organization.custom_message_visible && (
                    <div className="mt-2">
                      <p>This location has disabled layout views.</p>
                    </div>
                  )
                ) : (
                  <div>
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
                        {organization.periods
                          .sort((p1, p2) =>
                            p1.start_time.localeCompare(p2.start_time),
                          )
                          .map((period) => (
                            <Item key={period.id} variant="outline">
                              <ItemActions>
                                <Checkbox
                                  checked={selectedPeriod == period.id}
                                  onCheckedChange={() => {
                                    setSelectedPeriod(
                                      selectedPeriod === period.id
                                        ? null
                                        : period.id,
                                    );
                                  }}
                                ></Checkbox>
                              </ItemActions>
                              <ItemContent>
                                <ItemTitle>{period.label}</ItemTitle>
                                <ItemDescription>
                                  {period.start_time
                                    .split(":")
                                    .slice(0, 2)
                                    .join(":")}{" "}
                                  -{" "}
                                  {period.end_time
                                    .split(":")
                                    .slice(0, 2)
                                    .join(":")}
                                </ItemDescription>
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
                    {selectedPeriod &&
                      selectedRoom &&
                      organization.room_layouts.filter(
                        (layout) =>
                          layout.time_period_id === selectedPeriod &&
                          layout.room_id === selectedRoom &&
                          layout.approved_at !== null,
                      ).length === 0 && (
                        <p className="text-sm text-muted-foreground mt-4">
                          No published layout found for the selected room and
                          period.
                        </p>
                      )}
                    <Button
                      disabled={
                        !selectedRoom ||
                        !selectedPeriod ||
                        loadingViewRoom ||
                        organization.room_layouts.filter(
                          (layout) =>
                            layout.time_period_id === selectedPeriod &&
                            layout.room_id === selectedRoom &&
                            layout.approved_at !== null,
                        ).length === 0
                      }
                      className="mt-6 gap-2"
                      onClick={() => {
                        setLoadingViewRoom(true);
                        if (selectedRoom && selectedPeriod) {
                          const sortedLayouts = organization.room_layouts
                            .filter(
                              (layout) =>
                                layout.time_period_id === selectedPeriod &&
                                layout.room_id === selectedRoom &&
                                layout.approved_at !== null,
                            )
                            .sort((a, b) => {
                              if (a.approved_at && b.approved_at) {
                                return (
                                  b.approved_at.getTime() -
                                  a.approved_at.getTime()
                                );
                              }
                              return 0;
                            });
                          const latestLayout = sortedLayouts[0];
                          router.push(
                            `/location/${organization.id}/layout/${latestLayout.id}/view`,
                          );
                        }
                      }}
                    >
                      {loadingViewRoom && <Spinner />}
                      View Room
                    </Button>
                  </div>
                )}
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
