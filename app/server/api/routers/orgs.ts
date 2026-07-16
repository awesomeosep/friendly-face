import { db } from "@/server/db";
import { os } from "@orpc/server";
import { type Context } from "../../context";
import { OrgSchema, RoomLayoutSchema } from "@/lib/schema";
import { organizationTable, roomLayoutTable } from "@/server/db/schema";
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
  findMany: base.handler(async ({ context }) => {
    console.log("received!");
    const session = context.user ? context.user : null;
    const orgs = await db.query.organizationTable.findMany({
      // where: eq(quizzesTable.user, session ? session.id : "anon"),
      with: {
        rooms: true,
        periods: true,
        room_layouts: true,
      },
    });
    console.log("orgs: ", orgs);
    return orgs || [];
  }),
  // TODO: update to base. for auth
  updateRoom: os
    .input(RoomLayoutSchema.pick({ id: true, label: true, layout_data: true }))
    .handler(async ({ input }) => {
      const updatedInput = {
        id: input.id,
        label: input.label,
        layout_data: input.layout_data?.toString(),
      };
      console.log("updatedInput: ", updatedInput);
      // const roomLayout = await db.query.roomLayoutTable.findMany({
      //   where: eq(roomLayoutTable.id, input.id),
      // });
      const roomLayout = await db
        .update(roomLayoutTable)
        .set(updatedInput)
        .where(eq(roomLayoutTable.id, input.id))
        .returning();
      return roomLayout || null;
    }),
  findRoomDataByRoomPeriod: os
    .input(FindRoomLayoutInputSchema.pick({ org_id: true, room_id: true, period_id: true }))
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
  // submitResponse: base
  //   .input(z.object({ quizId: z.number(), answers: z.array(z.string()) }))
  //   .handler(async ({ input, context }) => {
  //     const session = context.user ? context.user : null;
  //     const submission = await db
  //       .insert(submissionsTable)
  // submitResponse: base
  //   .input(z.object({ quizId: z.number(), answers: z.array(z.string()) }))
  //   .handler(async ({ input, context }) => {
  //     const session = context.user ? context.user : null;
  //     const submission = await db
  //       .insert(submissionsTable)
  //       .values({
  //         quizId: input.quizId,
  //         answers: input.answers,
  //         user: session ? session.id : "anon",
  //       })
  //       .returning();
  //     return submission[0].id;
  //   }),
  // getSubmission: os
  //   .input(z.object({ submissionId: z.number() }))
  //   .handler(async ({ input }) => {
  //     // const session = context.session;
  //     const submission = await db.query.submissionsTable.findFirst({
  //       where: and(
  //         eq(submissionsTable.id, input.submissionId),
  //         // eq(submissionsTable.user, session.user.id)
  //       ),
  //       with: {
  //         quiz: {
  //           with: {
  //             quizFeatures: {
  //               with: {
  //                 quizFeatureEventualities: true,
  //               },
  //             },
  //             quizQuestions: true,
  //             quizEventualities: true,
  //           },
  //         },
  //       },
  //     });
  //     if (submission) {
  //       const newSubmission = calcSubmissionResults(submission);
  //       return newSubmission;
  //     } else {
  //       throw new ORPCError("UNAUTHORIZED");
  //     }
  //   }),
  // getSubmissions: base.handler(async ({ context }) => {
  //   const session = context.user ? context.user : null;
  //   const submissions = await db.query.submissionsTable.findMany({
  //     where: and(eq(submissionsTable.user, session ? session.id : "anon")),
  //     with: {
  //       quiz: {
  //         with: {
  //           quizFeatures: {
  //             with: {
  //               quizFeatureEventualities: true,
  //             },
  //           },
  //           quizQuestions: true,
  //           quizEventualities: true,
  //         },
  //       },
  //     },
  //   });
  //   if (submissions && submissions.length > 0) {
  //     const newSubmissions = [];
  //     for (const submission of submissions) {
  //       const newSubmission = await calcSubmissionResults(submission);
  //       newSubmissions.push(newSubmission);
  //     }
  //     return newSubmissions;
  //   } else {
  //     return [];
  //   }
  // }),
  // createBlank: base.handler(async () => {
  //   try {
  //     const session = await auth.api.getSession({
  //       headers: await headers(),
  //     });
  //     const response = await db
  //       .insert(quizzesTable)
  //       .values({
  //         title: "",
  //         description: "",
  //         user: session ? session.user.id : "anon",
  //       })
  //       .returning();
  //     return response[0].id;
  //   } catch (e) {
  //     console.log("Error creating a quiz: ", e);
  //   }
  // }),
  // update: base
  //   .input(z.object({ quizId: z.int(), formData: FormSchema }))
  //   .handler(async ({ input, context }) => {
  //     try {
  //       const session = context.user ? context.user : null;
  //       update(input, session);
  //     } catch (e) {
  //       if (e instanceof Error && e.message == "Unauthorized") {
  //         throw new ORPCError("UNAUTHORIZED");
  //       }
  //       console.log("error creating quiz in server: ", e);
  //       return "-";
  //     }
  //   }),
};
