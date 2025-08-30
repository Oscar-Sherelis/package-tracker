import { useState } from "react";
import { useCreatePackage } from "../../api/packages";
import { CreatePackageInput } from "../../types/package";

interface CreatePackageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreatePackageDialog({
  isOpen,
  onClose,
  onCreated,
}: CreatePackageDialogProps) {
  const [formData, setFormData] = useState<CreatePackageInput>({
    senderName: "",
    senderAddress: "",
    senderPhone: "",
    recipientName: "",
    recipientAddress: "",
    recipientPhone: "",
  });
  const createPackage = useCreatePackage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPackage.mutateAsync(formData);
      setFormData({
        senderName: "",
        senderAddress: "",
        senderPhone: "",
        recipientName: "",
        recipientAddress: "",
        recipientPhone: "",
      });
      onCreated();
      onClose();
    } catch (error) {
      console.error("Failed to create package:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Package</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sender Information */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Sender Name
            </label>
            <input
              type="text"
              required
              value={formData.senderName}
              onChange={(e) =>
                setFormData({ ...formData, senderName: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Sender Address
            </label>
            <input
              type="text"
              required
              value={formData.senderAddress}
              onChange={(e) =>
                setFormData({ ...formData, senderAddress: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Sender Phone
            </label>
            <input
              type="tel"
              required
              value={formData.senderPhone}
              onChange={(e) =>
                setFormData({ ...formData, senderPhone: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Recipient Information */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Recipient Name
            </label>
            <input
              type="text"
              required
              value={formData.recipientName}
              onChange={(e) =>
                setFormData({ ...formData, recipientName: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Recipient Address
            </label>
            <input
              type="text"
              required
              value={formData.recipientAddress}
              onChange={(e) =>
                setFormData({ ...formData, recipientAddress: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Recipient Phone
            </label>
            <input
              type="tel"
              required
              value={formData.recipientPhone}
              onChange={(e) =>
                setFormData({ ...formData, recipientPhone: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPackage.isPending}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {createPackage.isPending ? "Creating..." : "Create Package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
