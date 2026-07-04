"use client";

import { client } from "@/lib/orpc";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FindOrgPage() {
  const router = useRouter();
  const [orgCode, setOrgCode] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrgCode(e.target.value);
  };

  const searchForOrg = async () => {
    if (orgCode.trim() === "") {
      alert("Please enter an organization code.");
      return;
    }
    try {
      const results = await client.org.findByCode({ code: orgCode });
      if (!results) {
        alert("No organization found with that code.");
      } else {
        const orgId = results?.id;
        router.push(`/org/${orgId}`);
      }
    } catch (error) {
      console.error("Error searching for organization:", error);
      alert("An error occurred while searching for the organization.");
    }
  };

  return (
    <div className="flex flex-col w-screen items-center pt-30 pb-10">
      <div className="flex flex-col min-w-md max-w-md gap-4 px-8">
        <div className="flex flex-row gap-4">
          <h1 className="text-3xl text-rose-500 dark:text-rose-400 font-heading">
            Search for a Location
          </h1>
        </div>
        <p>Enter the organization code:</p>
        <input
          type="text"
          placeholder="Organization Code"
          className="border border-gray-300 rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-rose-500"
          value={orgCode}
          onChange={handleInputChange}
        />
        <button
          type="button"
          className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-4 rounded"
          onClick={searchForOrg}
        >
          Search
        </button>
      </div>
    </div>
  );
}
