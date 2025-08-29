import { useState } from "react";
import { usePackages, useUpdateStatus } from "../api/packages";
import { PackageStatus, PackageListItem} from "../types/package";

const statusColors: Record<PackageStatus, string> = {
  [PackageStatus.Created]: "bg-gray-300 text-gray-800",
  [PackageStatus.Sent]: "bg-blue-300 text-blue-900",
  [PackageStatus.Accepted]: "bg-green-300 text-green-900",
  [PackageStatus.Returned]: "bg-yellow-300 text-yellow-900",
  [PackageStatus.Canceled]: "bg-red-300 text-red-900",
};

export default function PackageList() {
  const { data: packages, isLoading, error } = usePackages();
  const updateStatusMutation = useUpdateStatus();
  const [filter, setFilter] = useState<string>("");

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (error)
    return <p className="p-4 text-red-500">Error loading packages error</p>;

  const filtered =
    packages?.filter(
      (pkg: PackageListItem) =>
        pkg.trackingNumber.toLowerCase().includes(filter.toLowerCase()) ||
        PackageStatus[pkg.status]
          .toLowerCase()
          .includes(filter.toLowerCase())
    ) ?? [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📦 Packages</h1>

      <input
        type="text"
        placeholder="Filter by tracking number or status"
        className="border p-2 rounded w-full mb-4"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <div className="grid gap-4">
        {filtered?.map((pkg) => (
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

            <div className="flex gap-2 ml-4">
              {[
                PackageStatus.Created,
                PackageStatus.Sent,
                PackageStatus.Returned,
              ].includes(pkg.status) && (
                <>
                  {pkg.status === PackageStatus.Created && (
                    <>
                      <button
                        className="px-2 py-1 bg-blue-500 text-white rounded"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: pkg.id,
                            newStatus: PackageStatus.Sent,
                          })
                        }
                        disabled={updateStatusMutation.isPending}
                      >
                        Send
                      </button>
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: pkg.id,
                            newStatus: PackageStatus.Canceled,
                          })
                        }
                        disabled={updateStatusMutation.isPending}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {pkg.status === PackageStatus.Sent && (
                    <>
                      <button
                        className="px-2 py-1 bg-green-500 text-white rounded"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: pkg.id,
                            newStatus: PackageStatus.Accepted,
                          })
                        }
                        disabled={updateStatusMutation.isPending}
                      >
                        Accept
                      </button>
                      <button
                        className="px-2 py-1 bg-yellow-500 text-white rounded"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: pkg.id,
                            newStatus: PackageStatus.Returned,
                          })
                        }
                        disabled={updateStatusMutation.isPending}
                      >
                        Return
                      </button>
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: pkg.id,
                            newStatus: PackageStatus.Canceled,
                          })
                        }
                        disabled={updateStatusMutation.isPending}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {pkg.status === PackageStatus.Returned && (
                    <>
                      <button
                        className="px-2 py-1 bg-blue-500 text-white rounded"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: pkg.id,
                            newStatus: PackageStatus.Sent,
                          })
                        }
                        disabled={updateStatusMutation.isPending}
                      >
                        Resend
                      </button>
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: pkg.id,
                            newStatus: PackageStatus.Canceled,
                          })
                        }
                        disabled={updateStatusMutation.isPending}
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
