import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import {
  CreatePackageInput,
  PackageDetails,
  PackageListItem,
  PackageStatus,
} from "../types/package";

export async function listPackages(params?: {
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}) {
  try {
    const res = await api.get<{
      packages: PackageListItem[];
      totalCount: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
      hasNext: boolean;
      hasPrevious: boolean;
    }>("/package", { params });
    return res.data ?? [];
  } catch (error) {
    console.error("API error (listPackages):", error);
    throw new Error("Unable to load packages. Please try again.");
  }
}

export async function getPackage(id: string) {
  try {
    const res = await api.get<PackageDetails>(`/package/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Failed to fetch package ${id}:`, error);
    throw new Error("Package not found or unable to load details.");
  }
}

export async function createPackage(payload: CreatePackageInput) {
    try {
  const generateTrackingPreview = (): string => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `TRK${day}${random}`;
  };
  payload.trackingNumber = generateTrackingPreview();
  const res = await api.post<PackageDetails>("/package", payload);
  return res.data;
    } catch (error) {
    console.error("Failed to create package:", error);
    throw new Error("Failed to create package. Please check your input.");
  }
}

export async function changeStatus(id: string, newStatus: PackageStatus) {
  try {
    const res = await api.put<PackageDetails>(`/package/${id}/status`, {
      newStatus,
    });
    return res.data;
  } catch (error) {
    console.error(`Failed to update status for package ${id}:`, error);
    throw new Error("Failed to update package status.");
  }
}

// React Query hooks
export const usePackages = (params?: {
  status?: PackageStatus;
  tracking?: string;
}) =>
  useQuery({
    queryKey: ["packages", params],
    queryFn: () => listPackages(params),
  });

export const usePackage = (id: string) =>
  useQuery({
    queryKey: ["package", id],
    queryFn: () => getPackage(id),
    enabled: !!id,
  });

export const useCreatePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPackage,
    onSuccess: (newPackage) => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });

      // Pre-set the new package data to avoid refetch
      queryClient.setQueryData(["package", newPackage.id], newPackage);
    },
    onError: (error: Error) => {
      console.error("Create package error:", error.message);
    },
  });
};

export const useUpdateStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: PackageStatus }) =>
      changeStatus(id, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    },

    onError: (error: Error, variables) => {
      console.error(
        `Status update failed for package ${variables.id}:`,
        error.message
      );
    },
  });
};
