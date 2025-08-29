import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import {
  CreatePackageInput,
  PackageDetails,
  PackageListItem,
  PackageStatus,
} from "../types/package";

// API functions (reusable)
export async function listPackages(params?: {
  status?: PackageStatus;
  tracking?: string;
}) {
  const res = await api.get<PackageListItem[]>("/package", { params });
  return res.data;
}

export async function getPackage(id: string) {
  const res = await api.get<PackageDetails>(`/package/${id}`);
  return res.data;
}

export async function createPackage(payload: CreatePackageInput) {
  const res = await api.post<PackageDetails>("/package", payload);
  return res.data;
}

export async function changeStatus(id: string, newStatus: PackageStatus) {
  const res = await api.post<PackageDetails>(`/package/${id}/status`, {
    newStatus,
  });
  return res.data;
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
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
  });
};
