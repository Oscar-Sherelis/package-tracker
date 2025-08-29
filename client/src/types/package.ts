export enum PackageStatus {
  Created = 0,
  Sent = 1,
  Accepted = 2,
  Returned = 3,
  Canceled = 4,
}

export const PackageStatusLabel: Record<PackageStatus, string> = {
  [PackageStatus.Created]: "Created",
  [PackageStatus.Sent]: "Sent",
  [PackageStatus.Accepted]: "Accepted",
  [PackageStatus.Returned]: "Returned",
  [PackageStatus.Canceled]: "Canceled",
};

export type StatusHistory = {
  id: string;
  packageId: string;
  status: PackageStatus;
  changedAt: string;
  description?: string;
};

export interface PackageListItem {
  id: string;
  trackingNumber: string;
  senderName: string;
  recipientName: string;
  status: PackageStatus;
  createdAt: string;
}

export interface StatusItem {
  status: PackageStatus;
  timestamp: string;
}

export interface PackageDetails extends Omit<PackageListItem, "status"> {
  status: PackageStatus;
  senderAddress: string;
  senderPhone: string;
  recipientAddress: string;
  recipientPhone: string;
  statusHistory: StatusItem[];
  createdAt: string;
  allowedTransitions: PackageStatus[];
}

export interface CreatePackageInput {
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  recipientName: string;
  recipientAddress: string;
  recipientPhone: string;
}
