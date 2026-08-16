import { db } from "@/server/db";
import { ORPCError, os } from "@orpc/server";
import { type Context } from "../../context";
import { AdminUserSchema } from "@/lib/schema";
import { adminTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { supabaseClient } from "@/lib/auth-client";

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

export const userRouter = {
  findUserData: authed.handler(async ({ context }) => {
    const user = context.user ? context.user : null;
    if (!user) {
      throw new Error("UNAUTHORIZED: Sign-in required.");
    }
    try {
      const userData = await db.query.adminTable.findFirst({
        where: eq(adminTable.id, user.id),
      });
      //   console.log(userData);
      return userData || null;
    } catch (error) {
      console.error("Error updating room layout: ", error);
      throw new Error("Failed to update room layout. Please try again.");
    }
  }),
  updateUserName: authed
    .input(AdminUserSchema.pick({ name: true }))
    .handler(async ({ context, input }) => {
      const user = context.user ? context.user : null;
      if (!user) {
        throw new Error("UNAUTHORIZED: Sign-in required.");
      }
      try {
        const updatedUser = await db
          .update(adminTable)
          .set({ name: input.name })
          .where(eq(adminTable.id, user.id))
          .returning();
        // console.log(updatedUser);
        return updatedUser || null;
      } catch (error) {
        console.error("Error updating user name: ", error);
        throw new Error("Failed to update user name. Please try again.");
      }
    }),
};
