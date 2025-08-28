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

export interface Package {
  id: string;
  trackingNumber: string;
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  recipientName: string;
  recipientAddress: string;
  recipientPhone: string;
  status: PackageStatus;
  createdAt: string;
  history: StatusHistory[];
}
