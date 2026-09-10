export type AccountStatus = "MISSING" | "UPLOADED" | "OUTDATED";
export type StatusFilterValue = "ALL" | AccountStatus;

export interface Provider {
  id: number;
  name: string;
}

export interface Statement {
  fileName: string;
  uploadedAt: string;
}

export interface Account {
  id: number;
  providerId: number;
  statement: Statement | null;
}

export interface AccountView extends Account {
  providerName: string;
  status: AccountStatus;
}
