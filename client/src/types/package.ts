export enum PackageStatus {
  Created = "Created",
  Sent = "Sent",
  Accepted = "Accepted",
  Returned = "Returned",
  Canceled = "Canceled",
}

export interface StatusHistory {
  id: string;
  packageId: string;
  status: PackageStatus;
  timestamp: string;
}

export interface PackageListItem {
  id: string;
  trackingNumber: string;
  senderName: string;
  recipientName: string;
  status: PackageStatus;
  currentStatus: PackageStatus;
  createdAt: string;
}

export interface StatusHistoryItem {
  status: PackageStatus;
  timestamp: string;
}

export interface PackageDetails extends Omit<PackageListItem, "currentStatus"> {
  currentStatus: PackageStatus;
  senderAddress: string;
  senderPhone: string;
  recipientAddress: string;
  recipientPhone: string;
  statusHistory: StatusHistoryItem[];
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
