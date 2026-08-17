import { db } from "@/server/db";

import { eq } from "drizzle-orm";
import { organizationTable } from "@/server/db/schema";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// middleware.ts
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/account") ||
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.match(/^\/location\/(\d+)\/edit$/) ||
    request.nextUrl.pathname.match(/^\/location\/(\d+)\/settings$/) ||
    request.nextUrl.pathname.match(
      /^\/location\/(\d+)\/room\/(\d+)\/period\/(\d+)\/edit$/,
    );
  const isProtectedLayoutRoute = request.nextUrl.pathname.match(
    /^\/location\/(\d+)\/room\/(\d+)\/period\/(\d+)\/view$/,
  );
  const locationMatch = request.nextUrl.pathname.match(/^\/location\/([^/]+)/);

  if (isProtectedRoute || isProtectedLayoutRoute) {
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
    if (!user && isProtectedRoute) return NextResponse.redirect(new URL("/login", request.url));

    // Only feasible if using an HTTP-compatible client (Supabase client, not Drizzle+pg)
    if (locationMatch) {
      const [location] = await db
        .select()
        .from(organizationTable)
        .where(eq(organizationTable.id, parseInt(locationMatch[1])))
        .limit(1);

      console.log("proxy location", location);
      if (
        (!location ||
          location.is_hidden ||
          (location.layouts_disabled &&
            request.nextUrl.pathname.match(
              /^\/location\/(\d+)\/room\/(\d+)\/period\/(\d+)\/view$/,
            ))) &&
        location.admin_id !== user?.id
      ) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  return response;
}
