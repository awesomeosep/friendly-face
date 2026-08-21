import { db } from "@/server/db";

import { and, eq, isNotNull } from "drizzle-orm";
import {
  organizationTable,
  orgRoleTable,
  roomLayoutTable,
} from "@/server/db/schema";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// middleware.ts
export async function proxy(request: NextRequest) {
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "127.0.0.1";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-client-ip", ip);

  console.log("client ip2", ip);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const isProtectedEditRoute =
    request.nextUrl.pathname.startsWith("/account") ||
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.match(/^\/location\/(\d+)\/edit$/) ||
    request.nextUrl.pathname.match(/^\/location\/(\d+)\/settings$/) ||
    request.nextUrl.pathname.match(/^\/location\/(\d+)\/layout\/(\d+)\/edit$/);
  const isProtectedViewRoute = request.nextUrl.pathname.match(
    /^\/location\/(\d+)\/layout\/(\d+)\/view$/,
  );
  const locationMatch = request.nextUrl.pathname.match(/^\/location\/([^/]+)/);

  if (isProtectedEditRoute || isProtectedViewRoute) {
    console.log(
      "match",
      isProtectedEditRoute,
      isProtectedViewRoute,
      locationMatch,
    );
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL ?? "",
      process.env.SUPABASE_SECRET_KEY ?? "",
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user && isProtectedEditRoute)
      return NextResponse.redirect(new URL("/login", request.url));

    if (locationMatch) {
      const [location] = await db
        .select()
        .from(organizationTable)
        .where(eq(organizationTable.id, parseInt(locationMatch[1])))
        .limit(1);

      const locationRoles = await db
        .select()
        .from(orgRoleTable)
        .where(eq(orgRoleTable.organization_id, parseInt(locationMatch[1])));
      console.log(locationRoles);

      console.log("proxy location", location);
      if (
        (!location ||
          location.is_hidden ||
          (location.layouts_disabled &&
            request.nextUrl.pathname.match(
              /^\/location\/(\d+)\/layout\/(\d+)\/view$/,
            ))) &&
        locationRoles.filter((item) => item.admin_id === user?.id).length === 0
      ) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      if (isProtectedViewRoute) {
        const approvedLayouts = await db
          .select()
          .from(roomLayoutTable)
          .where(
            and(
              eq(roomLayoutTable.organization_id, parseInt(locationMatch[1])),
              isNotNull(roomLayoutTable.approved_at),
            ),
          );
        const sortedApprovedLayouts = approvedLayouts.sort((a, b) => {
          const aDate = new Date(a.approved_at ?? 0);
          const bDate = new Date(b.approved_at ?? 0);
          return bDate.getTime() - aDate.getTime();
        });
        const mostRecentApprovedLayout = sortedApprovedLayouts[0];
        if (
          !mostRecentApprovedLayout ||
          isProtectedViewRoute[2] !== mostRecentApprovedLayout.id.toString()
        ) {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
      }
    }
  }

  return response;
}
