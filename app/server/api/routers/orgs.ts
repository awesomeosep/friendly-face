import { db } from "@/server/db";
import { os } from "@orpc/server";
import { type Context } from "../../context";
import {
  LayoutDataSchema,
  OrgSchema,
  PeriodSchema,
  RoomLayoutSchema,
  RoomSchema,
} from "@/lib/schema";
import {
  organizationTable,
  periodTable,
  roomLayoutTable,
  roomTable,
} from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const base = os.$context<Context>();

export const authed = base.use(async ({ context, next }) => {
  if (!context.user) {
    throw new Error("UNAUTHORIZED: Sign-in required.");
  }

  return next({
    context: {
      user: context.user, // Forces user context to be strictly non-null
    },
  });
});

const FindRoomLayoutInputSchema = z.object({
  org_id: z.string(),
  room_id: z.string(),
  period_id: z.string(),
});

export const orgRouter = {
  findByCode: os
    .input(OrgSchema.pick({ code: true }))
    .handler(async ({ input }) => {
      const org = await db.query.organizationTable.findFirst({
        where: eq(organizationTable.code, input.code),
        with: {
          rooms: true,
          periods: true,
          room_layouts: true,
        },
      });
      return org || null;
    }),
  findById: os
    .input(OrgSchema.pick({ id: true }))
    .handler(async ({ input }) => {
      const org = await db.query.organizationTable.findFirst({
        where: eq(organizationTable.id, input.id),
        with: {
          rooms: true,
          periods: true,
          room_layouts: true,
        },
      });
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
  updateRoomLayout: authed
    .input(
      RoomLayoutSchema.pick({
        id: true,
        label: true,
        layout_data: true,
      }).extend({
        layout_data: z.string().optional(),
      }),
    )
    .handler(async ({ input }) => {
      console.log(input.layout_data);
      try {
        const updatedInput = {
          id: input.id,
          label: input.label,
          layout_data: JSON.parse(input.layout_data?.toString() || "{}"),
          updated_at: new Date(),
        };
        console.log("updatedInput: ", updatedInput);
        const roomLayout = await db
          .update(roomLayoutTable)
          .set(updatedInput)
          .where(eq(roomLayoutTable.id, input.id))
          .returning();
        return roomLayout || null;
      } catch (error) {
        console.error("Error updating room layout: ", error);
        throw new Error("Failed to update room layout. Please try again.");
      }
    }),
  addRoom: authed
    .input(RoomSchema.pick({ organization_id: true, label: true }))
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
        console.log("existingPeriods: ", existingPeriods);
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
    .input(RoomSchema.pick({ id: true, label: true }))
    .handler(async ({ input }) => {
      try {
        const newRoom = await db
          .update(roomTable)
          .set({
            label: input.label,
          })
          .where(eq(roomTable.id, input.id))
          .returning();
        return newRoom || null;
      } catch (error) {
        console.error("Error updating room: ", error);
        throw new Error("Failed to update room. Please try again.");
      }
    }),
  deleteRoom: authed
    .input(RoomSchema.pick({ id: true }))
    .handler(async ({ input }) => {
      try {
        const deletedRoom = await db
          .delete(roomTable)
          .where(eq(roomTable.id, input.id))
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
        console.log("existingRooms: ", existingRooms);
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
      }),
    )
    .handler(async ({ input }) => {
      try {
        const newPeriod = await db
          .update(periodTable)
          .set({
            label: input.label,
            start_time: input.start_time,
            end_time: input.end_time,
          })
          .where(eq(periodTable.id, input.id))
          .returning();
        return newPeriod || null;
      } catch (error) {
        console.error("Error updating period: ", error);
        throw new Error("Failed to update period. Please try again.");
      }
    }),
  deletePeriod: authed
    .input(PeriodSchema.pick({ id: true }))
    .handler(async ({ input }) => {
      try {
        const deletedPeriod = await db
          .delete(periodTable)
          .where(eq(periodTable.id, input.id))
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
    .handler(async ({ input }) => {
      try {
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
      }),
    )
    .handler(async ({ input }) => {
      try {
        const fromLayout = await db.query.roomLayoutTable.findFirst({
          where: eq(roomLayoutTable.id, input.from_id),
        });
        if (!fromLayout) {
          throw new Error("Source layout not found.");
        }
        console.log("fromLayout: ", fromLayout);
        const fromLayoutParsed = LayoutDataSchema.parse(fromLayout.layout_data);
        const toLayout = await db.query.roomLayoutTable.findFirst({
          where: eq(roomLayoutTable.id, input.to_id),
        });
        if (!toLayout) {
          throw new Error("Destination layout not found.");
        }
        console.log("toLayout: ", toLayout);
        const toLayoutParsed = LayoutDataSchema.parse(toLayout.layout_data);
        const updatedValues = {
          layout_data: fromLayoutParsed,
          updated_at: new Date(),
        };
        if (!input.copy_table_data) {
          updatedValues.layout_data.tableData = fromLayoutParsed.fixtures
            .filter((item) => item.type.startsWith("table"))
            .map((tableFixture) => {
              return (
                {
                  id: tableFixture.id,
                  seats: 8,
                  seatsFilled: 0,
                  open: true,
                  interests: "",
                  other: {},
                }
              );
            });
        }
        console.log("updatedValues: ", updatedValues);
        const updatedLayout = await db
          .update(roomLayoutTable)
          .set(updatedValues)
          .where(eq(roomLayoutTable.id, input.to_id))
          .returning();
        return updatedLayout || null;
      } catch (error) {
        console.error("Error transferring layout: ", error);
        throw new Error("Failed to transfer layout. Please try again.");
      }
    }),
  findRoomDataByRoomPeriod: os
    .input(
      FindRoomLayoutInputSchema.pick({
        org_id: true,
        room_id: true,
        period_id: true,
      }),
    )
    .handler(async ({ input }) => {
      const roomLayout = await db.query.roomLayoutTable.findFirst({
        where: and(
          eq(roomLayoutTable.organization_id, Number(input.org_id)),
          eq(roomLayoutTable.room_id, Number(input.room_id)),
          eq(roomLayoutTable.time_period_id, Number(input.period_id)),
        ),
      });
      console.log("roomLayout: ", roomLayout);
      return roomLayout || null;
    }),
};
