// src/server/context.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "./db";

export async function createORPCContext() {
  const cookieStore = await cookies();

  // Create a minimal Supabase instance strictly for extracting Auth state
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  // Safely resolve the crypto-signed JWT user object
  const { data: { user } } = await supabaseAuth.auth.getUser();

  return {
    db,    // Drizzle client
    user,  // Supabase authenticated user session (or null)
  };
}

export type Context = Awaited<ReturnType<typeof createORPCContext>>;
