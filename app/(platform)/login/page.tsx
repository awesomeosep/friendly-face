"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { supabaseClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import posthog from "posthog-js";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const router = useRouter();

  const loginUser = async () => {
    setLoginLoading(true);
    try {
      const response = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (response.error) {
        toast.error("Error logging in", {
          description: response.error.message,
        });
      } else {
        toast.success("Login successful");
        posthog.identify(response.data.user?.id || "unknown_logged_in_user");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Unknown error logging in");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-screen max-w-screen items-center py-16 pb-24 pt-24">
      <div className="flex flex-col w-full gap-4 max-w-md px-8">
        <div className="flex flex-col max-w-full gap-4">
          <div className="flex flex-row gap-4">
            <h1 className="text-3xl">Admin Login</h1>
          </div>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input
              type="password"
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Button disabled={loginLoading} onClick={loginUser}>
            {loginLoading && <Spinner />}
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}
