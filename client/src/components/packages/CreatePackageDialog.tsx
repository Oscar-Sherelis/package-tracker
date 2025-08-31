import { useState } from "react";
import { useCreatePackage } from "../../api/packages";
import { CreatePackageInput } from "../../types/package";
import { XMarkIcon } from "@heroicons/react/24/outline";

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

  const [errors, setErrors] = useState<
    Partial<Record<keyof CreatePackageInput, string>>
  >({});
  const createPackage = useCreatePackage();

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreatePackageInput, string>> = {};

    if (!formData.senderName.trim()) {
      newErrors.senderName = "Sender name is required";
    }

    if (!formData.senderAddress.trim()) {
      newErrors.senderAddress = "Sender address is required";
    }

    if (!formData.senderPhone.trim()) {
      newErrors.senderPhone = "Sender phone is required";
    } else if (
      !/^[\+]?[1-9][\d]{0,15}$/.test(
        formData.senderPhone.replace(/[\s\-\(\)]/g, "")
      )
    ) {
      newErrors.senderPhone = "Please enter a valid phone number";
    }

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = "Recipient name is required";
    }

    if (!formData.recipientAddress.trim()) {
      newErrors.recipientAddress = "Recipient address is required";
    }

    if (!formData.recipientPhone.trim()) {
      newErrors.recipientPhone = "Recipient phone is required";
    } else if (
      !/^[\+]?[1-9][\d]{0,15}$/.test(
        formData.recipientPhone.replace(/[\s\-\(\)]/g, "")
      )
    ) {
      newErrors.recipientPhone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

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
      setErrors({});
      onCreated();
      onClose();
    } catch (error) {
      console.error("Failed to create package:", error);
    }
  };

  const handleInputChange = (
    field: keyof CreatePackageInput,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhoneInput = (
    field: "senderPhone" | "recipientPhone",
    value: string
  ) => {
    // Basic phone number formatting
    const cleaned = value.replace(/\D/g, "");
    let formatted = cleaned;

    if (cleaned.length > 0) {
      formatted = cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    }

    handleInputChange(field, formatted);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Create New Package
          </h2>
          <button
            onClick={onClose}
            className="text-gray-100 !bg-black hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          {/* Sender Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Sender Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.senderName}
                  onChange={(e) =>
                    handleInputChange("senderName", e.target.value)
                  }
                  className={`w-full !text-black px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.senderName ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="John Doe"
                />
                {errors.senderName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.senderName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium !text-black mb-2">
                  Address *
                </label>
                <textarea
                  value={formData.senderAddress}
                  onChange={(e) =>
                    handleInputChange("senderAddress", e.target.value)
                  }
                  rows={3}
                  className={`w-full !text-black px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.senderAddress ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="123 Main St, City, State ZIP"
                />
                {errors.senderAddress && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.senderAddress}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.senderPhone}
                  onChange={(e) =>
                    handlePhoneInput("senderPhone", e.target.value)
                  }
                  className={`w-full !text-black px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.senderPhone ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="(555) 123-4567"
                />
                {errors.senderPhone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.senderPhone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Recipient Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Recipient Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) =>
                    handleInputChange("recipientName", e.target.value)
                  }
                  className={`w-full !text-black px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.recipientName ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Jane Smith"
                />
                {errors.recipientName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.recipientName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium !text-black mb-2">
                  Address *
                </label>
                <textarea
                  value={formData.recipientAddress}
                  onChange={(e) =>
                    handleInputChange("recipientAddress", e.target.value)
                  }
                  rows={3}
                  className={`w-full !text-black px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.recipientAddress
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="456 Oak St, City, State ZIP"
                />
                {errors.recipientAddress && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.recipientAddress}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.recipientPhone}
                  onChange={(e) =>
                    handlePhoneInput("recipientPhone", e.target.value)
                  }
                  className={`w-full !text-black px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.recipientPhone ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="(555) 987-6543"
                />
                {errors.recipientPhone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.recipientPhone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 !text-white !bg-black hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPackage.isPending}
              className="px-6 py-3 !text-white !bg-black rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
            >
              {createPackage.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <span>📦</span>
                  Create Package
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
