import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// middleware.ts
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  console.log(request.url);
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/account") ||
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.match(/^\/location\/(\d+)\/edit$/) ||
    request.nextUrl.pathname.match(/^\/location\/(\d+)\/settings$/) ||
    request.nextUrl.pathname.match(
      /^\/location\/(\d+)\/room\/(\d+)\/period\/(\d+)\/edit$/,
    );
  const locationMatch = request.nextUrl.pathname.match(/^\/location\/([^/]+)/);

  if (isProtectedRoute) {
    console.log("protected");
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
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
    if (!user) return NextResponse.redirect(new URL("/login", request.url));

    // Only feasible if using an HTTP-compatible client (Supabase client, not Drizzle+pg)
    if (locationMatch) {
      console.log("location match");
      const { data: location } = await supabase
        .from("organizations")
        .select("admin_id")
        .eq("id", parseInt(locationMatch[1]))
        .single();

      console.log(locationMatch[1]);
      console.log(location);

      if (!location || location.admin_id !== user.id) {
        console.log("unauthed");
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  return response;
}
