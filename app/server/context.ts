// src/server/context.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "./db";
import { NextRequest, NextResponse } from "next/server";

export async function createORPCContext(request: NextRequest) {
  const response = NextResponse.next({ request });

  try {
    const cookieStore = await cookies();

    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL ?? "",
      process.env.SUPABASE_SECRET_KEY ?? "",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {}
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    return {
      db,
      user,
    };
  } catch (error) {
    console.error("Failed to create oRPC context:", error);
    return {
      db,
      user: null,
    };
  }
}

export type Context = Awaited<ReturnType<typeof createORPCContext>>;
