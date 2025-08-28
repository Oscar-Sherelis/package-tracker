import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import { Package, PackageStatus } from "../types/package";

// 🔹 Fetch all packages
export const usePackages = () =>
  useQuery<Package[]>({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await api.get<Package[]>("/package");
      return res.data;
    },
  });

// 🔹 Update status
export const useUpdateStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<
    void, // no return body expected
    Error, // error type
    { id: string; newStatus: PackageStatus } // variables
  >({
    mutationFn: async ({ id, newStatus }) =>
      api.put(`/package/${id}/status?newStatus=${newStatus}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
  });
};
