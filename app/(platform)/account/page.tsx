// TODO: user account

"use client";

import { orpc } from "@/lib/orpc";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ORPCError } from "@orpc/client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AdminUserSchema } from "@/lib/schema";
import { z } from "zod";
import { supabaseClient } from "@/lib/auth-client";

export default function AccountPage() {
  type AdminUserType = z.infer<typeof AdminUserSchema>;

  const router = useRouter();
  const [userData, setUserData] = useState<AdminUserType | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loadingChangePassword, setLoadingChangePassword] = useState(false);
  const [loadingChangeUsername, setLoadingChangeUsername] = useState(false);
  const [userLoading, setUserLoading] = useState(true);

  const fetchUserData = async () => {
    const user = await supabaseClient.auth.getUser();
    const userId = user.data.user?.id;
    console.log(userId);
    if (!userId) {
      setUnauthorized(true);
      setUserLoading(false);
      return;
    }
    const response = await orpc.user.findUserData.call({
      id: userId, // update
    });
    const editedRepsonse = {
      id: response?.id || "",
      email: response?.email || "",
      name: response?.name || "",
      created_at: response?.created_at || new Date(),
    };
    setNewUserName(editedRepsonse.name);
    setUserData(editedRepsonse);
    setUserLoading(false);
  };

  const updateUserName = async (newOrgName: string) => {
    setLoadingChangeUsername(true);
    try {
      await orpc.user.updateUserName.call({
        name: newUserName,
      });
      toast.success("User name updated successfully");
      fetchUserData();
    } catch (error) {
      console.error("Error updating user name:", error);
      toast.error("Failed to update user name");
    } finally {
      setLoadingChangeUsername(false);
    }
  };

  const changeUserPassword = async () => {
    setLoadingChangePassword(true);
    try {
      await supabaseClient.auth.updateUser({
        password: newPassword,
      });
      setNewPassword("");
      setConfirmNewPassword("");
      toast.success("User password updated successfully");
      fetchUserData();
    } catch (error) {
      setNewPassword("");
      setConfirmNewPassword("");
      console.error("Error changing user password:", error);
      toast.error("Failed to change user password");
    } finally {
      setLoadingChangePassword(false);
    }
  };

  useEffect(() => {
    console.log("effect");
    (async () => {
      await fetchUserData();
    })();
  }, []);

  // const updateOrgVisibility = async (isHidden: boolean) => {
  //   setLoadingToggleOrgVisibility(true);
  //   if (orgId && organization) {
  //     try {
  //       await orpc.org.updateOrgDetails.call({
  //         id: orgId,
  //         name: organization.name,
  //         is_hidden: isHidden,
  //       });
  //       toast.success("Location updated successfully");
  //       refetch();
  //     } catch (error) {
  //       console.error("Error updating organization name:", error);
  //       toast.error("Failed to update location name");
  //     } finally {
  //       setLoadingToggleOrgVisibility(false);
  //     }
  //   }
  // };

  // const deleteOrg = async () => {
  //   // TODO: add code to delete an organization --- not yet
  // };

  return (
    <div className="flex flex-col w-screen max-w-screen items-center py-16 pb-24 pt-24">
      <div className="flex flex-col w-full gap-4 max-w-md px-8">
        <div className="flex flex-col max-w-full">
          {unauthorized ? (
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl font-heading">Unauthorized</h1>
            </div>
          ) : !userLoading ? (
            userData ? (
              <div>
                <div className="flex flex-col gap-2 mb-4">
                  <h1 className="text-3xl font-heading">{userData.name}</h1>
                  <p>{userData.email}</p>
                </div>
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <p className="text-base">Change user name:</p>
                      <Field>
                        <FieldLabel>New Username</FieldLabel>
                        <Input
                          type="text"
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                        />
                      </Field>
                      <Button
                        className="w-fit"
                        disabled={
                          loadingChangeUsername ||
                          newUserName.trim() === "" ||
                          newUserName === userData.name
                        }
                        onClick={() => updateUserName(newUserName)}
                      >
                        {loadingChangeUsername && <Spinner />}
                        Save
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter></CardFooter>
                </Card>
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Credentials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <p className="text-base">Change password:</p>
                      <Field>
                        <FieldLabel>New Password</FieldLabel>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Confirm New Password</FieldLabel>
                        <Input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) =>
                            setConfirmNewPassword(e.target.value)
                          }
                        />
                      </Field>
                      <Button
                        className="w-fit"
                        disabled={
                          loadingChangePassword ||
                          newPassword.trim() === "" ||
                          newPassword !== confirmNewPassword
                        }
                        onClick={changeUserPassword}
                      >
                        {loadingChangePassword && <Spinner />}
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <p>User not found</p>
            )
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}
