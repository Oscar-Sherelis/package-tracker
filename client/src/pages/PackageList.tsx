import { useState } from "react";
import { usePackages, useUpdateStatus } from "../api/packages";
import { PackageStatus } from "../types/package";

// Define types for the package data
interface Package {
  id: string;
  trackingNumber: string;
  senderName: string;
  recipientName: string;
  status: "Created" | "Sent" | "Accepted" | "Returned" | "Canceled";
}

// Define status colors with type safety
const statusColors: Record<Package["status"], string> = {
  Created: "bg-gray-300 text-gray-800",
  Sent: "bg-blue-300 text-blue-900",
  Accepted: "bg-green-300 text-green-900",
  Returned: "bg-yellow-300 text-yellow-900",
  Canceled: "bg-red-300 text-red-900",
};

export default function PackageList() {
  const { data: packages, isLoading } = usePackages();
  const updateStatus = useUpdateStatus();
  const [filter, setFilter] = useState<string>("");

  if (isLoading) return <p className="p-4">Loading...</p>;

  const filtered = packages?.filter(
    (pkg: Package) =>
      pkg.trackingNumber.toLowerCase().includes(filter.toLowerCase()) ||
      pkg.status.toLowerCase().includes(filter.toLowerCase())
  );

  console.log('PackageList ', filtered)

  // Check if there are no packages
  if (!filtered || filtered.length === 0) {
    return (
      <div className="p-6">

        <p className="text-center text-gray-500 py-8">
          {filter
            ? "No packages match your filter"
            : "Currently there are no packages"}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📦 Packages</h1>

      <input
        type="text"
        placeholder="Filter by tracking number or status"
        className="border p-2 rounded w-full mb-4"
        value={filter}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setFilter(e.target.value)
        }
      />

      <div className="grid gap-4">
        {filtered?.map((pkg: Package) => (
          <div
            key={pkg.id}
            className="p-4 border rounded-lg shadow flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">#{pkg.trackingNumber}</p>
              <p>
                {pkg.senderName} → {pkg.recipientName}
              </p>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  statusColors[pkg.status]
                }`}
              >
                {pkg.status}
              </span>
            </div>

            <div className="flex gap-2">
              {["Created", "Sent", "Returned"].includes(pkg.status) && (
                <>
                  {pkg.status === "Created" && (
                    <>
                      <button
                        className="px-2 py-1 bg-blue-500 text-white rounded"
                        onClick={() =>
                          updateStatus.mutate({ id: pkg.id, newStatus: PackageStatus.Sent })
                        }
                      >
                        Send
                      </button>
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded"
                        onClick={() =>
                          updateStatus.mutate({
                            id: pkg.id,
                            newStatus: PackageStatus.Canceled,
                          })
                        }
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {pkg.status === "Sent" && (
                    <>
                      <button
                        className="px-2 py-1 bg-green-500 text-white rounded"
                        onClick={() =>
                          updateStatus.mutate({
                            id: pkg.id,
                            newStatus:  PackageStatus.Accepted,
                          })
                        }
                      >
                        Accept
                      </button>
                      <button
                        className="px-2 py-1 bg-yellow-500 text-white rounded"
                        onClick={() =>
                          updateStatus.mutate({
                            id: pkg.id,
                            newStatus: PackageStatus.Returned,
                          })
                        }
                      >
                        Return
                      </button>
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded"
                        onClick={() =>
                          updateStatus.mutate({
                            id: pkg.id,
                            newStatus: PackageStatus.Canceled,
                          })
                        }
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {pkg.status === "Returned" && (
                    <>
                      <button
                        className="px-2 py-1 bg-blue-500 text-white rounded"
                        onClick={() =>
                          updateStatus.mutate({
                            id: pkg.id,
                            newStatus: PackageStatus.Sent,
                          })
                        }
                      >
                        Resend
                      </button>
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded"
                        onClick={() =>
                          updateStatus.mutate({
                            id: pkg.id,
                            newStatus: PackageStatus.Canceled,
                          })
                        }
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
