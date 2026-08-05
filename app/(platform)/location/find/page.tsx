"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { client } from "@/lib/orpc";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function FindOrgPage() {
  const router = useRouter();
  const [orgCode, setOrgCode] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrgCode(e.target.value);
  };

  const searchForOrg = async () => {
    if (orgCode.trim() === "") {
      alert("Please enter a location code.");
      return;
    }
    try {
      setSearchLoading(true);
      const results = await client.org.findByCode({ code: orgCode });
      if (!results) {
        alert("No location found with that code.");
      } else {
        const orgId = results?.id;
        router.push(`/location/${orgId}/view`);
      }
    } catch (error) {
      console.log("Error searching for location:", error);
      toast.error("An error occurred while searching for the location.", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-screen max-w-screen items-center py-16 pb-24 pt-24">
      <div className="flex flex-col w-full gap-4 max-w-md px-8">
        <div className="flex flex-col max-w-full gap-4">
          <div className="flex flex-row gap-4">
            <h1 className="text-3xl">Search for a Location</h1>
          </div>
          <p>Enter the location code to search:</p>
          <Input
            id="location-search-code"
            type="text"
            placeholder="Location code..."
            value={orgCode}
            onChange={handleInputChange}
          />
          <Button onClick={searchForOrg} disabled={searchLoading}>
            {searchLoading && (
              <Spinner className="color-white" />
            )}
            {"Search"}
          </Button>
        </div>
      </div>
    </div>
  );
}
