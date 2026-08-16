// TODO: view basic details of org, like name; select room & period to view layout

"use client";

import { orpc } from "@/lib/orpc";
import { useRouter, useParams } from "next/navigation";
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
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ParamsType = {
  org_id: string;
};

export default function OrgSettingsPage() {
  const orgId = parseInt(useParams<ParamsType>().org_id);
  const router = useRouter();
  const {
    isPending: orgLoading,
    data: organization,
    refetch,
  } = useQuery(
    orpc.org.findById.queryOptions({
      input: { id: orgId },
      onError: (error: ORPCError<string, unknown>) => {
        console.error("Error fetching organization:", error);
      },
    }),
  );
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgCode, setNewOrgCode] = useState("");
  const [isOrgHidden, setIsOrgHidden] = useState(false);
  const [loadingRenameOrg, setLoadingRenameOrg] = useState(false);
  const [loadingUpdateOrgCode, setLoadingUpdateOrgCode] = useState(false);
  const [loadingToggleOrgVisibility, setLoadingToggleOrgVisibility] =
    useState(false);
  const [hasLoadedVariables, setHasLoadedVariables] = useState(false);

  const updateOrgName = async (newOrgName: string) => {
    setLoadingUpdateOrgCode(true);
    try {
      await orpc.org.updateOrgDetails.call({
        id: orgId,
        name: newOrgName,
        is_hidden: organization?.is_hidden ?? false,
        code: organization?.code ?? "",
      });
      toast.success("Location updated successfully");
      refetch();
    } catch (error) {
      console.error("Error updating organization name:", error);
      toast.error("Failed to update location name");
    } finally {
      setLoadingUpdateOrgCode(false);
    }
  };

  const updateOrgCode = async (newOrgCode: string) => {
    setLoadingUpdateOrgCode(true);
    try {
      await orpc.org.updateOrgDetails.call({
        id: orgId,
        name: organization?.name ?? "",
        is_hidden: organization?.is_hidden ?? false,
        code: newOrgCode,
      });
      toast.success("Location updated successfully");
      refetch();
    } catch (error) {
      console.error("Error updating organization code:", error);
      toast.error("Failed to update location code");
    } finally {
      setLoadingUpdateOrgCode(false);
    }
  };

  useEffect(() => {
    const update = () => {
      setNewOrgName(organization?.name ?? "");
      setIsOrgHidden(organization?.is_hidden ?? false);
      setHasLoadedVariables(true);
      setNewOrgCode(organization?.code ?? "");
    };
    if (organization && !hasLoadedVariables) {
      update();
    }
  }, [organization]);

  const updateOrgVisibility = async (isHidden: boolean) => {
    setLoadingToggleOrgVisibility(true);
    if (orgId && organization) {
      try {
        await orpc.org.updateOrgDetails.call({
          id: orgId,
          name: organization.name,
          is_hidden: isHidden,
          code: organization.code,
        });
        toast.success("Location updated successfully");
        refetch();
      } catch (error) {
        console.error("Error updating organization name:", error);
        toast.error("Failed to update location name");
      } finally {
        setLoadingToggleOrgVisibility(false);
      }
    }
  };

  const deleteOrg = async () => {
    // TODO: add code to delete an organization --- not yet
  };

  return (
    <div className="flex flex-col w-screen max-w-screen items-center py-16 pb-24 pt-24">
      <div className="flex flex-col w-full gap-4 max-w-md px-8">
        <div className="flex flex-col max-w-full">
          {!orgLoading ? (
            organization ? (
              <div>
                <div className="flex flex-col gap-2 mb-4">
                  <h1 className="text-3xl font-heading">{organization.name}</h1>
                  <p>Code: {organization.code}</p>
                </div>
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Basic</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                      <Field>
                        <FieldLabel>Location Name</FieldLabel>
                        <Input
                          type="text"
                          value={newOrgName}
                          onChange={(e) => setNewOrgName(e.target.value)}
                        />
                      </Field>
                      <Button
                        className="w-fit"
                        disabled={
                          loadingRenameOrg ||
                          newOrgName.trim() === "" ||
                          newOrgName === organization.name
                        }
                        onClick={() => updateOrgName(newOrgName)}
                      >
                        {loadingRenameOrg && <Spinner />}
                        Rename
                      </Button>
                    </div>
                    <div className="flex flex-col gap-4">
                      <Field>
                        <FieldLabel>Location Code</FieldLabel>
                        <Input
                          type="text"
                          value={newOrgCode}
                          onChange={(e) => setNewOrgCode(e.target.value)}
                        />
                      </Field>
                      <Button
                        className="w-fit"
                        disabled={
                          loadingUpdateOrgCode ||
                          newOrgCode.trim() === "" ||
                          newOrgCode === organization.code
                        }
                        onClick={() => updateOrgCode(newOrgCode)}
                      >
                        {loadingUpdateOrgCode && <Spinner />}
                        Update Code
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter></CardFooter>
                </Card>
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Visibility</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <Field orientation="horizontal">
                        <Checkbox
                          checked={!isOrgHidden}
                          onCheckedChange={(checked) =>
                            setIsOrgHidden(!checked)
                          }
                        />
                        <FieldLabel>Publicly visible</FieldLabel>
                      </Field>
                      {isOrgHidden !== organization.is_hidden &&
                        (isOrgHidden ? (
                          <Alert variant="destructive">
                            <AlertTitle>Warning</AlertTitle>
                            <AlertDescription>
                              Hiding a location will make it inaccessible to the
                              public. Only you will be able to view and edit it.
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <Alert variant="destructive">
                            <AlertTitle>Warning</AlertTitle>
                            <AlertDescription>
                              This will allow this location to be visible to the
                              public. Anyone with the location code or link will
                              be able to view location information and room
                              layouts.
                            </AlertDescription>
                          </Alert>
                        ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-fit"
                      disabled={
                        loadingToggleOrgVisibility ||
                        isOrgHidden === organization.is_hidden
                      }
                      onClick={() => updateOrgVisibility(isOrgHidden)}
                    >
                      {loadingToggleOrgVisibility && <Spinner />}
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <p>Organization not found</p>
            )
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}
