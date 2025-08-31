import { useState } from "react";
import { usePackages, useUpdateStatus } from "../api/packages";
import {
  PackageStatus,
  PackageListItem,
  PackageStatusLabel,
} from "../types/package";
import CreatePackageDialog from "../components/packages/CreatePackageDialog";
import PackageDetailsDialog from "../components/packages/PackageDetailsDialog";

const statusColors: Record<PackageStatus, string> = {
  [PackageStatus.Created]: "bg-blue-100 text-blue-800 border border-blue-300",
  [PackageStatus.Sent]:
    "bg-purple-100 text-purple-800 border border-purple-300",
  [PackageStatus.Accepted]:
    "bg-green-100 text-green-800 border border-green-300",
  [PackageStatus.Returned]:
    "bg-yellow-100 text-yellow-800 border border-yellow-300",
  [PackageStatus.Canceled]: "bg-red-100 text-red-800 border border-red-300",
};

const statusIcons: Record<PackageStatus, string> = {
  [PackageStatus.Created]: "📦",
  [PackageStatus.Sent]: "🚚",
  [PackageStatus.Accepted]: "✅",
  [PackageStatus.Returned]: "↩️",
  [PackageStatus.Canceled]: "❌",
};

const buttonStyles = {
  primary:
    "!text-white !bg-black px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium",
  success:
    "!text-white !bg-black px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium",
  warning:
    "!text-white !bg-black px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 font-medium",
  danger:
    "!text-white !bg-black px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium",
  secondary:
    "!text-white !bg-black px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium",
};

export default function PackageList() {
  const { data: packagesData, isLoading, error, refetch } = usePackages();
  const updateStatusMutation = useUpdateStatus();
  const [filter, setFilter] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null
  );

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading packages...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Loading Failed
          </h2>
          <p className="text-gray-600 mb-4">
            Unable to load packages. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );

  const packages = packagesData?.packages || [];
  const totalCount = packagesData?.totalCount || 0;

  const filtered =
    packages?.filter(
      (pkg: PackageListItem) =>
        pkg.trackingNumber.toLowerCase().includes(filter.toLowerCase()) ||
        PackageStatusLabel[pkg.status]
          .toLowerCase()
          .includes(filter.toLowerCase())
    ) ?? [];

  const handlePackageClick = (packageId: string) => {
    setSelectedPackageId(packageId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg">
                  📦
                </span>
                Package Tracker
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and track your packages
              </p>
            </div>

            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
            >
              <span>+</span>
              Create Package
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            {Object.entries(PackageStatus)
              .filter(([key, value]) => typeof value === "number") // Only number values
              .map(([key, status]) => (
                <div
                  key={key}
                  className="text-center p-3 bg-gray-100 rounded-lg"
                >
                  <div className="text-2xl">
                    {statusIcons[status as PackageStatus]}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {key} {/* Use the string key directly */}
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {packages?.filter((p) => p.status === status).length || 0}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <label
                htmlFor="filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Search Packages
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
                <input
                  id="filter"
                  type="text"
                  placeholder="Search by tracking number or status..."
                  className="pl-10 text-black pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <span className="text-sm text-gray-600 self-center">
                Total packages: {totalCount}
              </span>
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {filter ? "No packages found" : "No packages yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter
                ? "Try adjusting your search filter"
                : "Create your first package to get started"}
            </p>
            {!filter && (
              <button
                onClick={() => setIsCreateDialogOpen(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Create First Package
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg hover:scale-[1.02] transition-transform duration-200 cursor-pointer transition-shadow duration-200 p-6 border border-gray-100"
                onClick={() => handlePackageClick(pkg.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-2xl">{statusIcons[pkg.status]}</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusColors[pkg.status]
                    }`}
                  >
                    {PackageStatusLabel[pkg.status]}
                  </span>
                </div>

                {/* Package Info */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Tracking Number
                    </label>
                    <p className="font-mono text-lg font-bold text-gray-900">
                      #{pkg.trackingNumber}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        From
                      </label>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {pkg.senderName}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        To
                      </label>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {pkg.recipientName}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Created
                    </label>
                    <p className="text-sm text-gray-600">
                      {new Date(pkg.createdAt).toLocaleDateString()} at{" "}
                      {new Date(pkg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {[
                      PackageStatus.Created,
                      PackageStatus.Sent,
                      PackageStatus.Returned,
                    ].includes(pkg.status) && (
                      <>
                        {pkg.status === PackageStatus.Created && (
                          <>
                            <button
                              className={buttonStyles.primary}
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: pkg.id,
                                  newStatus: PackageStatus.Sent,
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              📤 Send
                            </button>
                            <button
                              className={buttonStyles.danger}
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: pkg.id,
                                  newStatus: PackageStatus.Canceled,
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              ❌ Cancel
                            </button>
                          </>
                        )}
                        {pkg.status === PackageStatus.Sent && (
                          <>
                            <button
                              className={buttonStyles.success}
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: pkg.id,
                                  newStatus: PackageStatus.Accepted,
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              ✅ Accept
                            </button>
                            <button
                              className={buttonStyles.warning}
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: pkg.id,
                                  newStatus: PackageStatus.Returned,
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              ↩️ Return
                            </button>
                            <button
                              className={buttonStyles.danger}
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: pkg.id,
                                  newStatus: PackageStatus.Canceled,
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              ❌ Cancel
                            </button>
                          </>
                        )}
                        {pkg.status === PackageStatus.Returned && (
                          <>
                            <button
                              className={buttonStyles.primary}
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: pkg.id,
                                  newStatus: PackageStatus.Sent,
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              📤 Resend
                            </button>
                            <button
                              className={buttonStyles.danger}
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: pkg.id,
                                  newStatus: PackageStatus.Canceled,
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              ❌ Cancel
                            </button>
                          </>
                        )}
                      </>
                    )}
                    {(pkg.status === PackageStatus.Accepted ||
                      pkg.status === PackageStatus.Canceled) && (
                      <span className="text-sm text-gray-500 italic">
                        No actions available
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <CreatePackageDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onCreated={refetch}
        />

        <PackageDetailsDialog
          isOpen={!!selectedPackageId}
          onClose={() => setSelectedPackageId(null)}
          packageId={selectedPackageId}
        />
      </div>
    </div>
  );
}
