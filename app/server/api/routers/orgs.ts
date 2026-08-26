import { db } from "@/server/db";
import { ORPCError, os } from "@orpc/server";
import { type Context } from "../../context";
import {
  LayoutDataSchema,
  OrgRoleSchema,
  OrgSchema,
  PeriodSchema,
  RoomLayoutSchema,
  RoomSchema,
} from "@/lib/schema";
import {
  organizationTable,
  orgRoleTable,
  periodTable,
  roomLayoutTable,
  roomTable,
} from "@/server/db/schema";
import { and, eq, or } from "drizzle-orm";
import { z } from "zod";
import { headers } from "next/headers";

export const base = os.$context<Context>();

export const authed = base.use(async ({ context, next }) => {
  if (!context.user) {
    throw new ORPCError("UNAUTHORIZED");
  }

  return next({
    context: {
      user: context.user, // Forces user context to be strictly non-null
    },
  });
});

export const locationAdmin = os
  .$context<Context & { user: NonNullable<Context["user"]> }>()
  .middleware(async ({ context, next }, organization_id: number) => {
    // console.log("location admin check");
    const records = await context.db
      .select()
      .from(orgRoleTable)
      .where(
        and(
          eq(orgRoleTable.organization_id, organization_id),
          eq(orgRoleTable.admin_id, context.user.id),
        ),
      );

    if (records.length === 0) throw new ORPCError("FORBIDDEN");

    return next({ context: { records } });
  });

export const locationApprover = os
  .$context<Context & { user: NonNullable<Context["user"]> }>()
  .middleware(async ({ context, next }, organization_id: number) => {
    // console.log("location admin check");
    const [record] = await context.db
      .select()
      .from(orgRoleTable)
      .where(
        and(
          eq(orgRoleTable.organization_id, organization_id),
          eq(orgRoleTable.admin_id, context.user.id),
          eq(orgRoleTable.role, "approver"),
        ),
      );

    if (!record) throw new ORPCError("FORBIDDEN");
    if (record.admin_id !== context.user.id) throw new ORPCError("FORBIDDEN");

    return next({ context: { record } });
  });

export const locationEditor = os
  .$context<Context & { user: NonNullable<Context["user"]> }>()
  .middleware(async ({ context, next }, organization_id: number) => {
    // console.log("location admin check");
    const [record] = await context.db
      .select()
      .from(orgRoleTable)
      .where(
        and(
          eq(orgRoleTable.organization_id, organization_id),
          eq(orgRoleTable.admin_id, context.user.id),
          or(
            eq(orgRoleTable.role, "editor"),
            eq(orgRoleTable.role, "approver"),
          ),
        ),
      );

    if (!record) throw new ORPCError("FORBIDDEN");
    if (record.admin_id !== context.user.id) throw new ORPCError("FORBIDDEN");

    return next({ context: { record } });
  });

export const isLocationVisibleById = os
  .$context<Context>()
  .middleware(async ({ context, next }, organization_id: number) => {
    // console.log("location visible check");
    const [location] = await context.db
      .select()
      .from(organizationTable)
      .where(eq(organizationTable.id, organization_id));

    if (!location) throw new ORPCError("NOT_FOUND");
    if (location.is_hidden && location.admin_id !== context.user?.id)
      throw new ORPCError("NOT_FOUND");
    // console.log("location: ", location);
    return next({ context: { location } });
  });

export const isLocationVisibleByCode = os
  .$context<Context>()
  .middleware(async ({ context, next }, organization_code: string) => {
    console.log("location visible check");
    const [location] = await context.db
      .select()
      .from(organizationTable)
      .where(eq(organizationTable.code, organization_code));

    if (!location) throw new ORPCError("NOT_FOUND");
    if (location.is_hidden && location.admin_id !== context.user?.id)
      throw new ORPCError("NOT_FOUND");
    console.log("location: ", location);
    return next({ context: { location } });
  });

export const roomInLocation = os
  .$context<Context & { user: NonNullable<Context["user"]> }>()
  .middleware(
    async (
      { context, next },
      data_input: { room_id: number; organization_id: number },
    ) => {
      // console.log(
      //   "room in location check",
      //   data_input.room_id,
      //   data_input.organization_id,
      // );
      const [room] = await context.db
        .select()
        .from(roomTable)
        .where(
          and(
            eq(roomTable.id, data_input.room_id),
            eq(roomTable.organization_id, data_input.organization_id),
          ),
        );

      if (!room) throw new ORPCError("NOT_FOUND");

      return next({ context: { room } });
    },
  );

export const periodInLocation = os
  .$context<Context & { user: NonNullable<Context["user"]> }>()
  .middleware(
    async (
      { context, next },
      data_input: { period_id: number; organization_id: number },
    ) => {
      const [period] = await context.db
        .select()
        .from(periodTable)
        .where(
          and(
            eq(periodTable.id, data_input.period_id),
            eq(periodTable.organization_id, data_input.organization_id),
          ),
        );

      if (!period) throw new ORPCError("NOT_FOUND");

      return next({ context: { period } });
    },
  );

export const roomLayoutInLocation = os
  .$context<Context & { user: NonNullable<Context["user"]> }>()
  .middleware(
    async (
      { context, next },
      data_input: { room_layout_id: number; organization_id: number },
    ) => {
      // console.log(
      //   "room layout in location check",
      //   data_input.room_layout_id,
      //   data_input.organization_id,
      // );
      const [roomLayout] = await context.db
        .select()
        .from(roomLayoutTable)
        .where(
          and(
            eq(roomLayoutTable.id, data_input.room_layout_id),
            eq(roomLayoutTable.organization_id, data_input.organization_id),
          ),
        );

      if (!roomLayout) throw new ORPCError("NOT_FOUND");

      return next({ context: { roomLayout } });
    },
  );

const FindRoomLayoutInputSchema = z.object({
  org_id: z.string(),
  room_id: z.string(),
  period_id: z.string(),
});

export const orgRouter = {
  findByCode: base
    .input(OrgSchema.pick({ code: true }))
    .use(isLocationVisibleByCode, (input) => input.code)
    .handler(async ({ input }) => {
      try {
        console.log(input.code);
        const org = await db.query.organizationTable.findFirst({
          where: eq(organizationTable.code, input.code),
          with: {
            rooms: true,
            periods: true,
            room_layouts: true,
          },
        });
        console.log(org);
        return org || null;
      } catch (error) {
        console.error("Error fetching organization by code: ", error);
        throw new Error("Error finding for organization.");
      }
    }),
  findById: base
    .input(OrgSchema.pick({ id: true }))
    .use(isLocationVisibleById, (input) => input.id)
    .handler(async ({ input }) => {
      console.log("find by id start");
      const org = await db.query.organizationTable.findFirst({
        where: eq(organizationTable.id, input.id),
        with: {
          rooms: true,
          periods: true,
          room_layouts: true,
        },
      });
      console.log("find by id", org);
      console.log("find by id end");
      // console.log(org)
      return org || null;
    }),
  findMany: authed.handler(async ({ context }) => {
    const user = context.user ? context.user : null;
    if (!user) {
      throw new Error("UNAUTHORIZED: Sign-in required.");
    }
    const orgs = await db.query.organizationTable.findMany({
      where: eq(organizationTable.admin_id, user.id),
      with: {
        rooms: true,
        periods: true,
        room_layouts: true,
      },
    });
    console.log("orgs: ", orgs);
    return orgs || [];
  }),
  updateLayoutLabel: authed
    .input(
      RoomLayoutSchema.pick({
        room_id: true,
        time_period_id: true,
        label: true,
        organization_id: true,
      }),
    )
    .use(locationEditor, (input) => input.organization_id)
    .handler(async ({ input }) => {
      // console.log(input.layout_data);
      try {
        const updatedInput = {
          label: input.label,
        };
        const roomLayout = await db
          .update(roomLayoutTable)
          .set(updatedInput)
          .where(
            and(
              eq(roomLayoutTable.organization_id, input.organization_id),
              eq(roomLayoutTable.room_id, input.room_id),
              eq(roomLayoutTable.time_period_id, input.time_period_id),
            ),
          )
          .returning();
        return roomLayout || null;
      } catch (error) {
        console.error("Error updating room layout: ", error);
        throw new Error("Failed to update room layout. Please try again.");
      }
    }),
  // updateRoomLayout: authed
  //   .input(
  //     RoomLayoutSchema.pick({
  //       id: true,
  //       label: true,
  //       layout_data: true,
  //       organization_id: true,
  //     }).extend({
  //       layout_data: z.string().optional(),
  //     }),
  //   )
  //   .use(locationAdmin, (input) => input.organization_id)
  //   .handler(async ({ input }) => {
  //     // console.log(input.layout_data);
  //     try {
  //       const updatedInput = {
  //         id: input.id,
  //         label: input.label,
  //         layout_data: JSON.parse(input.layout_data?.toString() || "{}"),
  //         updated_at: new Date(),
  //       };
  //       // console.log("updatedInput: ", updatedInput);
  //       const roomLayout = await db
  //         .update(roomLayoutTable)
  //         .set(updatedInput)
  //         .where(
  //           and(
  //             eq(roomLayoutTable.organization_id, input.organization_id),
  //             eq(roomLayoutTable.id, input.id),
  //           ),
  //         )
  //         .returning();
  //       return roomLayout || null;
  //     } catch (error) {
  //       console.error("Error updating room layout: ", error);
  //       throw new Error("Failed to update room layout. Please try again.");
  //     }
  //   }),
  approveRoomLayout: authed
    .input(
      RoomLayoutSchema.pick({
        id: true,
        organization_id: true,
      }),
    )
    .use(locationApprover, (input) => input.organization_id)
    .handler(async ({ input, context }) => {
      // console.log(input.layout_data);
      try {
        const headersList = await headers();
        const clientIp = headersList.get("x-client-ip") || "Unknown";
        console.log(clientIp);
        const updatedInput = {
          approved_at: new Date(),
          approved_by: context.user?.id || null,
          approved_by_ip: clientIp,
        };
        const roomLayout = await db
          .update(roomLayoutTable)
          .set(updatedInput)
          .where(
            and(
              eq(roomLayoutTable.organization_id, input.organization_id),
              eq(roomLayoutTable.id, input.id),
            ),
          )
          .returning();
        return roomLayout || null;
      } catch (error) {
        console.error("Error updating room layout: ", error);
        throw new Error("Failed to update room layout. Please try again.");
      }
    }),
  upsertDraftRoomLayout: authed
    .input(
      RoomLayoutSchema.pick({
        // id: true,
        label: true,
        layout_data: true,
        organization_id: true,
        time_period_id: true,
        room_id: true,
      }).extend({
        layout_data: z.string().optional(),
      }),
    )
    .use(locationEditor, (input) => input.organization_id)
    .handler(async ({ context, input }) => {
      // console.log(input.layout_data);
      const user = context.user ? context.user : null;
      const headersList = await headers();
      const clientIp = headersList.get("x-client-ip") || "Unknown";
      console.log(clientIp);
      try {
        const existingRecords = await db.query.roomLayoutTable.findMany({
          where: and(
            eq(roomLayoutTable.organization_id, input.organization_id),
            eq(roomLayoutTable.room_id, input.room_id),
            eq(roomLayoutTable.time_period_id, input.time_period_id),
          ),
        });
        const newRecord = {
          // id: input.id,
          organization_id: input.organization_id,
          time_period_id: input.time_period_id,
          room_id: input.room_id,
          label: input.label,
          layout_data: JSON.parse(input.layout_data?.toString() ?? "{}"),
          approved_by: null,
          approved_at: null,
          approved_by_ip: null,
          updated_by: user?.id,
          updated_by_ip: clientIp,
          updated_at: new Date(),
        };
        if (
          existingRecords.filter((item) => item.approved_at == null).length > 0
        ) {
          const newRoomLayout = await db
            .update(roomLayoutTable)
            .set(newRecord)
            .where(
              and(
                eq(
                  roomLayoutTable.id,
                  existingRecords.filter((item) => item.approved_at == null)[0]
                    .id,
                ),
              ),
            )
            .returning();
          return newRoomLayout || null;
        } else {
          const newRoomLayout = await db
            .insert(roomLayoutTable)
            .values(newRecord)
            .returning();
          return newRoomLayout || null;
        }
      } catch (error) {
        console.error("Error updating room layout: ", error);
        throw new Error("Failed to update room layout. Please try again.");
      }
    }),
  findUserOrgRoles: authed.handler(async ({ context }) => {
    try {
      const orgRoles = await db.query.orgRoleTable.findMany({
        where: and(eq(orgRoleTable.admin_id, context.user?.id)),
        with: {
          org: true,
        },
      });
      return orgRoles || null;
    } catch (error) {
      console.error("Error fetching organization roles: ", error);
      throw new Error("Failed to fetch organization roles. Please try again.");
    }
  }),
  findUserOrgRole: authed
    .input(OrgRoleSchema.pick({ organization_id: true }))
    .use(locationAdmin, (input) => input.organization_id)
    .handler(async ({ input, context }) => {
      try {
        const orgRole = await db.query.orgRoleTable.findFirst({
          where: and(
            eq(orgRoleTable.organization_id, input.organization_id),
            eq(orgRoleTable.admin_id, context.user?.id),
          ),
        });
        return orgRole || null;
      } catch (error) {
        console.error("Error fetching organization roles: ", error);
        throw new Error(
          "Failed to fetch organization roles. Please try again.",
        );
      }
    }),
  addRoom: authed
    .input(RoomSchema.pick({ organization_id: true, label: true }))
    .use(locationAdmin, (input) => input.organization_id)
    .handler(async ({ input }) => {
      try {
        const newRoom = await db
          .insert(roomTable)
          .values({
            organization_id: input.organization_id,
            label: input.label,
          })
          .returning();
        const existingPeriods = await db.query.periodTable.findMany({
          where: eq(periodTable.organization_id, input.organization_id),
        });
        // console.log("existingPeriods: ", existingPeriods);
        if (existingPeriods.length > 0) {
          const newRoomLayouts = existingPeriods.map((period) => ({
            organization_id: input.organization_id,
            time_period_id: period.id,
            room_id: newRoom[0].id,
            label: `${newRoom[0].label} - ${period.label}`,
            layout_data: {},
          }));
          await db.insert(roomLayoutTable).values(newRoomLayouts);
          return [
            newRoom[0],
            ...(existingPeriods.length > 0 ? newRoomLayouts : []),
          ];
        } else {
          return newRoom || null;
        }
      } catch (error) {
        console.error("Error adding room: ", error);
        throw new Error("Failed to add room. Please try again.");
      }
    }),
  updateRoomDetails: authed
    .input(RoomSchema.pick({ organization_id: true, id: true, label: true }))
    .use(locationAdmin, (input) => input.organization_id)
    .handler(async ({ input }) => {
      try {
        const newRoom = await db
          .update(roomTable)
          .set({
            label: input.label,
          })
          .where(
            and(
              eq(roomTable.organization_id, input.organization_id),
              eq(roomTable.id, input.id),
            ),
          )
          .returning();
        return newRoom || null;
      } catch (error) {
        console.error("Error updating room: ", error);
        throw new Error("Failed to update room. Please try again.");
      }
    }),
  deleteRoom: authed
    .input(RoomSchema.pick({ organization_id: true, id: true }))
    .use(locationAdmin, (input) => input.organization_id)
    .handler(async ({ input }) => {
      try {
        const deletedRoom = await db
          .delete(roomTable)
          .where(
            and(
              eq(roomTable.organization_id, input.organization_id),
              eq(roomTable.id, input.id),
            ),
          )
          .returning();
        return deletedRoom || null;
      } catch (error) {
        console.error("Error deleting room:", error);
        throw new Error("Failed to delete room. Please try again.");
      }
    }),
  addPeriod: authed
    .input(
      PeriodSchema.pick({
        organization_id: true,
        label: true,
        start_time: true,
        end_time: true,
      }),
    )
    .use(locationAdmin, (input) => input.organization_id)
    .handler(async ({ input }) => {
      try {
        const newPeriod = await db
          .insert(periodTable)
          .values({
            organization_id: input.organization_id,
            label: input.label,
            start_time: input.start_time,
            end_time: input.end_time,
          })
          .returning();
        const existingRooms = await db.query.roomTable.findMany({
          where: eq(roomTable.organization_id, input.organization_id),
        });
        // console.log("existingRooms: ", existingRooms);
        if (existingRooms.length > 0) {
          const newRoomLayouts = existingRooms.map((room) => ({
            organization_id: input.organization_id,
            time_period_id: newPeriod[0].id,
            room_id: room.id,
            label: `${room.label} - ${newPeriod[0].label}`,
            layout_data: {},
          }));
          await db.insert(roomLayoutTable).values(newRoomLayouts);
          return [
            newPeriod[0],
            ...(existingRooms.length > 0 ? newRoomLayouts : []),
          ];
        } else {
          return newPeriod || null;
        }
      } catch (error) {
        console.error("Error adding period: ", error);
        throw new Error("Failed to add period. Please try again.");
      }
    }),
  updatePeriodDetails: authed
    .input(
      PeriodSchema.pick({
        id: true,
        label: true,
        start_time: true,
        end_time: true,
        organization_id: true,
      }),
    )
    .use(locationAdmin, (input) => input.organization_id)
    .handler(async ({ input }) => {
      try {
        const newPeriod = await db
          .update(periodTable)
          .set({
            label: input.label,
            start_time: input.start_time,
            end_time: input.end_time,
          })
          .where(
            and(
              eq(periodTable.organization_id, input.organization_id),
              eq(periodTable.id, input.id),
            ),
          )
          .returning();
        return newPeriod || null;
      } catch (error) {
        console.error("Error updating period: ", error);
        throw new Error("Failed to update period. Please try again.");
      }
    }),
  deletePeriod: authed
    .input(PeriodSchema.pick({ id: true, organization_id: true }))
    .use(locationAdmin, (input) => input.organization_id)
    .handler(async ({ input }) => {
      try {
        const deletedPeriod = await db
          .delete(periodTable)
          .where(
            and(
              eq(periodTable.organization_id, input.organization_id),
              eq(periodTable.id, input.id),
            ),
          )
          .returning();
        return deletedPeriod || null;
      } catch (error) {
        console.error("Error deleting period:", error);
        throw new Error("Failed to delete period. Please try again.");
      }
    }),
  addConnectedLayout: authed
    .input(
      RoomLayoutSchema.pick({
        room_id: true,
        time_period_id: true,
        organization_id: true,
        label: true,
      }),
    )
    .use(locationEditor, (input) => input.organization_id)
    .use(roomInLocation, (input) => {
      return { room_id: input.room_id, organization_id: input.organization_id };
    })
    .use(periodInLocation, (input) => {
      return {
        period_id: input.time_period_id,
        organization_id: input.organization_id,
      };
    })
    .handler(async ({ input, context }) => {
      try {
        const headersList = await headers();
        const clientIp = headersList.get("x-client-ip") || "Unknown";
        console.log(clientIp);
        const userRole = await db.query.orgRoleTable.findFirst({
          where: and(
            eq(orgRoleTable.admin_id, context.user.id),
            eq(orgRoleTable.organization_id, input.organization_id),
          ),
        });
        const newRoomLayout = await db
          .insert(roomLayoutTable)
          .values({
            organization_id: input.organization_id,
            time_period_id: input.time_period_id,
            room_id: input.room_id,
            label: input.label,
            layout_data: {
              occupancy: 100,
              canvasWidth: 1000,
              canvasHeight: 700,
              fixtures: [],
              tableData: [],
            },
            updated_by: context.user.id || null,
            updated_by_ip: clientIp,
            updated_at: new Date(),
            approved_by: userRole?.role === "approver" ? context.user.id : null,
            approved_at: userRole?.role === "approver" ? new Date() : null,
            approved_by_ip: userRole?.role === "approver" ? clientIp : null,
          })
          .returning();
        return newRoomLayout || null;
      } catch (error) {
        console.error("Error adding connected layout: ", error);
        throw new Error("Failed to add connected layout. Please try again.");
      }
    }),
  transferLayout: authed
    .input(
      z.object({
        from_id: z.number().int(),
        to_id: z.number().int(),
        copy_table_data: z.boolean(),
        organization_id: z.number().int(),
      }),
    )
    .use(locationAdmin, (input) => input.organization_id)
    .use(roomLayoutInLocation, (input) => ({
      room_layout_id: input.from_id,
      organization_id: input.organization_id,
    }))
    .use(roomLayoutInLocation, (input) => ({
      room_layout_id: input.to_id,
      organization_id: input.organization_id,
    }))
    .handler(async ({ input, context }) => {
      try {
        const user = context.user;
        const headersList = await headers();
        const clientIp = headersList.get("x-client-ip") || "Unknown";
        console.log(clientIp);
        if (user) {
          const fromLayout = await db.query.roomLayoutTable.findFirst({
            where: eq(roomLayoutTable.id, input.from_id),
          });
          if (!fromLayout) {
            throw new Error("Source layout not found.");
          }
          const fromLayoutParsed = LayoutDataSchema.parse(
            fromLayout.layout_data,
          );
          const toLayout = await db.query.roomLayoutTable.findFirst({
            where: eq(roomLayoutTable.id, input.to_id),
          });
          if (!toLayout) {
            throw new Error("Destination layout not found.");
          }
          const newValues = {
            label: toLayout.label,
            organization_id: toLayout.organization_id,
            time_period_id: toLayout.time_period_id,
            room_id: toLayout.room_id,
            layout_data: fromLayoutParsed,
            updated_at: new Date(),
            updated_by: user.id,
            updated_by_ip: clientIp,
            approved_at: new Date(),
            approved_by: user.id,
            approved_by_ip: clientIp,
          };
          if (!input.copy_table_data) {
            newValues.layout_data.tableData = fromLayoutParsed.fixtures
              .filter((item) => item.type.startsWith("table"))
              .map((tableFixture) => {
                return {
                  id: tableFixture.id,
                  seats: 8,
                  seatsFilled: 0,
                  open: true,
                  interests: "",
                  other: {},
                };
              });
          }
          // console.log("updatedValues: ", updatedValues);
          const updatedLayout = await db
            .insert(roomLayoutTable)
            .values(newValues)
            .returning();
          return updatedLayout || null;
        } else {
          throw new Error("User not authenticated.");
        }
      } catch (error) {
        console.error("Error transferring layout: ", error);
        throw new Error("Failed to transfer layout. Please try again.");
      }
    }),
  findRoomDataByLayoutId: base
    .input(
      RoomLayoutSchema.pick({
        organization_id: true,
        id: true,
      }),
    )
    .use(isLocationVisibleById, (input) => Number(input.organization_id))
    .handler(async ({ input, context }) => {
      const roomLayout = await db.query.roomLayoutTable.findFirst({
        where: and(
          eq(roomLayoutTable.organization_id, Number(input.organization_id)),
          eq(roomLayoutTable.id, Number(input.id)),
        ),
        with: {
          updated_by_admin: true,
          approved_by_admin: true,
        },
      });
      if (roomLayout) {
        if (roomLayout.approved_at) {
          return roomLayout;
        } else {
          if (context.user) {
            const userOrgRole = await db.query.orgRoleTable.findFirst({
              where: and(
                eq(orgRoleTable.organization_id, Number(input.organization_id)),
                eq(orgRoleTable.admin_id, context.user.id),
              ),
            });
            if (
              userOrgRole?.role === "editor" ||
              userOrgRole?.role === "approver"
            ) {
              return roomLayout;
            } else {
              return null;
            }
          } else {
            return null;
          }
        }
      } else {
        return null;
      }
    }),
  findRoomDataByRoomPeriod: base
    .input(
      FindRoomLayoutInputSchema.pick({
        org_id: true,
        room_id: true,
        period_id: true,
      }),
    )
    .use(isLocationVisibleById, (input) => Number(input.org_id))
    .handler(async ({ input }) => {
      const roomLayouts = await db.query.roomLayoutTable.findMany({
        where: and(
          eq(roomLayoutTable.organization_id, Number(input.org_id)),
          eq(roomLayoutTable.room_id, Number(input.room_id)),
          eq(roomLayoutTable.time_period_id, Number(input.period_id)),
        ),
      });
      const mostRecentApproved = roomLayouts.sort((a, b) => {
        if (a.approved_at && b.approved_at) {
          return b.approved_at.getTime() - a.approved_at.getTime();
        }
        return 0;
      })[0];
      // console.log("roomLayout: ", roomLayout);
      return mostRecentApproved || null;
    }),
  updateOrgDetails: authed
    .input(
      OrgSchema.pick({
        id: true,
        name: true,
        is_hidden: true,
        code: true,
        custom_message: true,
        custom_message_visible: true,
        layouts_disabled: true,
      }),
    )
    .use(locationAdmin, (input) => input.id)
    .handler(async ({ input }) => {
      try {
        const updatedOrg = await db
          .update(organizationTable)
          .set({
            name: input.name,
            is_hidden: input.is_hidden,
            code: input.code,
            custom_message: input.custom_message,
            custom_message_visible: input.custom_message_visible,
            layouts_disabled: input.layouts_disabled,
          })
          .where(eq(organizationTable.id, input.id))
          .returning();
        return updatedOrg || null;
      } catch (error) {
        console.error("Error updating organization: ", error);
        throw new Error("Failed to update organization. Please try again.");
      }
    }),
  updateOrgCustomMsg: authed
    .input(
      OrgSchema.pick({
        id: true,
        layouts_disabled: true,
        custom_message: true,
        custom_message_visible: true,
      }),
    )
    .use(locationAdmin, (input) => input.id)
    .handler(async ({ input }) => {
      try {
        const updatedOrg = await db
          .update(organizationTable)
          .set({
            layouts_disabled: input.layouts_disabled,
            custom_message: input.custom_message,
            custom_message_visible: input.custom_message_visible,
          })
          .where(eq(organizationTable.id, input.id))
          .returning();
        return updatedOrg || null;
      } catch (error) {
        console.error("Error updating organization: ", error);
        throw new Error("Failed to update organization. Please try again.");
      }
    }),
};
