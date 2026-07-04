// TODO: view basic details of org, like name; select room & period to view layout

"use client";

import { orpc } from "@/lib/orpc";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ORPCError } from "@orpc/client";

type ParamsType = {
  org_id: string;
};

export default function ViewOrgPage() {
  const orgId = parseInt(useParams<ParamsType>().org_id);
  console.log("orgId: ", orgId);
  const router = useRouter();
  const { isPending: orgLoading, data: organization } = useQuery(
    orpc.org.findById.queryOptions({
      staleTime: Infinity,
      cacheTime: Infinity,
      input: { id: orgId },
      onError: (error: ORPCError<string, unknown>) => {
        console.error("Error fetching organization:", error);
      },
    }),
  );

  return (
    <div className="flex flex-col w-screen items-center pt-30 pb-10">
      <div className="flex flex-col min-w-md max-w-md gap-4 px-8">
        {!orgLoading ? (
          organization ? (
            <div>
              <div className="flex flex-col gap-4">
                <h1 className="text-3xl text-rose-500 dark:text-rose-400 font-heading">
                  {organization.name}
                </h1>
                <p>Code: {organization.code}</p>
              </div>
              <div className="mt-6 flex flex-col gap-4">
                <p>Select a room and period:</p>
                <div className="flex flex-col gap-2">
                  {organization.rooms.map((room) => (
                    <div key={room.id} className="flex flex-col gap-2">
                      <h2 className="text-xl text-rose-500 dark:text-rose-400 font-heading">
                        Room: {room.label}
                      </h2>
                      <div className="flex flex-row gap-2">
                        {organization.periods.map((period) => (
                          <button
                            key={period.id}
                            className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-1 px-2 rounded"
                            onClick={() => {
                              router.push(
                                `/org/${organization.id}/view/room/${room.id}?periodId=${period.id}`,
                              );
                            }}
                          >
                            {period.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p>Organization not found</p>
          )
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}
