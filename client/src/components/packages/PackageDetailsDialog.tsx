import { useState } from "react";
import { PackageStatusLabel, PackageStatus } from "../../types/package";
import { usePackage, useUpdateStatus } from "../../api/packages";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface PackageDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  packageId: string | null;
  onStatusUpdate?: () => void;
}

interface StatusUpdateConfirmation {
  isOpen: boolean;
  newStatus: PackageStatus | null;
  description: string;
}

// Consistent with main page icons
const statusIcons: Record<PackageStatus, string> = {
  [PackageStatus.Created]: "📦",
  [PackageStatus.Sent]: "🚚",
  [PackageStatus.Accepted]: "✅",
  [PackageStatus.Returned]: "↩️",
  [PackageStatus.Canceled]: "❌",
};

// Consistent with main page colors
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

export default function PackageDetailsDialog({
  isOpen,
  onClose,
  packageId,
  onStatusUpdate,
}: PackageDetailsDialogProps) {
  const { data: packageData, isLoading, refetch } = usePackage(packageId || "");
  const updateStatusMutation = useUpdateStatus();
  const [confirmation, setConfirmation] = useState<StatusUpdateConfirmation>({
    isOpen: false,
    newStatus: null,
    description: "",
  });

  const handleStatusUpdate = async () => {
    if (!confirmation.newStatus || !packageData) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: packageData.id,
        newStatus: confirmation.newStatus,
      });

      refetch(); // Refresh package data
      onStatusUpdate?.(); // Notify parent component
      setConfirmation({ isOpen: false, newStatus: null, description: "" });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const openConfirmation = (newStatus: PackageStatus) => {
    const statusText = PackageStatusLabel[newStatus];
    const defaultDescription = `Status changed to ${statusText}`;

    setConfirmation({
      isOpen: true,
      newStatus,
      description: defaultDescription,
    });
  };

  const getAvailableTransitions = (
    currentStatus: PackageStatus
  ): PackageStatus[] => {
    switch (currentStatus) {
      case PackageStatus.Created:
        return [PackageStatus.Sent, PackageStatus.Canceled];
      case PackageStatus.Sent:
        return [
          PackageStatus.Accepted,
          PackageStatus.Returned,
          PackageStatus.Canceled,
        ];
      case PackageStatus.Returned:
        return [PackageStatus.Sent, PackageStatus.Canceled];
      case PackageStatus.Accepted:
      case PackageStatus.Canceled:
        return [];
      default:
        return [];
    }
  };

  const getStatusButtonStyle = (status: PackageStatus): string => {
    const baseStyles =
      "px-4 py-2 rounded-lg font-medium transition-colors duration-200";

    switch (status) {
      case PackageStatus.Sent:
        return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700`;
      case PackageStatus.Accepted:
        return `${baseStyles} bg-green-600 text-white hover:bg-green-700`;
      case PackageStatus.Returned:
        return `${baseStyles} bg-yellow-600 text-white hover:bg-yellow-700`;
      case PackageStatus.Canceled:
        return `${baseStyles} bg-red-600 text-white hover:bg-red-700`;
      default:
        return `${baseStyles} bg-gray-600 text-white hover:bg-gray-700`;
    }
  };

  if (!isOpen || !packageId) return null;

  const availableTransitions = packageData
    ? getAvailableTransitions(packageData.status)
    : [];

  return (
    <>
      {/* Main Dialog */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading package details...</p>
            </div>
          ) : (
            packageData && (
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">
                      {statusIcons[packageData.status]}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Package Details
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Tracking Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="text-xl font-bold text-gray-900 font-mono">
                        #{packageData.trackingNumber}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[packageData.status]
                      }`}
                    >
                      {statusIcons[packageData.status]}{" "}
                      {PackageStatusLabel[packageData.status]}
                    </span>
                  </div>
                </div>

                {/* Status Update Actions */}
                {availableTransitions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Update Status
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {availableTransitions.map((status) => (
                        <button
                          key={status}
                          onClick={() => openConfirmation(status)}
                          className={getStatusButtonStyle(status) + ` !text-white !bg-black`}
                          disabled={updateStatusMutation.isPending}
                        >
                          {statusIcons[status]} {PackageStatusLabel[status]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sender & Recipient Info */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      📤 Sender
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Name
                        </p>
                        <p className="text-gray-900">
                          {packageData.senderName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Address
                        </p>
                        <p className="text-gray-900">
                          {packageData.senderAddress}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Phone
                        </p>
                        <p className="text-gray-900">
                          {packageData.senderPhone}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      📥 Recipient
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Name
                        </p>
                        <p className="text-gray-900">
                          {packageData.recipientName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Address
                        </p>
                        <p className="text-gray-900">
                          {packageData.recipientAddress}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Phone
                        </p>
                        <p className="text-gray-900">
                          {packageData.recipientPhone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status History Timeline */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    🕒 Status History
                  </h3>
                  <div className="space-y-4">
                    {packageData.statusHistory.map((history, index) => (
                      <div key={history.id} className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                          {index < packageData.statusHistory.length - 1 && (
                            <div className="w-0.5 h-8 bg-gray-300 ml-1"></div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {statusIcons[history.status]}
                            </span>
                            <p className="font-medium text-gray-900">
                              {PackageStatusLabel[history.status]}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600">
                            {new Date(history.changedAt).toLocaleDateString()}{" "}
                            at{" "}
                            {new Date(history.changedAt).toLocaleTimeString()}
                          </p>
                          {history.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {history.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Created Date */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    📅 Created on{" "}
                    {new Date(packageData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmation.isOpen && confirmation.newStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">
                {statusIcons[confirmation.newStatus]}
              </span>
              <h3 className="text-xl font-bold text-gray-900">
                Confirm Status Update
              </h3>
            </div>

            <p className="text-gray-600 mb-4">
              Are you sure you want to change the status to{" "}
              <strong>{PackageStatusLabel[confirmation.newStatus]}</strong>?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={confirmation.description}
                onChange={(e) =>
                  setConfirmation((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a description for this status change..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() =>
                  setConfirmation({
                    isOpen: false,
                    newStatus: null,
                    description: "",
                  })
                }
                className="px-4 py-2 text-white bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updateStatusMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {updateStatusMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>{statusIcons[confirmation.newStatus]} Confirm Update</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
